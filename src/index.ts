import { onigiricss } from './css'
import { PlayerBaseHtml, onigiriRightTopActions } from './html'
import {
    parseVTTSettings,
    turnOnSubtitles,
    turnOffSubtitles,
    truncate,
    formatTime,
    getBrowser
} from './utils'

import type {
    Options,
    Position,
    ControlBarState,
    VolumeState,
    Chapter
} from './types'

class Onigiri {
    QuerySelectorPlayer: string;
    Options: Options;
    isScrubbing: boolean = false;
    isScrubbingVolume: boolean = false;
    wasPaused: boolean = false;
    lastMousePosition: Position = { x: 0, y: 0 };
    connectionBitrate: number = 0;
    videoBitrate: number = 0;
    controlBarState: ControlBarState = {
        isShowing: true,
        isMouseOver: false,
        isHideable: true,
    };
    qualityChangebale = false;
    //@ts-ignore
    playButton: HTMLButtonElement;
    //@ts-ignore
    onVidControls: HTMLDivElement;
    //@ts-ignore
    overlay: HTMLDivElement;
    browser: string = "";
    volumeCurrentState: VolumeState = "up";

    /**
     * @class `Onigiri`
     *
     * This is the class that is used to create the
     * video player.
     *
     * ```ts
     * const player = new Onigiri("#video", ...)
     * await player.load()
     * ```
     * ```html
     * <div id="video"></div>
     * ```
     *
     * The load function is asynchronus. It needs to
     * access the `DOM`
     */
    constructor(querySelector: string, options: Options) {
        // This is the constructor.
        this.QuerySelectorPlayer = querySelector;
        this.Options = options;
        this.load();
    }

    // load the player
    async load() {
        // check if the source is valid
        // if (this.Options.source) {
        //     let isReachable = await this.checkReachable(this.Options.source.src);
        //     if (!isReachable) {
        //         this.showWarning("Source not reachable", "The source is not reachable, please check the source url.");
        //         return;
        //     }
        // }
        // if quality options is an empty array, then set it to null
        if (this.Options.quality?.options.length === 0) {
            console.log("Quality options is empty, setting it to null");
        } else {
            this.qualityChangebale = true;
        }

        // select the html element
        const pl = document.querySelector(this.QuerySelectorPlayer) as HTMLDivElement;
        pl ? pl : console.error("Player not found");
        this.setCss(pl);
        // set the html
        pl.innerHTML = PlayerBaseHtml;
        // browser
        this.browser = getBrowser();
        // overlay
        this.overlay = pl.querySelector(".onigiri-overlay") as HTMLDivElement;
        // set the controls
        this.controlsHtml(pl);

        // set the video
        const video = pl.querySelector("#onigiri-video") as HTMLVideoElement;
        if (this.browser === "safari") {
            video.setAttribute("preload", "metadata")
        }
        // set the source
        this.Options.source.src.forEach((source) => {
            const sourceElem = document.createElement('source') as HTMLSourceElement
            sourceElem.src = source.href
            sourceElem.type = source.type
            video.appendChild(sourceElem)
        })
        if (this.Options.source.crossorigin) {
            video.crossOrigin = this.Options.source.crossorigin
        }

        // set attributes
        if (this.Options.attr) {
            for (const attrName in this.Options.attr) {
                const attrValue = this.Options.attr[attrName]?.toString();
                video.setAttribute(attrName, attrValue? attrValue : "");
            }

        }
        // bind key events
        this.bindkeyDownEventForVideo(video, pl);
        // console.log(navigator.userAgent);
        // Captions
        let numberOfSubtitles = 0;
        if (this.Options.tracks) {
            // console.log(this.Options.tracks);
            for (const track of this.Options.tracks) {
                if (track.kind === 'subtitles') {
                    numberOfSubtitles++;
                    if (track.type === 'text/json') {
                        // fetch the subtitles from the src
                        // @ts-ignore
                        const response = await (await fetch(track.src)).json();
                        const subBoxList = pl.querySelector('.onigiri-subBox_list') as HTMLDivElement;
                        const subBoxListButton = document.createElement('button');
                        subBoxListButton.classList.add('onigiri-subBox_item');
                        subBoxListButton.innerText = track.label;
                        // create a property data-subtitle in the button
                        // @ts-ignore
                        subBoxListButton.setAttribute('data-subtitle', track.srclang);
                        // add the button to the subBoxList
                        subBoxList.appendChild(subBoxListButton);

                        // add the track to the video
                        // video.appendChild(trackElement);
                        // create a new text track
                        const textTrack = video.addTextTrack('subtitles', track.label, track.srclang);
                        textTrack.mode = 'hidden';
                        // add the subtitles to the text track
                        for (const subtitle of response) {
                            if (subtitle.type === 'cue') {
                                let cue = new VTTCue(subtitle.data.start / 1000, subtitle.data.end / 1000, subtitle.data.text);
                                if (subtitle.data.settings) {
                                    cue = parseVTTSettings(subtitle.data.settings, cue);
                                }
                                textTrack.addCue(cue);
                            }
                        }
                    } if (track.type === 'text/vtt') {
                        // add a new track to the video with the src
                        const trackElement = document.createElement('track');
                        const subBoxList = pl.querySelector('.onigiri-subBox_list') as HTMLDivElement;
                        const subBoxListButton = document.createElement('button');
                        subBoxListButton.classList.add('onigiri-subBox_item');
                        subBoxListButton.innerText = track.label;
                        // create a property data-subtitle in the button
                        // @ts-ignore
                        subBoxListButton.setAttribute('data-subtitle', track.srclang);
                        // add the button to the subBoxList
                        subBoxList.appendChild(subBoxListButton);
                        trackElement.kind = track.kind;
                        trackElement.label = track.label;
                        trackElement.srclang = track.srclang as string;
                        trackElement.src = track.src as string;
                        trackElement.default = track.default as boolean;
                        video.appendChild(trackElement);
                    } else {
                        console.error('Unsupported track type');
                    }
                } else if (track.kind === 'chapter') {
                    this.addChapterEvent(track, video);
                }
            }
        }

        // controlBar
        const controlBar = pl.querySelector(".onigiri-controlBar") as HTMLDivElement;

        // captions button
        const captionsButton = pl.querySelector(".onigiri-captionButton") as HTMLButtonElement;
        const subBox = pl.querySelector('.onigiri-subs-choice-box') as HTMLDivElement;
        captionsButton.addEventListener('click', () => {
            this.showControls(pl);
            this.animateClickAction(captionsButton);
            const controlsBarBounderies = controlBar.getBoundingClientRect();
            // aplly the right position to the subBox
            subBox.style.right = `${window.innerWidth - controlsBarBounderies.right}px`;
            subBox.style.bottom = `${window.innerHeight - controlsBarBounderies.top + 10}px`;
            subBox.classList.toggle('show');
            if (subBox.classList.contains('show')) {
                this.controlBarState.isHideable = false;
            } else {
                this.controlBarState.isHideable = true;
            }
        });


        const subBoxList = pl.querySelector('.onigiri-subBox_list') as HTMLDivElement;
        subBoxList.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            if (target.classList.contains('selected')) {
                target.classList.toggle('selected');
                this.animateClickAction(target);
                // turn off the subtitles
                turnOffSubtitles(video, captionsButton);
                console.log('off');
            } else {
                // remove the selected class from all the buttons
                const subBoxListButtons = subBoxList.querySelectorAll('button');
                // @ts-ignore
                for (const subBoxListButton of subBoxListButtons) {
                    if (subBoxListButton.classList.contains('selected')) {
                        subBoxListButton.classList.toggle('selected');
                    }
                }
                // add the selected class to the target button
                target.classList.add('selected');
                this.animateClickAction(target);
                // turn on the subtitles
                turnOnSubtitles(this, pl, video, target.getAttribute('data-subtitle') as string, captionsButton);
                console.log('on ' + target.dataset.subtitle);
            }
        });

        // find in the tracks options where the default is true save his srclang
        let defaultTrack = '';
        if (this.Options.tracks) {
            for (const track of this.Options.tracks) {
                // @ts-ignore
                if (track.default) {
                    // @ts-ignore
                    defaultTrack = track.srclang;
                }
            }
        }

        turnOnSubtitles(this, pl, video, defaultTrack, captionsButton);
        // toggle selected class on the defaultTrack button
        const subBoxListButtons = subBoxList.querySelectorAll('button');
        // @ts-ignore
        for (const subBoxListButton of subBoxListButtons) {
            if (subBoxListButton.getAttribute('data-subtitle') === defaultTrack) {
                subBoxListButton.classList.toggle('selected');
            }
        }

        if (numberOfSubtitles == 0) {
            // remove the captions button from the controlBar
            captionsButton.remove();
        }

        // on resize
        window.addEventListener('resize', () => {
            const controlsBarBounderies = controlBar.getBoundingClientRect();
            // aplly the right position to the subBox
            subBox.style.right = `${window.innerWidth - controlsBarBounderies.right}px`;
            subBox.style.bottom = `${window.innerHeight - controlsBarBounderies.top + 10}px`;
        });

        controlBar.addEventListener("mouseover", () => {
            this.showControls(pl);
            this.controlBarState.isMouseOver = true;
        });

        controlBar.addEventListener("mouseout", () => {
            this.controlBarState.isMouseOver = false;
        });

        // if subBox has the class show, show the controls

        subBox.addEventListener('mouseover', () => {
            this.showControls(pl);
        });

        if (subBox.classList.contains('show')) {
            this.showControls(pl);
        }

        video.addEventListener("loadedmetadata", () => {
            // set the duration
            const duration = pl.querySelector(".onigiri-total-time span") as HTMLSpanElement;
            // @ts-ignore
            if (!this.Options.isLive) {
                duration.innerText = formatTime(video.duration);
            }
        });

        // when the video is getting data from the server show the loading spinner
        video.addEventListener("waiting", () => {
            const loadingBar = pl.querySelector(".onigiri-loading") as HTMLDivElement;
            loadingBar.classList.add('load');
        });

        // when the video is getting data from the server hide the loading spinner
        video.addEventListener("playing", () => {
            const loadingBar = pl.querySelector(".onigiri-loading") as HTMLDivElement;
            loadingBar.classList.remove('load');
        });

        pl.onmousemove = (e) => {
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
            // show the controls
            this.showControls(pl);
            // show mouse
            pl.style.cursor = "default";
            // sleep for 2 seconds
            let currentMousePosition = { x: e.clientX, y: e.clientY };
            setTimeout(() => {
                if (this.lastMousePosition.x === currentMousePosition.x && this.lastMousePosition.y === currentMousePosition.y) {
                    this.hideControls(pl);
                    // hide mouse
                    if (this.controlBarState.isHideable) pl.style.cursor = "none";
                }
            }, 2000);
        }

        pl.addEventListener("mouseleave", () => {
            // hide the controls
            setTimeout(() => {
                this.hideControls(pl);
            }, 2000);
        });

        pl.addEventListener("mouseenter", () => {
            // show the controls
            this.showControls(pl);
        });

        video.addEventListener("click", async () => {
            // show the controls
            this.showControls(pl);
            await this.togglePlayPause(video)
        });

        video.onseeking = () => {
            // show the controls
            this.showControls(pl);
        }

        video.addEventListener("ended", () => {
            // show the controls
            this.showControls(pl);
            // trigger event videoEnded
            this.triggerEvent('videoEnded');
        });

        // overlay
        let epsInit = false
        if (this.Options.videoName) {
            this.overlay.innerHTML += `
                    <div class="onigiri-top-left-infos">
                        <div class="onigiri-title">
                            <h1>${this.Options.videoName}</h1>
                        </div>
                    </div>`;

        } else if (this.Options.title) {
            this.overlay.innerHTML += `
                    <div class="onigiri-top-left-infos">
                        <div class="onigiri-title">
                            <h1>${this.Options.title}</h1>
                        </div>
                    </div>`;
        } else {
            this.overlay.innerHTML += `
                    <div class="onigiri-top-left-infos">
                        <div class="onigiri-title">
                            <h1>${video.getAttribute("title") ? video.getAttribute("title") : ""}</h1>
                        </div>
                    </div>`;
        }
        if (this.Options.season) {
            const topLeftInfos = pl.querySelector(".onigiri-top-left-infos") as HTMLDivElement;
            topLeftInfos.innerHTML += `
                    <div class="onigiri-episode-infos">
                        <div class="onigiri-season">
                            <p class="onigiri-season-number">S${this.Options.season}</p>
                        </div>
                    </div>
                    `;
            if (this.Options.episode) {
                epsInit = true
                const episodeInfos = pl.querySelector(".onigiri-episode-infos") as HTMLDivElement;
                episodeInfos.innerHTML += `
                        <div class="onigiri-eps">
                            <span class="onigiri-eps-number">E${this.Options.episode}</span>
                        </div>
                        `;
                if (this.Options.episodeName) {
                    const eps = pl.querySelector(".onigiri-eps") as HTMLDivElement;
                    eps.innerHTML += `
                            <span class="sep-eps">-</span>
                            <span class="onigiri-eps-title">${truncate(40, this.Options.episodeName)}</span>
                            `;
                }
            }
        } else if (this.Options.episode && !epsInit) {
            epsInit = true
            const topLeftInfos = pl.querySelector(".onigiri-top-left-infos") as HTMLDivElement;
            topLeftInfos.innerHTML += `
                    <div class="onigiri-episode-infos">
                        <div class="onigiri-eps">
                            <span class="onigiri-eps-number">E${this.Options.episode}</span>
                        </div>
                    </div>
                    `;
            if (this.Options.episodeName) {
                const eps = pl.querySelector(".onigiri-eps") as HTMLDivElement;
                eps.innerHTML += `
                        <span class="sep-eps">-</span>
                        <span class="onigiri-eps-title">${this.Options.episodeName}</span>
                        `;
            }
        }
        if (this.Options.alternateName && !epsInit) {
            const alternateName = pl.querySelector(".onigiri-top-left-infos") as HTMLDivElement;
            alternateName.innerHTML += `
                    <div class="onigiri-episode-infos">
                        <div class="onigiri-eps">
                            <span class="onigiri-eps-title">${this.Options.alternateName}</span>
                        </div>
                    </div>
                        `;
        }
        // right panel
        this.overlay.innerHTML += onigiriRightTopActions;
        // right controls
        // set volume
        const volumeButton = pl.querySelector(".onigiri-volume") as HTMLButtonElement;
        volumeButton.classList.add(this.volumeCurrentState);
        // console.log(this.volumeButton);
        const volumeSlider = pl.querySelector(".vol-slider") as HTMLDivElement;
        // console.log(this.volumeSlider);
        const sliderRange = pl.querySelector(".onigiri-volume-range") as HTMLDivElement;
        // console.log(this.sliderRange);

        // set the play button
        this.playButton = pl.querySelector(".onigiri-playpause") as HTMLButtonElement;
        this.onVidControls = pl.querySelector(".onigiri-onVidControls") as HTMLDivElement;
        this.playButton.addEventListener("click", async () => {
            await this.togglePlayPause(video);
        });

        video.addEventListener("volumechange", () => {
            if (video.volume === 0 && this.volumeCurrentState !== "mute") {
                volumeButton.classList.remove(this.volumeCurrentState);
                this.volumeCurrentState = "mute";
                volumeButton.classList.add(this.volumeCurrentState);
            } else if (video.volume > 0 && video.volume < 0.5) {
                volumeButton.classList.remove(this.volumeCurrentState);
                this.volumeCurrentState = "down";
                volumeButton.classList.add(this.volumeCurrentState);
            } else if (video.volume > 0.5) {
                volumeButton.classList.remove(this.volumeCurrentState);
                this.volumeCurrentState = "up";
                volumeButton.classList.add(this.volumeCurrentState);
            }
            // change the volume slider proprety --value
            sliderRange.style.setProperty("--value", `${video.volume}`);
        });
        video.addEventListener("muted", () => {
            volumeButton.classList.remove(this.volumeCurrentState);
            this.volumeCurrentState = "mute";
            volumeButton.classList.add(this.volumeCurrentState);
        });

        volumeButton.addEventListener("click", () => {
            this.animateClickAction(volumeButton);
            volumeButton.classList.toggle("active");
            volumeSlider.classList.toggle("active");
            if (volumeButton.classList.contains("active")) {
                this.controlBarState.isHideable = false;
            } else {
                this.controlBarState.isHideable = true;
            }
        });

        // Quit button
        if (!this.Options.onQuit) {
            // remove the element from the dom
            const QuitButton = pl.querySelector(".onigiri-quit") as HTMLButtonElement;
            QuitButton.remove();
        } else {
            const QuitButton = pl.querySelector(".onigiri-quit") as HTMLButtonElement;
            this.triggerEvent("quit", {player: pl, video: video})
            QuitButton.addEventListener("click", () => {
                if (this.Options.onQuit) this.Options.onQuit(this, video);
            });
        }


        volumeSlider.addEventListener("click", (e) => {
            this.handleSliderClick(e, video, volumeSlider, sliderRange);
        });

        volumeSlider.addEventListener("mousemove", (e) => {
            if (this.isScrubbingVolume) {
                e.preventDefault();
            }
        });

        volumeSlider.addEventListener("mousedown", (e) => {
            this.toggleScrubbingSlider(e, volumeSlider, sliderRange, video);
        });

        document.addEventListener("mouseup", (e) => {
            if (this.isScrubbingVolume) this.toggleScrubbingSlider(e, volumeSlider, sliderRange, video);
        });

        document.addEventListener("mousemove", (e) => {
            if (this.isScrubbingVolume) this.handleSliderClick(e, video, volumeSlider, sliderRange);
        });

        video.onpause = () => {
            // show the controls
            if (!this.controlBarState.isShowing) {
                this.showControls(pl);
            }
            this.playButton.classList.remove("pause");
            this.playButton.classList.add("play");
            this.animateClickAction(this.playButton);
        };

        video.onplay = () => {
            if (!this.controlBarState.isShowing) {
                this.showControls(pl);
            }
            this.playButton.classList.remove("play");
            this.playButton.classList.add("pause");
            this.animateClickAction(this.playButton);
        };

        // set the next button
        if (pl.querySelector(".onigiri-next")) {
            const nextButton = pl.querySelector(".onigiri-next") as HTMLButtonElement;
            nextButton.addEventListener("click", () => {
                this.animateClickAction(nextButton);
                console.log("next");
            });
        }

        // set the current time and progress bar
        video.addEventListener("timeupdate", () => {
            const currentTime = pl.querySelector(".onigiri-current-time span") as HTMLSpanElement;
            const totTime = pl.querySelector(".onigiri-total-time span") as HTMLSpanElement;
            totTime.innerText = `-${formatTime(video.duration - video.currentTime)}`;
            currentTime.innerText = formatTime(video.currentTime);
            const progress = pl.querySelector(".onigiri-timeline") as HTMLDivElement;
            const p = pl.querySelector(".onigiri") as HTMLDivElement;
            // --progress-position is between 0 and 100
            let intermadiate = (video.currentTime / video.duration) * 100
            progress.style.setProperty("--progress-position", `${intermadiate.toFixed(1)}`);
        });

        // set the click on the progress bar
        const progress = pl.querySelector(".onigiri-timeline") as HTMLDivElement;
        progress.addEventListener("click", (e) => {
            this.handleTimelineUpdate(e, progress, video);
        });

        progress.addEventListener("mousemove", (e) => {
            if (this.isScrubbing) {
                e.preventDefault();
            }
        });

        progress.addEventListener("mousedown", async (e) => {
            await this.toggleScrubbing(e, progress, video);
        });

        document.addEventListener("mouseup", async (e) => {
            if (this.isScrubbing) await this.toggleScrubbing(e, progress, video);
        });

        document.addEventListener("mousemove", (e) => {
            if (this.isScrubbing) this.handleTimelineUpdate(e, progress, video);
        });

        // on leave page for firefox and safari (not chrome) to stop the video from playing in the background and flushing the buffer
        window.addEventListener("beforeunload", () => {
            video.pause();
            video.removeAttribute("src");
        });

        // send ready event
        this.triggerEvent("ready", { player: this });
        if (this.Options.onReady) this.Options.onReady(this);
    }

    addChapterEvent(chapter: Chapter, video: HTMLVideoElement) {
        // The `chapterchange` event will be emmited when the current time is between the `start` and `end` of the chapter.
        // The event will have a `detail` object with `label`, `data` and `skippable` properties from the chapter.
        let detail = {
            name: chapter.name,
            label: chapter.label,
            data: chapter.data,
            skippable: chapter.skippable
        };
        video.ontimeupdate = () => {
            if (video.currentTime > chapter.start && video.currentTime < chapter.end) {
                this.triggerEvent('chapterchange', detail);
            }
        }
    }



    triggerEvent(eventName: string, detail: any = null) {
        const event = new CustomEvent(eventName, { detail: detail });
        document.dispatchEvent(event);
    }

    addEventListener(eventName: string, callback: any) {
        document.addEventListener(eventName, callback);
    }

    calculateConnectionBitrate(video: HTMLVideoElement) {
        const currentTime = video.currentTime;
        const currentBitrate = video.getVideoPlaybackQuality().totalVideoFrames / currentTime;
        this.connectionBitrate = currentBitrate;
    }

    showWarning(title: string, message: string) {
        const warning = document.querySelector(".onigiri-warning") as HTMLDivElement;
        const warningText = warning.querySelector(".onigiri-warning-text") as HTMLSpanElement;
        const warningTitle = warning.querySelector(".onigiri-warning-title") as HTMLSpanElement;
        warningTitle.innerText = title;
        warningText.innerText = message;
        warning.classList.toggle("show");
        setTimeout(() => {
            warning.classList.toggle("show");
        }, 5000);
    }

    seekForwardFive(video: HTMLVideoElement) {
        video.currentTime += 5;
    }

    seekBackwardFive(video: HTMLVideoElement) {
        video.currentTime -= 5;
    }

    bindkeyDownEventForVideo(video: HTMLVideoElement, pl: HTMLDivElement) {
        document.addEventListener("keydown", (e) => {
            const tagName = document.activeElement?.tagName.toLowerCase()
            if (tagName === "input") return;
            if (tagName === "button") return;
            // console.log(tagName);
            switch (e.key.toLowerCase()) {
                case "arrowleft":
                    this.seekBackwardFive(video);
                    break;
                case "arrowright":
                    this.seekForwardFive(video);
                    break;
                case " ":
                    (async () => await this.togglePlayPause(video))()
                    break;
                case "arrowup":
                    this.volumeUp(video);
                    break;
                case "arrowdown":
                    this.volumeDown(video);
                    break;
                case "m":
                    this.toogleMute(video);
                    break;
                case "f":
                    (async () => await this.toogleFullscreen(pl))();
                    break;
            }
        });
    }

    volumeUp(video: HTMLVideoElement) {
        let currentVolume = video.volume;
        if (currentVolume < 1 && currentVolume + 0.1 <= 1) {
            video.volume += 0.1;
        } else {
            video.volume = 1;
        }
    }

    volumeDown(video: HTMLVideoElement) {
        let currentVolume = video.volume;
        if (currentVolume > 0 && currentVolume - 0.1 >= 0) {
            video.volume -= 0.1;
        } else {
            video.volume = 0;
        }
    }

    hideControls(pl: HTMLDivElement) {
        if (!this.controlBarState.isHideable) return;
        pl.style.cursor = "none";
        // select the sub box
        const subBox = pl.querySelector(".onigiri-subs") as HTMLDivElement;
        // select the controlBar
        const controls = pl.querySelector(".onigiri-controlBar") as HTMLDivElement;
        // add the onigiri-FadeOut animation
        controls.style.animation = "onigiri-FadeOut 0.5s ease-in-out forwards";
        this.onVidControls.style.animation = "onigiri-FadeOut 0.5s ease-in-out forwards";
        this.overlay.style.animation = "onigiri-FadeOutOverlay 0.5s ease-in-out forwards";
        subBox.style.bottom = "10%";

        this.controlBarState.isShowing = false;
    }

    showControls(pl: HTMLDivElement) {
        pl.style.cursor = "default";
        // select the sub box
        const subBox = pl.querySelector(".onigiri-subs") as HTMLDivElement;
        const controls = pl.querySelector(".onigiri-controlBar") as HTMLDivElement;
        // const playPause = document.querySelector(".onigiri-playPause") as HTMLButtonElement;
        // add the onigiri-FadeIn animation
        controls.style.animation = "onigiri-FadeIn 0.5s ease-in-out forwards";
        this.overlay.classList.add('show')
        this.overlay.style.animation = "onigiri-FadeInOverlay 0.5s ease-in-out forwards";
        this.onVidControls.style.animation = "onigiri-FadeIn 0.5s ease-in-out forwards";
        subBox.style.bottom = "20%";

        this.controlBarState.isShowing = true;
    }


    animateClickAction(elem: HTMLElement) {
        // animation PlayPauseEnter
        elem.style.animation = "onigiri-PlayPauseEnter 0.05s ease-in-out forwards";

        // timeout to remove the animation
        setTimeout(() => {
            elem.style.animation = "";
        }, 60);
    }

    handleTimelineUpdate(e: MouseEvent, progress: HTMLDivElement, video: HTMLVideoElement) {
        const rect = progress.getBoundingClientRect();
        const x = e.clientX - rect.left;
        // --progress-position is between 0 and 100
        const percent = (x / rect.width);
        // set the current time
        video.currentTime = video.duration * percent;
        let intermadiate = percent * 100
        // set the progress bar
        progress.style.setProperty("--progress-position", `${intermadiate.toFixed(1)}`);
        if (this.isScrubbing) {
            e.preventDefault();
        }
    }

    handleSliderClick(e: MouseEvent, video: HTMLVideoElement, slider: HTMLDivElement, sliderRange: HTMLDivElement) {
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let percent = (x / rect.width);
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }
        video.volume = percent;
        sliderRange.style.setProperty("--value", `${percent}`);
        if (this.isScrubbingVolume) {
            e.preventDefault();
        }
    };

    async toggleScrubbing(e: MouseEvent, progress: HTMLDivElement, video: HTMLVideoElement) {
        const rect = progress.getBoundingClientRect()
        const x = e.clientX - rect.left;
        const percent = (x / rect.width);
        this.isScrubbing = (e.buttons & 1) === 1
        progress.classList.toggle("scrubbing", this.isScrubbing)
        if (this.isScrubbing) {
            this.wasPaused = video.paused
        } else {
            video.currentTime = Math.floor(video.duration * percent)
            if (!this.wasPaused) await video.play()
        }
    }

    toggleScrubbingSlider(e: MouseEvent, slider: HTMLDivElement, sliderRange: HTMLDivElement, video: HTMLVideoElement) {
        const rect = slider.getBoundingClientRect()
        const x = e.clientX - rect.left;
        let percent = (x / rect.width);
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }
        this.isScrubbingVolume = (e.buttons & 1) === 1 // Active class
        slider.classList.toggle("scrubbing", this.isScrubbing)
        video.volume = percent;
        sliderRange.style.setProperty("--value", `${percent}`);

    }


    async togglePlayPause(video: HTMLVideoElement) {
        if (video.paused) {
            await video.play();
        } else {
            video.pause();
        }
    }

    toogleMute(player: HTMLVideoElement) {
        // toggle mute
        player.muted = !player.muted;
    }

    async toogleFullscreen(player: HTMLDivElement) {
        // get browser name
        const browser = getBrowser();
        // toggle fullscreen if not in fullscreen
        try {
            if (!document.fullscreenElement) {
                switch (browser) {
                    case "chrome":
                        await player.requestFullscreen();
                        break;
                    case "firefox":
                        await player.requestFullscreen();
                        break;
                    case "safari":
                        //@ts-ignore
                        await player.webkitRequestFullscreen();
                        console.log("safari");
                        break;
                    case "opera":
                        await player.requestFullscreen();
                        break;
                    case "ie":
                        await player.requestFullscreen();
                    default:
                        await player.requestFullscreen();
                        break;
                }
            } else {
                // exit fullscreen if in fullscreen
                switch (browser) {
                    case "chrome":
                        await document.exitFullscreen();
                        break;
                    case "firefox":
                        await document.exitFullscreen();
                        break;
                    case "safari":
                        //@ts-ignore
                        await document.webkitExitFullscreen();
                        break;
                    case "opera":
                        await document.exitFullscreen();
                        break;
                    case "ie":
                        await document.exitFullscreen();
                    default:
                        await document.exitFullscreen();
                        break;
                }
            }
        } catch (err) {
            console.warn("Error fullscreen")
        }
    }

    setCss(player: HTMLVideoElement | HTMLDivElement) {
        // add the default css
        player.style.cssText = onigiricss;
        // set the css of the player
        player.style.cssText += this.Options.css ? this.Options.css : '';
    }

    controlsHtml(pl: HTMLDivElement) {
        // if next not in Options.controls remove the element from the dom with the class .onigiri-next
        if (!this.Options.controls?.includes("next")) {
            let next = pl.querySelector(".onigiri-next") as HTMLButtonElement;
            next.remove();
        }

        if (!this.Options.menu) {
            let menuIcon = pl.querySelector(".onigiri-settings") as HTMLButtonElement;
            menuIcon.remove();
        }

    }

}

export default Onigiri;
