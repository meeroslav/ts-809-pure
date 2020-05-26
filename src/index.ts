import { demoRhythm } from './demo-track';
import { TRACK_SEQ, TRACK_STATE, TRACK_STATE_OFF, TRACK_STATE_SOLO, TRACK_URL, Tracks } from './models/track';
import { getContext } from './helpers/audio-context';
import { loadBuffer } from './helpers/buffer-loader';

const bpm = 168;
const BPM_MINUTE = 60000 / 4;

let playState = false;
let playingInterval: number;
let playPosition = 0;
let buffers: AudioBuffer[] = [];
let audioContext: AudioContext;
let sequenceLength = 16;
const toggleBtnEl: HTMLElement = document.getElementById('toggle') || new HTMLElement();
const infoEl: HTMLElement = document.getElementById('info') || new HTMLElement();
const tracksEl: HTMLElement = document.getElementById('tracks') || new HTMLElement();
toggleBtnEl.innerHTML = 'Play';

const togglePlay = () => {
  playState = !playState;
  if (playState) {
    toggleBtnEl.innerHTML = 'Stop';
    playingInterval = startPlaying(demoRhythm);
  } else {
    toggleBtnEl.innerHTML = 'Play';
    clearInterval(playingInterval);
    playPosition = 0;
    renderInfo();
  }
};

const init = async () => {
  // get context buffer
  audioContext = getContext();
  // load buffers
  sequenceLength = demoRhythm.length && demoRhythm[0][TRACK_SEQ].length;
  buffers = await demoRhythm
    .map(track => loadBuffer(`samples/${track[TRACK_URL]}`, audioContext))
    .reduce(async (prev, next, index) => {
      const nextBuffer = await next;
      return [...(await prev), nextBuffer];
    }, Promise.resolve([]));
  togglePlay();
  renderTracks();
};

const renderTracks = () => {
  tracksEl.innerHTML = demoRhythm.reduce((acc, track) => {
    const trackSteps = track[TRACK_SEQ].map(step => `<span class="${ step ? 'step-on' : 'step-off' }"></span>`).join('');
    return `${acc}<div class='track'>${trackSteps}</div>`;
  }, '');
  tracksEl.childNodes.forEach(track => console.log(track.childNodes));
};

const highlightTrackStep = (position: number) => {
  const oldPos = (position + sequenceLength - 1) % sequenceLength;
  console.log(position, oldPos);

  tracksEl.childNodes.forEach(track => {
    removeClass(track.childNodes[oldPos] as HTMLSpanElement, 'step-highlight');
    addClass(track.childNodes[position] as HTMLSpanElement, 'step-highlight');
  });
};

const removeClass = (el: HTMLElement, className: string) => {
  el.className = el.className.replace(` ${className}`, '');
};

const addClass = (el: HTMLElement, className: string) => {
  el.className += ` ${className}`;
};

const toggleClass = (el: HTMLElement, className: string) => {
  if (el.className.match(className)) {
    removeClass(el, className);
  } else {
    addClass(el, className);
  }
};

const renderInfo = () => {
  infoEl.innerHTML = `
    Position: ${playPosition}<br/>
    BPM: ${bpm}
   `;
};

const startPlaying = (tracks: Tracks) => setInterval(() => {
  renderInfo();
  highlightTrackStep(playPosition);
  const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
  if (audioContext && buffers) {
    tracks.forEach((track, index) => {
      if (track[TRACK_STATE] === TRACK_STATE_OFF) {
        return;
      }
      if (soloOnly && track[TRACK_STATE] !== TRACK_STATE_SOLO) {
        return;
      }
      if (track[TRACK_SEQ][playPosition]) {
        // PLAY SOUND
        const trackSource = audioContext.createBufferSource();
        trackSource.buffer = buffers[index];
        trackSource.connect(audioContext.destination);
        trackSource.start();
      }
    });
  }
  playPosition = (playPosition + 1) % sequenceLength;
}, BPM_MINUTE / bpm);

(window as any).togglePlay = togglePlay;

init();
