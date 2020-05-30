import { demoRhythm } from './demo-track';
import {
  TRACK_NICK,
  TRACK_SEQ,
  TRACK_STATE,
  TRACK_STATE_OFF,
  TRACK_STATE_SOLO,
  TRACK_URL,
  Tracks,
  TRACK_VOLUME,
} from './models/track';
import { getContext, loadBuffer, addClass, removeClass } from './helpers';

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
    highlightTrackStep(playPosition);
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
    const trackSteps = track[TRACK_SEQ].map(step => `<span class="${step ? 'step-on' : 'step-off'}"></span>`).join('');
    return `${acc}<div class='track'><span class='track-name'>${track[TRACK_NICK]}</span>${trackSteps}</div>`;
  }, '');
};

const highlightTrackStep = (position: number) => {
  tracksEl.childNodes.forEach(track => {
    track.childNodes.forEach(step => removeClass(step as HTMLSpanElement, 'step-highlight'));
    addClass(track.childNodes[position + 1] as HTMLSpanElement, 'step-highlight');
  });
};

const renderInfo = () => {
  infoEl.innerHTML = `
    Position: ${playPosition}<br/>
    BPM: ${bpm}
   `;
};

const startPlaying = (tracks: Tracks) =>
  setInterval(() => {
    renderInfo();
    highlightTrackStep(playPosition);
    const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
    if (audioContext && buffers) {
      const delay = audioContext.createDelay();
      delay.delayTime.value = 0;

      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = audioContext.sampleRate / 2;

      tracks.forEach((track, index) => {
        if (track[TRACK_STATE] === TRACK_STATE_OFF) {
          return;
        }
        if (soloOnly && track[TRACK_STATE] !== TRACK_STATE_SOLO) {
          return;
        }
        if (track[TRACK_SEQ][playPosition]) {
          // PLAY SOUND
          const source = audioContext.createBufferSource();
          const volume = audioContext.createGain();
          volume.gain.value = track[TRACK_VOLUME];
          source.buffer = buffers[index];
          source.connect(volume);
          volume.connect(lowPassFilter);
          lowPassFilter.connect(delay);
          delay.connect(audioContext.destination);
          source.start();
        }
      });
    }
    playPosition = (playPosition + 1) % sequenceLength;
  }, BPM_MINUTE / bpm);

(window as any).togglePlay = togglePlay;

init();
