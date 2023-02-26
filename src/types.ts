import { Menu } from './menu'

type QualityOpt = {
    name: 144 | 240 | 360 | 480 | 720 | 1080 | 1440 | 2160 | 2880 | 4320;
    source: string;
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
     * alternateName display if no episode number
     */
    alternateName?: string,
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
    onQuit?: boolean

    /**
     * menu: An onigiri menu Element class
     */
    menu?: Menu
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

type menuIcon = {
    type: 'image' | 'svg' | 'text',
    src: string,
    text?: string,
    alt?: string,
}

export {
    Options,
    Position,
    ControlBarState,
    VolumeState,
    QualityOpt,
    Subtitles,
    Chapter,
    menuIcon,
}
