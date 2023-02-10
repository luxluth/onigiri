type QualityOpt = {
    name: 144 | 240 | 360 | 480 | 720 | 1080 | 1440 | 2160 | 2880 | 4320;
    source: string;
}

type redirectTo = {
    opt: "redirectTo",
    url: string
}

type Chapter = {
    kind: 'chapter',
    name: string,
    label: string,
    start: number,
    end: number,
    skippable: boolean,
    data: any,
}

type Subtitles = {
    kind: 'subtitles',
    label: string,
    srclang: string,
    src: string,
    default: boolean,
    type: 'text/vtt' | 'text/json',
}

type Options = {
    // This is the player configuration.
    // This is the controls.
    controls?: [
        'play-large'?, // The large play button in the center
        'play'?, // Play/pause playback
        'progress'?, // The progress bar and scrubber for playback and buffering
        'current-time'?, // The current time of playback
        'mute'?, // Toggle mute
        'volume'?, // Volume control
        'captions'?, // Toggle captions
        'settings'?, // Settings menu
        'pip'?, // Picture-in-picture (currently Safari only)
        'airplay'?, // Airplay (currently Safari only)
        'fullscreen'?, // Toggle fullscreen
        'next'?, // Next track
    ],

    // Set to true if your stream is live
    isLive?: boolean,

    // This is the settings.
    settings?: ['captions', 'quality', 'speed'],

    // This is the speed.
    speed?: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],

    },
    // This is the keyboard.
    keyboard?: {
        focused: boolean,
        global: true,
    },
    // This is the tooltips.
    tooltips?: {
        controls: boolean,
        seek: true,
    },
    // This is the fullscreen.
    fullscreen?: {
        enabled: boolean,
        fallback: boolean,
        iosNative: boolean,
    },
    // This is the storage.
    storage?: {
        enabled: boolean,
        key: 'onigiri',
    },
    /**
     * video source {src, type, auth}
     */
    source: {
        src: string,
        type: string,
        auth?: string,
    },

    // This is the quality.
    quality?: {
        default: 1080,
        options: QualityOpt[],
    },

    /**
     * `tracks` is an array of objects `chapter` and `subtitles`.
     *
     * chapter is an object with `kind` `chapter`
     * ```ts
     * // Example
     * {
     *   kind: 'chapter',
     *   name: 'Opening',
     *   label: 'Skip the intro',
     *   start: 100,
     *   end: 2000,
     *   skippable: true,
     *   data: {
     *    custom: 'data',
     *    more: 'data'
     *   },
     * }
     * ```
     * When there is a chapter track, the player will emmit `chapterchange` event.
     * The event will have a `detail` object with `label` and `data` properties.
     * The `chapterchange` event will be emmited when the current time is between the `start` and `end` of the chapter.
     *
     * subtitles is an object with `kind` `subtitles`
     * ```ts
     * // Example
     * {
     *  kind: 'subtitles',
     *  label: 'English',
     *  srclang: 'en',
     *  src: 'https://example.com/en.vtt',
     *  default: true,
     *  type: 'text/vtt',
     * }
     * ```
     * Subtitles don't emmit any events. They are just added to the player.
     * And the default one is selected.
     * The `src` can link to a vtt, srt file or a json file.
     * The json file should be in the following format:
     * ```json
     * [
     *  {"type":"header","data":"WEBVTT"},
     *  {"type":"cue","data":{"start":3350,"end":5480,"text":"<b>Serons-nous bientôt\nà l’ambassade ?</b>"}}
     * ]
     * ```
     * @see https://github.com/gsantiago/subtitle.js for more info on the json format
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
     * @type {Array}
     * @memberof Options
     *
     */
    tracks?: (Chapter | Subtitles)[],
    /**
     * `size` is the size of the player. `width` and `height` are the dimensions of the player.
     */
    size?: {
        width: number,
        height: number,
    },
    /**
     * The `css` added to the player. This is will override the default css.
     */
    css?: string,
    /**
     * `poster` is the image that is shown before the video is played url.
     */
    poster?: string,
    /**
     * The `title` is the title of the video like serie name and other, use in overlays.
     */
    title?: string,
    /**
     * The `description` is the description of the video.
     */
    description?: string,
    /**
     * The `episode` is the episode. use in overlays.
     */
    episode?: number,
    /**
     * `episodeName` is the episode name. use in overlays.
     */
    episodeName?: string,
    /**
     * The `season` is the season. use in overlays.
     */
    season?: number,
    /** VideoName if there is no episodeName */
    videoName?: string,

    /**
     * onQuit describe which action to do when the player is close
     * `emitEvent` or `redirectTo`
     * ```ts
     * type redirectTo = {
     *  opt: "redirectTo",
     *  url: string
     * }
     * ```
     */
    onQuit?: "emitEvent"
}

type Position = {
    x: number,
    y: number,
}

type ControlBarState = {
    isShowing: boolean,
    isMouseOver: boolean,
    isHideable: boolean,
}

type VolumeState = "up" | "down" | "mute"

import { allCss, onigiricss, onigiriMask, loadingCss } from './onigiriCss'


let loadingHtml = `
<div class="onigiri-loading"></div>
<style>
${loadingCss}
</style>
`

const PlayerBaseHtml = `
<div class="onigiri">
    <div class="onigiri-mask"></div>
    <div class="onigiri-overlay">
    </div>
    <div class="onigiri-vid">
        <video id="onigiri-video" type="video/mp4">
        </video>
    </div>
    <div class="onigiri-subs">
        <p class="onigiri-subText"></p>
    </div>
    <div class="onigiri-onVidControls">
      <button class="onigiri-playpause pause">
        <svg class="onigiri-playSvg" width="50px" height="50px" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
          <path d="M 91.712 143.932 L 91.712 556.02 C 91.736 569.875 97.247 583.16 107.044 592.955 C 116.841 602.75 130.125 608.263 143.979 608.287 C 152.086 608.299 160.089 606.378 167.309 602.688 L 579.485 396.733 C 591.091 390.886 600.104 380.935 604.78 368.815 C 609.457 356.689 609.457 343.265 604.78 331.141 C 600.104 319.021 591.093 309.069 579.485 303.223 L 167.309 97.267 C 151.13 89.137 131.889 89.98 116.482 99.493 C 101.075 109.007 91.7 125.826 91.712 143.936 L 91.712 143.932 Z" style="fill: #f2f2f2;">
            <title>Play</title>
          </path>
        </svg>
        <svg class="onigiri-pauseSvg" width="50px" height="50px" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(0.922502, 0, 0, 0.922502, 27.124287, 91.699936)">
            <title>Pause</title>
            <path d="m210 0c-18.566 0-36.367 7.375-49.496 20.504s-20.504 30.93-20.504 49.496v420c0 25.008 13.344 48.117 35 60.621s48.344 12.504 70 0 35-35.613 35-60.621v-420c0-18.566-7.375-36.367-20.504-49.496s-30.93-20.504-49.496-20.504z" style="fill: #f2f2f2;" />
            <path d="m490 0c-18.566 0-36.367 7.375-49.496 20.504s-20.504 30.93-20.504 49.496v420c0 25.008 13.344 48.117 35 60.621s48.344 12.504 70 0 35-35.613 35-60.621v-420c0-18.566-7.375-36.367-20.504-49.496s-30.93-20.504-49.496-20.504z" style="fill: #f2f2f2;" />
          </g>
        </svg>
      </button>
    </div>
    <div class="onigiri-controlBar">
      <div class="onigiri-time onigiri-current-time">
        <span></span>
      </div>
      <div class="onigiri-timeline-container" style="--progress-position: 0">
        <div class="onigiri-timeline"></div>
      </div>
      <div class="onigiri-time onigiri-total-time">
      <span>
        <div class="islive">● LIVE</div>
      </span>
      </div>
      <!-- captions -->
      <button class="onigiri-captionButton hided">
        <svg class="onigiri-showCapsAction" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <title>Show Caption</title>
          <rect x="17.318" y="87.034" width="465.364" height="325.932" style="fill: none; stroke: #f2f2f2; stroke-width: 20px;" rx="70.16" ry="70.16"/>
          <path d="M 159.383 336.292 C 144.041 336.292 130.565 333.416 118.953 327.663 C 107.341 321.91 98.285 313.547 91.787 302.574 C 85.288 291.601 81.719 278.338 81.081 262.784 C 80.867 259.588 80.761 255.38 80.761 250.16 C 80.761 244.94 80.867 240.625 81.081 237.216 C 81.719 221.662 85.288 208.399 91.787 197.426 C 98.285 186.453 107.341 178.09 118.953 172.337 C 130.565 166.584 144.041 163.708 159.383 163.708 C 173.019 163.708 184.631 165.572 194.219 169.301 C 203.807 173.03 211.69 177.824 217.869 183.683 C 224.048 189.542 228.682 195.615 231.772 201.9 C 234.861 208.185 236.512 213.885 236.726 218.999 C 236.938 221.342 236.246 223.207 234.648 224.592 C 233.05 225.977 231.185 226.669 229.055 226.669 L 200.931 226.669 C 198.8 226.669 197.149 226.136 195.977 225.071 C 194.805 224.006 193.686 222.408 192.621 220.277 C 189.425 211.754 185.217 205.735 179.997 202.22 C 174.777 198.704 168.118 196.946 160.022 196.946 C 149.368 196.946 140.899 200.302 134.614 207.014 C 128.328 213.725 124.972 224.325 124.546 238.814 C 124.12 246.911 124.12 254.368 124.546 261.186 C 124.972 275.887 128.328 286.541 134.614 293.146 C 140.899 299.751 149.368 303.054 160.022 303.054 C 168.331 303.054 175.043 301.296 180.157 297.78 C 185.27 294.265 189.425 288.246 192.621 279.723 C 193.686 277.592 194.805 275.994 195.977 274.929 C 197.149 273.864 198.8 273.331 200.931 273.331 L 229.055 273.331 C 231.185 273.331 233.05 274.023 234.648 275.408 C 236.246 276.793 236.938 278.658 236.726 281.001 C 236.512 284.836 235.5 289.151 233.69 293.945 C 231.878 298.739 229.002 303.64 225.06 308.647 C 221.118 313.654 216.165 318.234 210.199 322.389 C 204.233 326.544 197.042 329.9 188.626 332.457 C 180.21 335.014 170.462 336.292 159.383 336.292 Z M 341.859 336.292 C 326.518 336.292 313.042 333.416 301.43 327.663 C 289.818 321.91 280.762 313.547 274.264 302.574 C 267.765 291.601 264.196 278.338 263.557 262.784 C 263.344 259.588 263.238 255.38 263.238 250.16 C 263.238 244.94 263.344 240.625 263.557 237.216 C 264.196 221.662 267.765 208.399 274.264 197.426 C 280.762 186.453 289.818 178.09 301.43 172.337 C 313.042 166.584 326.518 163.708 341.859 163.708 C 355.495 163.708 367.108 165.572 376.696 169.301 C 386.284 173.03 394.167 177.824 400.346 183.683 C 406.524 189.542 411.159 195.615 414.249 201.9 C 417.338 208.185 418.989 213.885 419.202 218.999 C 419.415 221.342 418.723 223.207 417.125 224.592 C 415.527 225.977 413.662 226.669 411.532 226.669 L 383.407 226.669 C 381.276 226.669 379.625 226.136 378.453 225.071 C 377.281 224.006 376.163 222.408 375.098 220.277 C 371.902 211.754 367.693 205.735 362.473 202.22 C 357.253 198.704 350.594 196.946 342.498 196.946 C 331.844 196.946 323.375 200.302 317.09 207.014 C 310.804 213.725 307.449 224.325 307.023 238.814 C 306.597 246.911 306.597 254.368 307.023 261.186 C 307.449 275.887 310.804 286.541 317.09 293.146 C 323.375 299.751 331.844 303.054 342.498 303.054 C 350.808 303.054 357.519 301.296 362.633 297.78 C 367.747 294.265 371.902 288.246 375.098 279.723 C 376.163 277.592 377.281 275.994 378.453 274.929 C 379.625 273.864 381.276 273.331 383.407 273.331 L 411.532 273.331 C 413.662 273.331 415.527 274.023 417.125 275.408 C 418.723 276.793 419.415 278.658 419.202 281.001 C 418.989 284.836 417.977 289.151 416.166 293.945 C 414.355 298.739 411.479 303.64 407.537 308.647 C 403.595 313.654 398.641 318.234 392.676 322.389 C 386.71 326.544 379.519 329.9 371.103 332.457 C 362.686 335.014 352.938 336.292 341.859 336.292 Z" style="white-space: pre; fill: #f2f2f2"/>
        </svg>
        <svg class="onigiri-hideCapsAction" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <title>Hide Caption</title>
          <rect x="17.318" y="87.034" width="465.364" height="325.932" style="stroke: #f2f2f2; stroke-width: 20px; fill: #f2f2f2" rx="70.16" ry="70.16"/>
          <path d="M 159.383 336.292 C 144.041 336.292 130.565 333.416 118.953 327.663 C 107.341 321.91 98.285 313.547 91.787 302.574 C 85.288 291.601 81.719 278.338 81.081 262.784 C 80.867 259.588 80.761 255.38 80.761 250.16 C 80.761 244.94 80.867 240.625 81.081 237.216 C 81.719 221.662 85.288 208.399 91.787 197.426 C 98.285 186.453 107.341 178.09 118.953 172.337 C 130.565 166.584 144.041 163.708 159.383 163.708 C 173.019 163.708 184.631 165.572 194.219 169.301 C 203.807 173.03 211.69 177.824 217.869 183.683 C 224.048 189.542 228.682 195.615 231.772 201.9 C 234.861 208.185 236.512 213.885 236.726 218.999 C 236.938 221.342 236.246 223.207 234.648 224.592 C 233.05 225.977 231.185 226.669 229.055 226.669 L 200.931 226.669 C 198.8 226.669 197.149 226.136 195.977 225.071 C 194.805 224.006 193.686 222.408 192.621 220.277 C 189.425 211.754 185.217 205.735 179.997 202.22 C 174.777 198.704 168.118 196.946 160.022 196.946 C 149.368 196.946 140.899 200.302 134.614 207.014 C 128.328 213.725 124.972 224.325 124.546 238.814 C 124.12 246.911 124.12 254.368 124.546 261.186 C 124.972 275.887 128.328 286.541 134.614 293.146 C 140.899 299.751 149.368 303.054 160.022 303.054 C 168.331 303.054 175.043 301.296 180.157 297.78 C 185.27 294.265 189.425 288.246 192.621 279.723 C 193.686 277.592 194.805 275.994 195.977 274.929 C 197.149 273.864 198.8 273.331 200.931 273.331 L 229.055 273.331 C 231.185 273.331 233.05 274.023 234.648 275.408 C 236.246 276.793 236.938 278.658 236.726 281.001 C 236.512 284.836 235.5 289.151 233.69 293.945 C 231.878 298.739 229.002 303.64 225.06 308.647 C 221.118 313.654 216.165 318.234 210.199 322.389 C 204.233 326.544 197.042 329.9 188.626 332.457 C 180.21 335.014 170.462 336.292 159.383 336.292 Z M 341.859 336.292 C 326.518 336.292 313.042 333.416 301.43 327.663 C 289.818 321.91 280.762 313.547 274.264 302.574 C 267.765 291.601 264.196 278.338 263.557 262.784 C 263.344 259.588 263.238 255.38 263.238 250.16 C 263.238 244.94 263.344 240.625 263.557 237.216 C 264.196 221.662 267.765 208.399 274.264 197.426 C 280.762 186.453 289.818 178.09 301.43 172.337 C 313.042 166.584 326.518 163.708 341.859 163.708 C 355.495 163.708 367.108 165.572 376.696 169.301 C 386.284 173.03 394.167 177.824 400.346 183.683 C 406.524 189.542 411.159 195.615 414.249 201.9 C 417.338 208.185 418.989 213.885 419.202 218.999 C 419.415 221.342 418.723 223.207 417.125 224.592 C 415.527 225.977 413.662 226.669 411.532 226.669 L 383.407 226.669 C 381.276 226.669 379.625 226.136 378.453 225.071 C 377.281 224.006 376.163 222.408 375.098 220.277 C 371.902 211.754 367.693 205.735 362.473 202.22 C 357.253 198.704 350.594 196.946 342.498 196.946 C 331.844 196.946 323.375 200.302 317.09 207.014 C 310.804 213.725 307.449 224.325 307.023 238.814 C 306.597 246.911 306.597 254.368 307.023 261.186 C 307.449 275.887 310.804 286.541 317.09 293.146 C 323.375 299.751 331.844 303.054 342.498 303.054 C 350.808 303.054 357.519 301.296 362.633 297.78 C 367.747 294.265 371.902 288.246 375.098 279.723 C 376.163 277.592 377.281 275.994 378.453 274.929 C 379.625 273.864 381.276 273.331 383.407 273.331 L 411.532 273.331 C 413.662 273.331 415.527 274.023 417.125 275.408 C 418.723 276.793 419.415 278.658 419.202 281.001 C 418.989 284.836 417.977 289.151 416.166 293.945 C 414.355 298.739 411.479 303.64 407.537 308.647 C 403.595 313.654 398.641 318.234 392.676 322.389 C 386.71 326.544 379.519 329.9 371.103 332.457 C 362.686 335.014 352.938 336.292 341.859 336.292 Z" style="white-space: pre; fill: #000000;"/>
        </svg>
      </button>
      <!-- settings -->
      <button class="onigiri-settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <title>Settings</title>
          <path fill="#f2f2f2" d="M6 6a2 2 0 0 0-1.5-1.93V2.5a.5.5 0 0 0-1 0v1.57a2 2 0 0 0 0 3.86v5.57a.5.5 0 0 0 1 0V7.93A2 2 0 0 0 6 6zM4 7a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4.5 2.07V2.5a.5.5 0 0 0-1 0v6.57a2 2 0 0 0 0 3.86v.57a.5.5 0 0 0 1 0v-.57a2 2 0 0 0 0-3.86zM8 12a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm6-7a2 2 0 0 0-1.5-1.93V2.5a.5.5 0 0 0-1 0v.57a2 2 0 0 0 0 3.86v6.57a.5.5 0 0 0 1 0V6.93A2 2 0 0 0 14 5zm-2 1a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" data-name="Layer 2"/>
        </svg>
      </button>
      <!-- next -->
      <button class="onigiri-next">
        <svg width="50px" height="50px" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1.153125, 0, 0, 1.153125, -53.590889, 27.124987)">
            <title>Next</title>
            <path d="M 166.05 56.012 C 144.191 55.489 125.995 73.547 125.995 95.77 L 125.995 464.32 C 126.007 494.523 158.948 513.847 184.686 498.75 L 184.862 498.652 L 466.172 314.472 C 491.895 299.363 491.895 260.718 466.172 245.609 L 184.862 61.429 L 184.698 61.332 C 179.022 58 172.604 56.164 166.05 56.004 L 166.05 56.012 Z" fill-rule="evenodd" style="fill: #f2f2f2;"/>
            <path d="M 532 56 C 508.879 56 490 74.879 490 98 L 490 462 C 490 485.121 508.879 504 532 504 C 555.121 504 574 485.121 574 462 L 574 98 C 574 74.879 555.121 56 532 56 Z" fill-rule="evenodd" style="fill: #f2f2f2;"/>
          </g>
        </svg>
      </button>
      <!-- fullscreen -->
    </div>
    <div class="onigiri-subs-choice-box">
      <h3 class="onigiri-subBox_title">SUBTITLES</h3>
      <div class="onigiri-subBox_list">
      </div>
    </div>
    <div class="onigiri-warning">
      <h3 class="onigiri-warning_title"></h3>
      <p class="onigiri-warning_text"></p>
    </div>
    ${loadingHtml}
</div>
<style>
${allCss}
</style>
`


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
        if (this.Options.tracks) {
            // console.log(this.Options.tracks);
            for (const track of this.Options.tracks) {
                if (track.kind === 'subtitles') {
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
            `
            <div class="onigiri-top-left-infos">
                <div class="onigiri-title">
                    <h1>SPY X FAMILY</h1>
                </div>
                <div class="onigiri-episode-infos">
                    <div class="onigiri-season">
                        <p class="onigiri-season-number">Season 1</p>
                    </div>
                    <div class="separator">|</div>
                    <div class="onigiri-eps">
                        <span class="onigiri-eps-number">Episode 1</span>
                        <span class="sep-eps">, </span>
                        <span class="onigiri-eps-title">The Spy Who Loved Me</span>
                    </div>
                </div>
            </div>
            `
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
        this.overlay.innerHTML += `
        <div class="onigiri-right-top-actions">
            <button class="onigiri-volume">
                <svg class="vol-up" data-name="up" viewBox="0 0 29 29" fill="#f2f2f2" xmlns="http://www.w3.org/2000/svg">
                    <title>Volume</title>
                    <path d="M 14.798 7.141 L 9.74 9.85 C 9.556 9.948 9.351 10 9.143 10 L 5.925 10 C 5.226 10 4.66 10.566 4.66 11.265 L 4.66 17.735 C 4.66 18.434 5.226 19 5.925 19 L 9.143 19 C 9.351 19 9.556 19.052 9.74 19.15 L 14.798 21.859 C 15.64 22.311 16.66 21.7 16.66 20.744 L 16.66 8.255 C 16.66 7.3 15.64 6.689 14.798 7.141 Z M 19.313 11.216 C 19.087 11.373 19.03 11.685 19.187 11.912 C 20.271 13.467 20.271 15.533 19.187 17.088 C 18.969 17.405 19.177 17.84 19.56 17.87 C 19.737 17.884 19.908 17.803 20.01 17.658 C 21.33 15.76 21.33 13.24 20.01 11.342 C 19.851 11.116 19.541 11.06 19.313 11.216 Z M 22.428 8.464 C 22.208 8.148 21.729 8.187 21.565 8.535 C 21.486 8.701 21.505 8.896 21.613 9.044 C 23.917 12.317 23.917 16.683 21.613 19.956 C 21.386 20.267 21.58 20.707 21.963 20.748 C 22.145 20.768 22.323 20.687 22.428 20.536 C 24.978 16.916 24.978 12.084 22.428 8.464 Z"/>
                </svg>
                <svg class="vol-down" xmlns="http://www.w3.org/2000/svg" data-name="down" viewBox="0 0 29 29" fill=#f2f2f2>
                    <title>Volume</title>
                    <path d="M16.46765,7.1405,11.40973,9.85a1.26463,1.26463,0,0,1-.59729.15H7.59485A1.265,1.265,0,0,0,6.3299,11.26489v6.47016A1.265,1.265,0,0,0,7.59485,19h3.21759a1.26527,1.26527,0,0,1,.59729.1499l5.05792,2.7096a1.26493,1.26493,0,0,0,1.86225-1.11505V8.25549A1.26493,1.26493,0,0,0,16.46765,7.1405Zm5.21106,4.2013a.49994.49994,0,1,0-.82129.57031,4.52759,4.52759,0,0,1,0,5.17578.49994.49994,0,1,0,.82129.57031,5.52694,5.52694,0,0,0,0-6.3164Z"/>
                </svg>
                <svg class="vol-mute" data-name="mute" viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg" style="fill: #f2f2f2">
                    <title>Volume</title>
                    <path d="M 18.638 7.141 L 13.58 9.85 C 13.396 9.948 13.191 10 12.982 10 L 9.765 10 C 9.066 10 8.5 10.566 8.5 11.265 L 8.5 17.735 C 8.5 18.434 9.066 19 9.765 19 L 12.982 19 C 13.191 19 13.396 19.052 13.58 19.15 L 18.638 21.859 C 19.48 22.311 20.5 21.7 20.5 20.744 L 20.5 8.255 C 20.5 7.3 19.48 6.689 18.638 7.141 Z"/>
                </svg>
            </button>
            <div class="vol-slider">
                <div type="range" style="--value: 1" class="onigiri-volume-range"></div>
            </div>
            <button class="onigiri-quit">
                <svg class="quit-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <title>Quit</title>
                    <path d="M 249.999 483.126 C 235.53 483.126 223.8 471.395 223.8 456.926 L 223.8 276.198 L 43.072 276.198 C 28.603 276.198 16.873 264.468 16.873 249.999 C 16.873 235.53 28.603 223.8 43.072 223.8 L 223.8 223.8 L 223.8 43.072 C 223.8 28.603 235.53 16.873 249.999 16.873 C 264.468 16.873 276.198 28.603 276.198 43.072 L 276.198 223.8 L 456.927 223.8 C 471.396 223.8 483.126 235.53 483.126 249.999 C 483.126 264.468 471.396 276.198 456.927 276.198 L 276.198 276.198 L 276.198 456.926 C 276.198 471.395 264.468 483.126 249.999 483.126 Z" style="fill: rgb(255, 255, 255);" transform="matrix(0.716051, 0.698048, -0.698048, 0.716051, 245.498817, -103.52454)"/>
                </svg>
            </button>
        </div>
        `;
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
                case "emitEvent":
                    QuitButton.addEventListener("click", () => {
                        this.triggerEvent("onQuit", { video: video, player: this });
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
        }, 3000);
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
        const percent = (x / rect.width);
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
            video.currentTime = video.duration * percent
            if (!this.wasPaused) video.play()
        }
    }

    toggleScrubbingSlider(e: MouseEvent, slider: HTMLDivElement, sliderRange: HTMLDivElement, video: HTMLVideoElement) {
        const rect = slider.getBoundingClientRect()
        const x = e.clientX - rect.left;
        const percent = (x / rect.width);
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

    pauseOverlay(elem: HTMLDivElement) {
    }

    controlsHtml(pl: HTMLDivElement) {
        // if next not in Options.controls remove the element from the dom with the class .onigiri-next
        if (!this.Options.controls?.includes("next")) {
            let next = pl.querySelector(".onigiri-next") as HTMLButtonElement;
            next.remove();
        }

    }

    public truncate(n: number, str: string) {
        // convert the str to a string of n char
        if (str.length <= n) {
            return str;
        }
        return str.substring(0, n).trim() + "...";
    }


}

export default Onigiri;
