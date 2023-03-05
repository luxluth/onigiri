import Onigiri from ".";

function parseVTTSettings(settings: string, cue: VTTCue): VTTCue {
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


function turnOnSubtitles(O: Onigiri, pl: HTMLDivElement, video: HTMLVideoElement, lang: string, subButton: HTMLButtonElement) {
    const subtitleBox = pl.querySelector('.onigiri-subs') as HTMLDivElement;
    const subtitleBoxText = subtitleBox.querySelector('.onigiri-subText') as HTMLParagraphElement;
    // video.textTracks on track change
    video.textTracks.onchange = () => {

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
            O.seekBackwardFive(video);
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
                    subtitleBoxText.innerHTML = convertToHtml(video.textTracks[i].activeCues[0].text);

                } else {
                    subtitleBox.style.display = 'none';
                    subtitleBoxText.innerHTML = '';
                }
            }
        } else {
            // @ts-ignore
            video.textTracks[i].mode = "hidden";
            // @ts-ignore
            video.textTracks[i].oncuechange = null;
        }
    }
    subButton.classList.remove("hided");
    subButton.classList.add("showed");
}

function turnOffSubtitles(video: HTMLVideoElement, subButton: HTMLButtonElement) {
    for (let i = 0; i < video.textTracks.length; i++) {
        // @ts-ignore
        video.textTracks[i].mode = "hidden";
        // @ts-ignore
        video.textTracks[i].oncuechange = null;
    }
    subButton.classList.remove("showed");
    subButton.classList.add("hided");
}


function truncate(n: number, str: string) {
    // convert the str to a string of n char
    if (str.length <= n) {
        return str;
    }
    return str.substring(0, n).trim() + "...";
}

const leadingZeroFmt = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2
})

function formatTime(time: number)  {
    const s = Math.floor(time % 60)
    const m = Math.floor(time / 60) % 60
    const h = Math.floor(time / 3600)
    if (h === 0) {
        return `${m}:${leadingZeroFmt.format(s)}`
    } else {
        return `${h}:${leadingZeroFmt.format(m)}:${leadingZeroFmt.format(s)}`
    }
}

function getBrowser() {
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

function convertToHtml(text: string): string {
    // \n
    text = text.replace(/(?:\r \n|\r|\n)/g, '<br>');
    // <b>bold</b>
    text = text.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
    // <i>italic</i>
    text = text.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');

    return text;
}



export {
    parseVTTSettings,
    turnOnSubtitles,
    turnOffSubtitles,
    truncate,
    formatTime,
    getBrowser,
    convertToHtml
}
