// Import stylesheets
import './style.css';

// Write TypeScript code!
// const appDiv: HTMLElement = document.getElementById('app');
// appDiv.innerHTML = `
//   <h1>TS-809</h1>
//   <button type="button" onclick="togglePlay()">Toggle</button>
// `;
let playState = false;
const toggleBtn: HTMLElement = document.getElementById('toggle');
toggleBtn.innerHTML = 'Play';

const togglePlay = () => {
  playState = !playState;
  toggleBtn.innerHTML = playState ? 'Stop' : 'Play';
}

// make it globally accessible
window.togglePlay = togglePlay;