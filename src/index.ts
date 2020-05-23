import { Tracks } from './models/track';

// Write TypeScript code!
// const appDiv: HTMLElement = document.getElementById('app');
// appDiv.innerHTML = `
//   <h1>TS-809</h1>
//   <button type="button" onclick="togglePlay()">Toggle</button>
// `;
let playState = false;
const toggleBtn: HTMLElement = document.getElementById('toggle');
toggleBtn.innerHTML = 'Play';

const tracks: Tracks = [
  []
];

const togglePlay = () => {
  playState = !playState;
  toggleBtn.innerHTML = playState ? 'Stop' : 'Play';
}
