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
const toggleBtn: HTMLElement = document.getElementById('toggle') || new HTMLElement();
const info: HTMLElement = document.getElementById('info') || new HTMLElement();
toggleBtn.innerHTML = 'Play';

const togglePlay = () => {
  playState = !playState;
  if (playState) {
    toggleBtn.innerHTML = 'Stop';
    playingInterval = startPlaying(demoRhythm);
  } else {
    toggleBtn.innerHTML = 'Play';
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
};

const renderInfo = () => {
  info.innerHTML = `
    Position: ${playPosition}<br/>
    BPM: ${bpm}
   `;
};

const startPlaying = (tracks: Tracks) => setInterval(() => {
  renderInfo();
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
