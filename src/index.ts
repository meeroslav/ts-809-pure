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
  TRACK_PAN,
} from './models/track';
import {
  getContext,
  loadBuffer,
  addClass,
  removeClass,
  createLowPass,
  createGain,
  createEl,
  createTrippleDelay,
  TrippleDelayNode,
  createPanner,
} from './helpers';
import { createBtn, createRange } from './helpers/dom-helpers';

const BPM_MINUTE = 60000 / 4;

// Control variables
let bpm = 168;
let playState = false;
let playingInterval: number;
let playPosition = -1; // out of bounds
let buffers: AudioBuffer[] = [];
let audioContext: AudioContext;
let master: GainNode;
let output: GainNode;
let delay: TrippleDelayNode;
let lowPassFilter: BiquadFilterNode;
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
  // create master effects
  master = audioContext.createGain();
  delay = createTrippleDelay(audioContext);
  lowPassFilter = createLowPass(audioContext);
  output = audioContext.createGain();
  output.gain.value = 0.8;
  master.connect(delay);
  delay.connect(lowPassFilter);
  lowPassFilter.connect(output);
  output.connect(audioContext.destination);
  // load buffers
  sequenceLength = demoRhythm.length && demoRhythm[0][TRACK_SEQ].length;
  buffers = await demoRhythm
    .map(track => loadBuffer(`samples/${track[TRACK_URL]}`, audioContext))
    .reduce(async (prev, next) => {
      const nextBuffer = await next;
      return [...(await prev), nextBuffer];
    }, Promise.resolve([]));
  renderInfo();
  renderTracks();
};

const renderTracks = () => {
  demoRhythm.forEach(track => {
    const trackEl = createEl('div', 'track');
    // trackInfo element
    const trackInfoEl = createEl('div', 'track-info');
    const nickEl = createEl('span', 'track-name', track[TRACK_NICK]);
    trackInfoEl.appendChild(nickEl);
    const muteEl = createBtn(
      'Mute',
      'M',
      `track-status${track[TRACK_STATE] === TRACK_STATE_OFF ? ' track-off' : ''}`,
      () => {
        if (track[TRACK_STATE] === TRACK_STATE_OFF) {
          track[TRACK_STATE] = TRACK_STATE_ON;
          muteEl.setAttribute('class', 'track-status');
        } else {
          track[TRACK_STATE] = TRACK_STATE_OFF;
          muteEl.setAttribute('class', 'track-status track-off');
          soloEl.setAttribute('class', 'track-status');
        }
      }
    );
    trackInfoEl.appendChild(muteEl);
    const soloEl = createBtn(
      'Solo',
      'S',
      `track-status${track[TRACK_STATE] === TRACK_STATE_SOLO ? ' track-solo' : ''}`,
      () => {
        if (track[TRACK_STATE] === TRACK_STATE_SOLO) {
          track[TRACK_STATE] = TRACK_STATE_ON;
          soloEl.setAttribute('class', 'track-status');
        } else {
          track[TRACK_STATE] = TRACK_STATE_SOLO;
          muteEl.setAttribute('class', 'track-status');
          soloEl.setAttribute('class', 'track-status track-solo');
        }
      }
    );
    trackInfoEl.appendChild(soloEl);
    const volumeEl = createRange(value => (track[TRACK_VOLUME] = value));
    volumeEl.value = track[TRACK_VOLUME].toString();
    trackInfoEl.appendChild(createEl('span', 'range-info', 'Volume: '));
    trackInfoEl.appendChild(volumeEl);
    const panEl = createRange(value => (track[TRACK_PAN] = value), 1, -1, 0.01);
    panEl.value = track[TRACK_PAN].toString();
    trackInfoEl.appendChild(createEl('span', 'range-info', 'Pan: '));
    trackInfoEl.appendChild(panEl);

    trackEl.appendChild(trackInfoEl);

    track[TRACK_SEQ].forEach((step, index) => {
      const stepEl = createBtn((index + 1).toString(), '', step ? 'step-on' : 'step-off', () => {
        track[TRACK_SEQ][index] ^= 1;
        stepEl.setAttribute('class', track[TRACK_SEQ][index] ? 'step-on' : 'step-off');
      });
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
  const volumeEl = createRange(value => (output.gain.value = value));
  volumeEl.value = output.gain.value.toString();
  const volumeWrapper = createEl('div', '', 'Volume: ');
  volumeWrapper.appendChild(volumeEl);

  const lowPassEl = createRange(value => (lowPassFilter.frequency.value = value), audioContext.sampleRate / 2, 0, 1);
  lowPassEl.value = lowPassFilter.frequency.value.toString();
  const lowPassWrapper = createEl('div', '', 'LowPass freq: ');
  lowPassWrapper.appendChild(lowPassEl);

  const delayTimeEl = createRange(value => (delay.time = value), 0.5);
  delayTimeEl.value = delay.time.toString();
  const delayVolEl = createRange(value => (delay.volume = value));
  delayVolEl.value = delay.volume.toString();
  const delayWrapper = createEl('div', '', 'Delay time: ');
  delayWrapper.appendChild(delayTimeEl);
  delayWrapper.appendChild(createEl('span', '', 'volume:'));
  delayWrapper.appendChild(delayVolEl);

  infoEl.innerHTML = `<div>BPM: <b>${bpm}</b></div>`;
  infoEl.appendChild(volumeWrapper);
  infoEl.appendChild(lowPassWrapper);
  infoEl.appendChild(delayWrapper);
};

const startPlaying = (tracks: Tracks) => {
  return setInterval(() => {
    const soloOnly = tracks.some(t => t[TRACK_STATE] === TRACK_STATE_SOLO);
    if (audioContext && buffers) {
      setPosition((playPosition + 1) % sequenceLength);

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
          const panner = createPanner(audioContext, track[TRACK_PAN]);
          source.buffer = buffers[index];
          source.connect(panner);
          panner.connect(volume);
          volume.connect(master);
          source.start();
        }
      });
    }
  }, BPM_MINUTE / bpm);
};

(window as any).togglePlay = togglePlay;

init();
