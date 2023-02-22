import { onigiricss } from './css'
import { PlayerBaseHtml, onigiriRightTopActions } from './html'

import type {
    Options,
    Position,
    ControlBarState,
    VolumeState,
    Chapter
} from './types'


class Onigiri {
    // This class is the video player class.
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

    // This is the constructor.
    constructor(querySelector: string, options: Options) {
        // This is the constructor.
        this.QuerySelectorPlayer = querySelector;
        this.Options = options;
        this.load();
    }

    // load the player
    async load() {
        // check if the source is valid
        if (this.Options.source) {
            let isReachable = await this.checkReachable(this.Options.source.src);
            if (!isReachable) {
                this.showWarning("Source not reachable", "The source is not reachable, please check the source url.");
                return;
            }
        }
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
        this.browser = this.getBrowser();
        // overlay
        this.overlay = pl.querySelector(".onigiri-overlay") as HTMLDivElement;
        // set the controls
        this.controlsHtml(pl);
        if (this.Options.isLive) {
            // create attribute type on the .onigiri element to be able to type="live"
            const p = pl.querySelector(".onigiri") as HTMLDivElement;
            p.setAttribute("type", "live");
        }
        // set the video
        const video = pl.querySelector("#onigiri-video") as HTMLVideoElement;
        if (this.browser === "safari") {
            // add playsinline attribute to the video element
            video.setAttribute("preload", "metadata")
            video.setAttribute("muted", "")
            video.setAttribute("autoplay", "")
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");
            // video.setAttribute("x-webkit-airplay", "allow");
            // video.setAttribute("x5-video-player-type", "h5");
            // video.setAttribute("x5-video-player-fullscreen", "true");
            // video.setAttribute("x5-video-orientation", "landscape");

        }
        // set the source
        video.src = this.Options.source.src;

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
                        // response is an array of objects like this:
                        // [
                        //     { "type": "header", "data": "WEBVTT" },
                        //     { "type": "cue", "data": { "start": 53120, "end": 54780, "text": "On va au boulot ?" } },
                        //     { "type": "cue", "data": { "start": 76310, "end": 80180, "text": "En coupant du bois,\non se fait 60 000 yens par mois." }
                        // }, ...]
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
                                    cue = this.parseVTTSettings(subtitle.data.settings, cue);
                                }
                                textTrack.addCue(cue);
                            }
                        }
                    } else if (track.type === 'text/vtt') {
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
                this.turnOffSubtitles(video, captionsButton);
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
                this.turnOnSubtitles(pl, video, target.getAttribute('data-subtitle') as string, captionsButton);
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

        this.turnOnSubtitles(pl, video, defaultTrack, captionsButton);
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
                duration.innerText = this.formatTime(video.duration);
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
        if (this.browser !== 'safari') {
            video.play();
        } else {
            video.pause();
        }
        // get the video bitrate
        pl.onmousemove = (e) => {
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        }

        pl.addEventListener("mousemove", (e) => {
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
                    pl.style.cursor = "none";
                }
            }, 2000);
        });

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

        video.addEventListener("click", () => {
            // show the controls
            this.showControls(pl);
        });

        video.addEventListener("pause", () => {
            // show the controls
            if (!this.controlBarState.isShowing) {
                this.showControls(pl);
            }
        });

        video.addEventListener("play", () => {
            if (!this.controlBarState.isShowing) {
                this.showControls(pl);
            }
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
                            <span class="onigiri-eps-title">${this.truncate(40, this.Options.episodeName)}</span>
                            `;
                }
            }
        } else if (this.Options.episode) {
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
        this.playButton.addEventListener("click", () => {
            this.togglePlayPause(video);
        });

        video.addEventListener("volumechange", () => {
            if (video.volume === 0 && this.volumeCurrentState !== "mute") {
                volumeButton.classList.remove(this.volumeCurrentState);
                this.volumeCurrentState = "mute";
                volumeButton.classList.add(this.volumeCurrentState);
            } else if (video.volume > 0 && video.volume <= 0.5) {
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
            switch (this.Options.onQuit) {
                case true:
                    QuitButton.addEventListener("click", () => {
                        this.triggerEvent("quit", { video: video, player: this });
                    })
                    break;
            }
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
            this.playButton.classList.remove("pause");
            this.playButton.classList.add("play");
            this.animateClickAction(this.playButton);
        };

        video.onplay = () => {
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
            if (!this.Options.isLive) {
                totTime.innerText = `-${this.formatTime(video.duration - video.currentTime)}`;
            }
            currentTime.innerText = this.formatTime(video.currentTime);
            const progress = pl.querySelector(".onigiri-timeline") as HTMLDivElement;
            const p = pl.querySelector(".onigiri") as HTMLDivElement;
            // --progress-position is between 0 and 1
            progress.style.setProperty("--progress-position", `${video.currentTime / video.duration}`);
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

        progress.addEventListener("mousedown", (e) => {
            this.toggleScrubbing(e, progress, video);
        });

        document.addEventListener("mouseup", (e) => {
            if (this.isScrubbing) this.toggleScrubbing(e, progress, video);
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
        this.triggerEvent("ready", { video: video, player: this });
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

    parseVTTSettings(settings: string, cue: VTTCue): VTTCue {
        const settingsArray = settings.split(" ");
        settingsArray.forEach((setting) => {
            const settingArray = setting.split(":");
            const key = settingArray[0];
            const value = settingArray[1];
            switch (key) {
                case "line":
                    //@ts-ignore
                    cue.line = parseInt(value);
                    break;
                case "align":
                    //@ts-ignore
                    cue.align = value;
                    break;
                case "position":
                    //@ts-ignore
                    cue.position = parseInt(value);
                    break;
                case "size":
                    //@ts-ignore
                    cue.size = parseInt(value);
                    break;
                case "vertical":
                    //@ts-ignore
                    cue.vertical = value;
                    break;
                case "region":
                    //@ts-ignore
                    cue.region = value;
                    break;
            }
        });
        return cue;
    }

    seekForwardFive(video: HTMLVideoElement) {
        video.currentTime += 5;
    }

    seekBackwardFive(video: HTMLVideoElement) {
        video.currentTime -= 5;
    }

    convertToHtml(text: string): string {
        // \n
        text = text.replace(/(?:\r \n|\r|\n)/g, '<br>');
        // <b>bold</b>
        text = text.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
        // <i>italic</i>
        text = text.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');

        return text;
    }

    turnOnSubtitles(pl: HTMLDivElement, video: HTMLVideoElement, lang: string, subButton: HTMLButtonElement) {
        // console.log("------------------------")
        const subtitleBox = pl.querySelector('.onigiri-subs') as HTMLDivElement;
        const subtitleBoxText = subtitleBox.querySelector('.onigiri-subText') as HTMLParagraphElement;
        // console.log(lang);
        // video.textTracks on track change
        video.textTracks.onchange = () => {
            // console.log("track changed");

            let numberHidded = 0;
            for (let i = 0; i < video.textTracks.length; i++) {
                // @ts-ignore
                if (video.textTracks[i].mode === "hidden") {
                    numberHidded++;
                }
            }
            if (numberHidded === video.textTracks.length) {
                subtitleBox.style.display = "none";
            } else {
                this.seekBackwardFive(video);
            }
        };
        for (let i = 0; i < video.textTracks.length; i++) {
                // @ts-ignore
            if (video.textTracks[i].language === lang) {
                // @ts-ignore
                video.textTracks[i].mode = "showing";
                // @ts-ignore
                video.textTracks[i].oncuechange = () => {
                    //@ts-ignore
                    if (video.textTracks[i].activeCues[0]) {
                        subtitleBox.style.display = "block";
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].line) {
                            //@ts-ignore
                            subtitleBox.style.top = `${video.textTracks[i].activeCues[0].line}%`;
                        }
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].align) {
                            //@ts-ignore
                            subtitleBox.style.textAlign = video.textTracks[i].activeCues[0].align;
                        }
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].position) {
                            //@ts-ignore
                            subtitleBox.style.left = `${video.textTracks[i].activeCues[0].position}%`;
                        }
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].size) {
                            //@ts-ignore
                            subtitleBox.style.fontSize = `${video.textTracks[i].activeCues[0].size}%`;
                        }
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].vertical) {
                            //@ts-ignore
                            subtitleBox.style.writingMode = video.textTracks[i].activeCues[0].vertical;
                        }
                        //@ts-ignore
                        if (video.textTracks[i].activeCues[0].region) {
                            //@ts-ignore
                            subtitleBox.style.top = video.textTracks[i].activeCues[0].region;
                        }
                        //@ts-ignore
                        subtitleBoxText.innerHTML = this.convertToHtml(video.textTracks[i].activeCues[0].text);

                    } else {
                        subtitleBox.style.display = 'none';
                        subtitleBoxText.innerHTML = '';
                    }
                }
            } else {
                // @ts-ignore
                video.textTracks[i].mode = "hidden";
                // remove event listener
                // @ts-ignore
                video.textTracks[i].oncuechange = null;
            }
        }
        // console.log(video.textTracks);
        // console.log("------------------------")
        subButton.classList.remove("hided");
        subButton.classList.add("showed");
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
                    this.togglePlayPause(video);
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
                    this.toogleFullscreen(pl);
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

    turnOffSubtitles(video: HTMLVideoElement, subButton: HTMLButtonElement) {
        for (let i = 0; i < video.textTracks.length; i++) {
            // @ts-ignore
            video.textTracks[i].mode = "hidden";
            // remove event listener
            // @ts-ignore
            video.textTracks[i].oncuechange = null;
        }
        subButton.classList.remove("showed");
        subButton.classList.add("hided");
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
        // --progress-position is between 0 and 1
        const percent = (x / rect.width);
        // set the current time
        video.currentTime = video.duration * percent;
        // set the progress bar
        progress.style.setProperty("--progress-position", `${percent}`);
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

    toggleScrubbing(e: MouseEvent, progress: HTMLDivElement, video: HTMLVideoElement) {
        const rect = progress.getBoundingClientRect()
        const x = e.clientX - rect.left;
        const percent = (x / rect.width);
        this.isScrubbing = (e.buttons & 1) === 1
        progress.classList.toggle("scrubbing", this.isScrubbing)
        if (this.isScrubbing) {
            this.wasPaused = video.paused
        } else {
            video.currentTime = Math.round(video.duration * percent)
            if (!this.wasPaused) video.play()
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


    togglePlayPause(video: HTMLVideoElement) {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    toogleMute(player: HTMLVideoElement) {
        // toggle mute
        player.muted = !player.muted;
    }

    toogleFullscreen(player: HTMLDivElement) {
        // get browser name
        const browser = this.getBrowser();
        // toggle fullscreen if not in fullscreen
        if (!document.fullscreenElement) {
            switch (browser) {
                case "chrome":
                    player.requestFullscreen();
                    break;
                case "firefox":
                    player.requestFullscreen();
                    break;
                case "safari":
                    //@ts-ignore
                    player.webkitRequestFullscreen();
                    console.log("safari");
                    break;
                case "opera":
                    player.requestFullscreen();
                    break;
                case "ie":
                    player.requestFullscreen();
                default:
                    player.requestFullscreen();
                    break;
            }
        } else {
            // exit fullscreen if in fullscreen
            switch (browser) {
                case "chrome":
                    document.exitFullscreen();
                    break;
                case "firefox":
                    document.exitFullscreen();
                    break;
                case "safari":
                    //@ts-ignore
                    document.webkitExitFullscreen();
                    break;
                case "opera":
                    document.exitFullscreen();
                    break;
                case "ie":
                    document.exitFullscreen();
                default:
                    document.exitFullscreen();
                    break;
            }
        }
    }

    getBrowser() {
        // get browser name
        const browser = navigator.userAgent.toLowerCase();
        if (browser.indexOf("chrome") > -1) {
            return "chrome";
        } else if (browser.indexOf("firefox") > -1) {
            return "firefox";
        } else if (browser.indexOf("safari") > -1) {
            return "safari";
        } else if (browser.indexOf("opera") > -1) {
            return "opera";
        } else if (browser.indexOf("msie") > -1) {
            return "ie";
        } else {
            return "unknown";
        }
    }

    formatTime(time: number) {
        // format time
        const hours = Math.floor(time / 60 / 60);
        const minutes = Math.floor(time / 60) - hours * 60;
        const seconds = Math.floor(time - minutes * 60 - hours * 60 * 60);
        const formattedTime = [hours, minutes, seconds]
            .map((v) => (v < 10 ? `0${v}` : v))
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
        return formattedTime;
    }

    setCss(player: HTMLVideoElement | HTMLDivElement) {
        // add the default css
        player.style.cssText = onigiricss;
        // set the css of the player
        player.style.cssText += this.Options.css ? this.Options.css : '';
    }

    // pauseOverlay(elem: HTMLDivElement) {
    // }

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

    public truncate(n: number, str: string) {
        // convert the str to a string of n char
        if (str.length <= n) {
            return str;
        }
        return str.substring(0, n).trim() + "...";
    }

    public async checkReachable(url: string) {
        // check if the video is reachable
        try {
            const response = await fetch(url);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }


}

export default Onigiri;
