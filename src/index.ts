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
  renderInfo();
  renderTracks();
};

const renderTracks = () => {
  demoRhythm.forEach(track => {
    const trackEl = document.createElement('div');
    trackEl.setAttribute('class', 'track');
    // trackInfo element
    const trackInfoEl = document.createElement('div');
    trackInfoEl.setAttribute('class', 'track-info');
    const nickEl = document.createElement('span');
    nickEl.setAttribute('class', 'track-name');
    nickEl.innerText = track[TRACK_NICK];
    trackInfoEl.appendChild(nickEl);
    const muteEl = document.createElement('button');
    muteEl.setAttribute('type', 'button');
    muteEl.setAttribute('title', 'Mute');
    muteEl.setAttribute('class', `track-status${track[TRACK_STATE] === TRACK_STATE_OFF ? ' track-off' : ''}`);
    muteEl.innerText = 'M';
    muteEl.onclick = () => {
      track[TRACK_STATE] = TRACK_STATE_OFF;
      muteEl.setAttribute('class', 'track-status track-off');
      onEl.setAttribute('class', 'track-status');
      soloEl.setAttribute('class', 'track-status');
    };
    trackInfoEl.appendChild(muteEl);
    const onEl = document.createElement('button');
    onEl.setAttribute('type', 'button');
    onEl.setAttribute('title', 'On');
    onEl.setAttribute('class', `track-status${track[TRACK_STATE] === TRACK_STATE_ON ? ' track-on' : ''}`);
    onEl.innerText = 'O';
    onEl.onclick = () => {
      track[TRACK_STATE] = TRACK_STATE_ON;
      muteEl.setAttribute('class', 'track-status');
      onEl.setAttribute('class', 'track-status track-on');
      soloEl.setAttribute('class', 'track-status');
    };
    trackInfoEl.appendChild(onEl);
    const soloEl = document.createElement('button');
    soloEl.setAttribute('type', 'button');
    soloEl.setAttribute('title', 'Solo');
    soloEl.setAttribute('class', `track-status${track[TRACK_STATE] === TRACK_STATE_SOLO ? ' track-solo' : ''}`);
    soloEl.innerText = 'S';
    soloEl.onclick = () => {
      track[TRACK_STATE] = TRACK_STATE_SOLO;
      muteEl.setAttribute('class', 'track-status');
      onEl.setAttribute('class', 'track-status');
      soloEl.setAttribute('class', 'track-status track-solo');
    };
    trackInfoEl.appendChild(soloEl);
    trackEl.appendChild(trackInfoEl);

    track[TRACK_SEQ].forEach(step => {
      const stepEl = document.createElement('span');
      stepEl.setAttribute('class', step ? 'step-on' : 'step-off');
      trackEl.appendChild(stepEl);
    });

    tracksEl.appendChild(trackEl);
  });
};

const highlightPosition = (position: number) => {
  tracksEl.childNodes.forEach(track => {
    track.childNodes.forEach(step => removeClass(step as HTMLSpanElement, 'step-highlight'));
    if (position >= 0) {
      addClass(track.childNodes[position + 1] as HTMLSpanElement, 'step-highlight');
    }
  });
};

const renderInfo = () => {
  infoEl.innerHTML = `
    BPM: <b>${bpm}</b>
   `;
};

const startPlaying = (tracks: Tracks) => {
  return setInterval(() => {
    const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
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
