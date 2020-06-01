import { demoRhythm } from './demo-track';
import {
  TRACK_NICK,
  TRACK_SEQ,
  TRACK_STATE,
  TRACK_STATE_OFF,
  TRACK_STATE_SOLO,
  TRACK_STATE_ON,
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
let playPosition = -1; // out of bounds
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
    setPosition(-1);
  }
};

const setPosition = (newPosition: number) => {
  playPosition = newPosition;
  highlightPosition(playPosition);
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
    const muteStatus = `<span class='track-status${
      track[TRACK_STATE] === TRACK_STATE_OFF ? ' track-off' : ''
    }'>M</span>`;
    const playStatus = `<span class='track-status${track[TRACK_STATE] === TRACK_STATE_ON ? ' track-on' : ''}'>P</span>`;
    const soloStatus = `<span class='track-status${
      track[TRACK_STATE] === TRACK_STATE_SOLO ? ' track-off' : ''
    }'>S</span>`;
    const trackInfo = `<span class='track-name'>${track[TRACK_NICK]}</span>${muteStatus}${playStatus}${soloStatus}`;
    return `${acc}<div class='track'><div class='track-info'>${trackInfo}</div>${trackSteps}</div>`;
  }, '');
};

const highlightPosition = (position: number) => {
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

const startPlaying = (tracks: Tracks) => {
  const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
  return setInterval(() => {
    if (audioContext && buffers) {
      setPosition((playPosition + 1) % sequenceLength);
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
  }, BPM_MINUTE / bpm);
};

(window as any).togglePlay = togglePlay;

init();
