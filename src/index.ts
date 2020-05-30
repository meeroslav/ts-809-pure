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
import { getContext, loadBuffer, addClass, removeClass, createLowPass, createGain } from './helpers';
import { createTrippleDelay } from './helpers/audio-filters';

const BPM_MINUTE = 60000 / 4;

// Control variables
let bpm = 168;
let playState = false;
let playingInterval: number;
let playPosition = 0;
let buffers: AudioBuffer[] = [];
let audioContext: AudioContext;
let sequenceLength = 16;

// DOM Elements
const toggleBtnEl: HTMLElement = document.getElementById('toggle');
const infoEl: HTMLElement = document.getElementById('info');
const tracksEl: HTMLElement = document.getElementById('tracks');

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
    BPM: <b>${bpm}</b>
   `;
};

const startPlaying = (tracks: Tracks) =>
  setInterval(() => {
    highlightTrackStep(playPosition);
    const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
    if (audioContext && buffers) {
      const delay = createTrippleDelay(audioContext);
      const lowPassFilter = createLowPass(audioContext);

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
          const volume = createGain(audioContext, track[TRACK_VOLUME]);
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
