let onigiricss = `
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #000;
    overflow: hidden;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-size-adjust: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
`
let onigiriMask = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: 0;
    z-index: 10;
    transition: opacity 0.3s ease;
    pointer-events: none;
`

let allCss = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.onigiri {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #000;
    overflow: hidden;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-size-adjust: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
}

.onigiri-vid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}

#onigiri-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}



:root {
    --player-bg-color: #222222;
    --onigiri-bg-rgba: rgba(13, 31, 47, 0.9);
    --overlay-bg-color: rgba(0, 0, 0, 0.4);
    --time-line-progress : 0;
    --player-text-color: #f2f2f2;
    --onigiri-txt-rgba: rgba(255, 255, 255, 0.9);
    --progress-position: 0;
    --buffer-position: 0;
}

@keyframes onigiri-PlayPauseEnter {
  0% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes onigiri-FadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    display: block;
  }
}

@keyframes onigiri-FadeInOverlay {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    display: block;
  }
}

@keyframes onigiri-FadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
}

@keyframes onigiri-FadeOutOverlay {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
}

@keyframes Warning {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}


::cue {
  opacity: 0;
}

.onigiri-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: var(--overlay-bg-color);
  opacity: 0.4;
  color : var(--player-text-color);
}

.onigiri-overlay.show {
  opacity: 0;
  display: block;
}

.onigiri-top-left-infos {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: -0.2em;
  padding: 2em;
  padding-left: 4em;
  font-size: 1.2em;
}

.onigiri-episode-infos {
  display: flex;
  flex-direction: row;
  font-weight: 500;
  font-size: 1em;
  opacity: 0.7;
}

.onigiri-eps {
  display: flex;
  flex-direction: row;
  gap: 0em;
}

.sep-eps {
  margin-right: 0.3em;
  margin-left: 0.3em;
}


.onigiri-right-top-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.2em;
  padding: 2em;
  padding-right: 4em;
  font-size: 1.2em;
}

.onigiri-right-top-actions .onigiri-volume {
  cursor: pointer;
  opacity: 0.5;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.onigiri-right-top-actions .onigiri-volume svg {
  display: none;
}

.onigiri-right-top-actions .onigiri-volume.up > svg[data-name="up"] {
  display: block;
}

.onigiri-right-top-actions .onigiri-volume.down > svg[data-name="down"] {
  display: block;
}

.onigiri-right-top-actions .onigiri-volume.mute > svg[data-name="mute"] {
  display: block;
}

.onigiri-right-top-actions .vol-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  justify-content: center;
  background: rgba( 0, 0, 0, 0.6 );
  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(44, 44, 44, 0.568) inset;
  opacity: 0;
  width: 0em;
  height: .5em;
  cursor: pointer;
  transition: all 0.05s ease-in-out;
  overflow: hidden;
}

.onigiri-right-top-actions .vol-slider:hover {
  height: .7em;
}
/* custom slider like the progress bar*/
.onigiri-right-top-actions .vol-slider div[type="range"].onigiri-volume-range {
  cursor: pointer;
  border-radius: 3px;
  overflow: hidden;
}

.onigiri-right-top-actions .vol-slider div[type="range"].onigiri-volume-range::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: calc(100% - var(--value) * 100%);
  height: 100%;
  background: #f2f2f2;
  transition: right 0.07s ease-in-out;
}

.onigiri-right-top-actions .vol-slider.active {
  opacity: 1;
  animation: width-ease 0.2s forwards;
}

.onigiri-right-top-actions .onigiri-volume:hover {
  opacity: 1;
}
.onigiri-right-top-actions .onigiri-volume.active {
  opacity: 1;
}

.onigiri-right-top-actions .onigiri-quit {
  cursor: pointer;
  opacity: 0.5;
}

.onigiri-right-top-actions .onigiri-quit:hover {
  opacity: 1;
}

@keyframes width-ease {
  0% {
    width: 2em;
  }
  100% {
    width: 7em;
  }
}

@keyframes width-ease-out {
  0% {
    width: 7em;
  }
  100% {
    width: 0em;
  }
}


.onigiri-subs {
  position: absolute;
  border-radius: 0.8em;
  max-height: 10em;
  overflow: hidden;
  max-width: 55em;
  padding: 16px;
  z-index: 2;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background:rgba(0, 0, 0, 0.8);
  display : none;
  transition: all 0.5s ease;
}

.onigiri-subs p {
  color: #fff;
  text-align: center;
  font-size: 1.7em;
  font-weight: 500;
  margin: 0;
  padding: 0;
}


.onigiri-controlBar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 0.8em;
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
  min-height: 20px;
  padding: 16px;
  gap: 2em;
  /* background: var(--player-bg-color); */
  /* -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
          box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset; */
    background: rgba( 0, 0, 0, 0.6 );
    backdrop-filter: blur( 20px );
    -webkit-backdrop-filter: blur( 20px );
    border-radius: 10px;
    border: 1px solid rgba( 255, 255, 255, 0.18 );
    box-shadow: 0 0 0 1px rgba(44, 44, 44, 0.568) inset;

  position: absolute;
    bottom: 5%;
    left: 5%;
    right: 5%;
    z-index: 2;
}

button {
    border: none;
    background: none;
    outline: none;
    cursor: pointer;
    height: 1.5em;
    width: 1.5em;
}

button svg {
    width: 100%;
    height: 100%;
}

.onigiri-playSvg, .onigiri-pauseSvg {
    animation: PlayPauseEnter 0.05s ease-in-out forwards;
}

.onigiri-onVidControls {
  z-index: 2;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 5em;
}

.onigiri-playpause {
  position: relative;
  height: 100%;
  width: 5em;
  cursor: pointer;
}

.onigiri-playpause .onigiri-playSvg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.onigiri-playpause .onigiri-pauseSvg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.onigiri-playpause:not(.play) .onigiri-playSvg {
    display: none;
}

.onigiri-playpause:not(.pause) .onigiri-pauseSvg {
    display: none;
}


.onigiri-next:active {
  animation: PlayPauseEnter 0.05s ease-in-out forwards;
}

/* captions button */
.onigiri-showCapsAction, .onigiri-hideCapsAction {
  animation: PlayPauseEnter 0.05s ease-in-out forwards;
}

.onigiri-captionButton:not(.hided) .onigiri-showCapsAction {
  display: none;
}

.onigiri-captionButton:not(.showed) .onigiri-hideCapsAction {
  display: none;
}


/* Progress Bar */
.onigiri-time span {
    font-size: .8em;
    font-weight: 400;
    color: var(--player-text-color);
    opacity: 0.8;
    /* the font cause the move of the timeline to fix */
    position: absolute;
}
.onigiri-timeline-container {
  height: 0.4em;
  width: 40em;
  margin-inline: .5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  transition-duration: 70ms;
}

.onigiri-loaded-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(218, 218, 218, 0);
  border-radius: 0.4em;
  transition-duration: 70ms;
}

.onigiri-loaded-buffer::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: calc(100% - var(--buffer-position) * 100%);
  background-color: rgba(218, 218, 218, 0.2);
  transition-duration: 70ms;
  border-radius: 0.4em;
}

.onigiri-timeline-container:hover {
  height: 0.6em;
}
.onigiri-timeline {
  background-color: rgba(218, 218, 218, 0.208);
  height: 100%;
  width: 100%;
  border-radius: 0.4em;
  position: relative;
  overflow: hidden;
}

.onigiri-timeline::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: calc(100% - var(--progress-position) * 1%);
  background-color: #f2f2f2;
  opacity: 1;
  transition-duration: 70ms;
}

.onigiri[type="live"] .onigiri-timeline::after {
  background-color: #ff0000;
}

.onigiri-time {
  padding: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  user-select: none;
}


div.islive {
  display: none;
  color : #f2f2f2;
  font-size: 1em;
  font-weight: 700;
  margin-left: 0.5em;
  background-color: #ff0000;
  border-radius: 0.4em;
  padding: 0.2em 0.5em;
  z-index: 2;
  height: 2em;
  align-items: center;
  justify-content: center;
}

.onigiri[type="live"] div.islive {
  display: flex;
}

.onigiri-subs-choice-box {
  position: absolute;
  bottom: 18%;
  right: 5%;
  z-index: 3;
  margin-left: auto;
  margin-right: auto;
  width: 300px;
  height: 190px;
  background: rgba( 0, 0, 0, 0.6 );
  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  box-shadow: 0 0 0 1px rgba(44, 44, 44, 0.568) inset;
  padding: 1em;
  display: none;
  color: #f2f2f2;
  overflow-y: scroll;
}

.onigiri-subs-choice-box.show {
  display: block;
}

.onigiri-subs-choice-box::-webkit-scrollbar  {
  background: rgba( 0, 0, 0, 0.0 );
}


.onigiri-subBox_list {
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.onigiri-subBox_item {
  width: 100%;
  height: 2em;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  padding: 0.5em;
  border-radius: 5px;
  color: #f2f2f2;
  font-size: 1em;
  transition: all 0.09s ease-in-out;
}


.onigiri-subBox_item.selected {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.055);
}

.onigiri-subBox_item:hover {
  background: rgba( 255, 255, 255, 0.18 );
}

.onigiri-warning {
  position: absolute;
  top: 10%;
  left: 5%;
  right: 5%;
  z-index: 3;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
  min-height: 20px;
  background: rgba( 0, 0, 0, 0.6 );
  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  box-shadow: 0 0 0 1px rgba(44, 44, 44, 0.568) inset;
  padding: 1em;
  display: none;
  color: #f2f2f2;
}

.onigiri-warning p {
  margin: 0;
  text-align: center;
}

.onigiri-warning h3 {
  margin: 0;
  text-align: center;
}

.onigiri-warning.show {
  display: block;
  animation: Warning 0.2s ease-in-out forwards;
}

@media (max-width: 768px) {
  .onigiri-controlBar {
    min-width: 30em;
  }
  .onigiri-timeline-container {
    width: 20em;
  }

  .onigiri-subs-choice-box {
    width: 200px;
    height: 150px;
  }
}
`

let loadingCss = `
.onigiri-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #fff;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    z-index: 3;
}

.onigiri-loading.load {
    opacity: 1;
    animation: load 1.5s linear infinite;
}

.onigiri-loading.load:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    background: #fff;
}

@keyframes load {
    0% {
        width: 0;
    }
    50% {
        margin-left: 40%;
        width: 60%;
    }
    100% {
        margin-left: 100%;
        width: 0;
    }
}
`

export {onigiricss, onigiriMask, allCss, loadingCss}
