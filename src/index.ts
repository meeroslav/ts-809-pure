import { Tracks } from './models/track';

// Write TypeScript code!
// const appDiv: HTMLElement = document.getElementById('app');
// appDiv.innerHTML = `
//   <h1>TS-809</h1>
//   <button type="button" onclick="togglePlay()">Toggle</button>
// `;
let playState = false;
const toggleBtn: HTMLElement = document.getElementById('toggle') || new HTMLElement();
toggleBtn.innerHTML = 'Play';

const tracks: Tracks = [
  ['samples', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const togglePlay = () => {
  playState = !playState;
  toggleBtn.innerHTML = playState ? 'Stop' : 'Play';
};

(window as any).togglePlay = togglePlay;
