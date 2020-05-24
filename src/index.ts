import { demoRhythm } from './demo-track';
import { Tracks } from './models/track';
import { getContext } from './helpers/audio-context';
import { loadBuffer } from './helpers/buffer-loader';

const bpm = 168;
const BPM_MINUTE = 60000 / 4;

let playState = false;
let playingInterval: number;
let playPosition = 0;
let buffers: AudioBuffer[] = [];
let audioContext: AudioContext;
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
  }
};

const init = async () => {
  // get context buffer
  audioContext = getContext();
  // load buffers
  buffers = await demoRhythm
    .map(track => loadBuffer(`samples/${track[0]}`, audioContext))
    .reduce(async (prev, next, index) => {
      const nextBuffer = await next;
      return [...(await prev), nextBuffer];
    }, Promise.resolve([]));
  togglePlay();
};

const startPlaying = (tracks: Tracks) => setInterval(() => {
  playPosition = (playPosition + 1) % 16;
  info.innerHTML = `
    <br/>
    Position: ${playPosition}
    <br/>
    BPM: ${bpm}
   `;
  if (audioContext && buffers) {
    tracks.forEach((track, index) => {
      if (track[playPosition + 1]) {
        // PLAY SOUND
        const trackSource = audioContext.createBufferSource();
        trackSource.buffer = buffers[index];
        trackSource.connect(audioContext.destination);
        trackSource.start();
      }
    });
  }
}, BPM_MINUTE / bpm);

(window as any).togglePlay = togglePlay;

init();
