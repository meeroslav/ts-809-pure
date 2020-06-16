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
  TRACK_PITCH,
} from './models/track';
import {
  getContext,
  loadBuffer,
  addClass,
  removeClass,
  createLowPass,
  createGain,
  createEl,
  createEcho,
  EchoNode,
  createPanner,
  LOW_PASS_MIN,
} from './helpers';
import { createBtn, createKnob, createFader } from './helpers/dom-helpers';

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
let delay: EchoNode;
let lowPassFilter: BiquadFilterNode;
let sequenceLength = 16;
let hasSolo = 0;

// DOM Elements
const toggleBtnEl: HTMLElement = document.getElementById('toggle');
const infoEl: HTMLElement = document.getElementById('info');
const tracksEl: HTMLElement = document.getElementById('tracks');

const togglePlay = () => {
  playState = !playState;
  if (playState) {
    toggleBtnEl.innerHTML = '&#9632;';
    playingInterval = startPlaying(demoRhythm);
  } else {
    toggleBtnEl.innerHTML = '&#9654;';
    clearInterval(playingInterval);
    setPosition(-1);
  }
};

const setBpm = (value: number) => {
  bpm = value;
  if (playState) {
    clearInterval(playingInterval);
    playingInterval = startPlaying(demoRhythm);
  }
};

const setPosition = (newPosition: number) => {
  playPosition = newPosition;
  highlightPosition(playPosition);
};

const calculateSolo = () => {
  return demoRhythm.reduce((acc, track) => acc + (track[TRACK_STATE] === TRACK_STATE_SOLO ? 1 : 0), 0);
};

const markActiveTracks = () => {
  hasSolo = calculateSolo();
  demoRhythm.forEach((track, index) => {
    if ((hasSolo && track[TRACK_STATE] === TRACK_STATE_SOLO) || (!hasSolo && track[TRACK_STATE] === TRACK_STATE_ON)) {
      addClass(tracksEl.childNodes[index] as HTMLDivElement, 'track-on');
    } else {
      removeClass(tracksEl.childNodes[index] as HTMLDivElement, 'track-on');
    }
  });
};

const init = async () => {
  // get context buffer
  audioContext = getContext();
  // create master effects
  master = audioContext.createGain();
  delay = createEcho(audioContext);
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
  markActiveTracks();
};

const renderTracks = () => {
  demoRhythm.forEach(track => {
    const trackEl = createEl('div', 'track');
    // trackInfo element
    const trackInfoEl = createEl('div', 'track-info');
    const trackMainEl = createEl('div', 'track-info-main');

    const nickEl = createEl('span', 'track-name', track[TRACK_NICK]);
    trackMainEl.appendChild(nickEl);
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
        markActiveTracks();
      }
    );
    trackMainEl.appendChild(soloEl);
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
          markActiveTracks();
        }
      }
    );
    trackMainEl.appendChild(muteEl);
    const volumeEl = createFader('volume', track[TRACK_VOLUME], value => {
      track[TRACK_VOLUME] = value;
    });
    trackMainEl.appendChild(volumeEl);
    trackInfoEl.appendChild(trackMainEl);

    const panEl = createKnob(
      'pan',
      track[TRACK_PAN],
      value => {
        track[TRACK_PAN] = value;
      },
      1,
      -1,
      0.01,
      true
    );
    trackInfoEl.appendChild(panEl);
    const pitchEl = createKnob(
      'detune',
      track[TRACK_PITCH],
      value => {
        track[TRACK_PITCH] = value;
      },
      12,
      -12,
      1,
      true
    );
    trackInfoEl.appendChild(pitchEl);

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
  const masterSection = createEl('div', 'info-block');
  const bpmEl = createKnob('bpm', bpm, value => setBpm(value), 300, 40, 1);
  const volumeEl = createKnob('volume', output.gain.value, value => (output.gain.value = value));
  masterSection.appendChild(bpmEl);
  masterSection.appendChild(volumeEl);

  const lowpassSection = createEl('div', 'info-block');
  lowpassSection.appendChild(createEl('label', 'info-block-label', 'low pass'));
  // Logarithm (base 2) to compute how many octaves fall in the range.
  const maxLowPass = audioContext.sampleRate / 2;
  const lowPassFreqEl = createKnob(
    'frequency',
    lowPassFilter.frequency.value,
    value => (lowPassFilter.frequency.value = value),
    maxLowPass,
    LOW_PASS_MIN,
    1
  );
  const lowPassQualityEl = createKnob(
    'quality',
    lowPassFilter.Q.value,
    value => (lowPassFilter.Q.value = value),
    30, // 30dB
    0,
    0.1
  );
  lowpassSection.appendChild(lowPassFreqEl);
  lowpassSection.appendChild(lowPassQualityEl);

  const delaySection = createEl('div', 'info-block');
  delaySection.appendChild(createEl('label', 'info-block-label', 'delay'));
  const delayTimeEl = createKnob('time', delay.time.value, value => (delay.time.value = value), 0.5);
  const delayVolEl = createKnob('volume', delay.volume.value, value => (delay.volume.value = value));
  delaySection.appendChild(delayTimeEl);
  delaySection.appendChild(delayVolEl);

  infoEl.appendChild(masterSection);
  infoEl.appendChild(lowpassSection);
  infoEl.appendChild(delaySection);
};

const startPlaying = (tracks: Tracks) => {
  return setInterval(() => {
    if (audioContext && buffers) {
      setPosition((playPosition + 1) % sequenceLength);

      tracks.forEach((track, index) => {
        if (track[TRACK_STATE] === TRACK_STATE_OFF) {
          return;
        }
        if (hasSolo && track[TRACK_STATE] !== TRACK_STATE_SOLO) {
          return;
        }
        if (track[TRACK_SEQ][playPosition]) {
          // PLAY SOUND
          const source = audioContext.createBufferSource();
          const volume = createGain(audioContext, track[TRACK_VOLUME]);
          const panner = createPanner(audioContext, track[TRACK_PAN]);
          source.buffer = buffers[index];
          source.detune.value = track[TRACK_PITCH] * 100;
          source.connect(panner);
          panner.connect(volume);
          volume.connect(master);
          source.start(0);
        }
      });
    }
  }, BPM_MINUTE / bpm);
};

(window as any).togglePlay = togglePlay;

init();
