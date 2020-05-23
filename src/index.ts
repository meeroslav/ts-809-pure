let playState = false;
const toggleBtn: HTMLElement = document.getElementById('toggle') || new HTMLElement();
toggleBtn.innerHTML = 'Play';

const togglePlay = () => {
  playState = !playState;
  toggleBtn.innerHTML = playState ? 'Stop' : 'Play';
};

(window as any).togglePlay = togglePlay;
