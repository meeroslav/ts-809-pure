export const removeClass = (el: HTMLElement, className: string) => {
  el.className = el.className.replace(` ${className}`, '');
};

export const addClass = (el: HTMLElement, className: string) => {
  if (!el.className.match(className)) {
    el.className += ` ${className}`;
  }
};

export const toggleClass = (el: HTMLElement, className: string) => {
  if (el.className.match(className)) {
    removeClass(el, className);
  } else {
    addClass(el, className);
  }
};

export const createEl = (type: string, className: string = '', innerHTML: string = ''): HTMLElement => {
  const el: HTMLElement = document.createElement(type);
  el.setAttribute('class', className);
  el.innerHTML = innerHTML;
  return el;
};

export const createBtn = (title: string, text: string, className: string, callback: () => void): HTMLButtonElement => {
  const el: HTMLButtonElement = document.createElement('button');
  el.setAttribute('type', 'button');
  el.setAttribute('title', title);
  el.setAttribute('class', className);
  el.innerHTML = text;
  el.onclick = callback;
  return el;
};

export const createRange = (callback: (value: number) => void, max = 1, min = 0, step = 0.01): HTMLInputElement => {
  const el: HTMLInputElement = document.createElement('input');
  el.setAttribute('type', 'range');
  el.setAttribute('min', min.toString());
  el.setAttribute('max', max.toString());
  el.setAttribute('step', step.toString());
  el.oninput = (e: Event) => callback((e.target as HTMLInputElement).valueAsNumber);
  return el;
};

const HANDLE_W = 6;
const HANDLE_H = 10;
const HANDLE_OFFSET_H = 2;
const FADER_H = 6;
const FADER_W = 70;
const FADER_X = 5;
const FADER_Y = 4;

export const createFader = (
  label: string,
  value: number,
  callback: (value: number) => void,
  max = 1,
  min = 0,
  step = 0.01
): HTMLElement => {
  const el: HTMLElement = createEl('div', 'fader');

  // create svg
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const wrapperEl: HTMLElement = createEl('div', 'fader-range-wrapper');
  const normalizedValue = ((value - min) * FADER_W) / (max - min);
  svgEl.setAttribute('class', 'fader-visual');
  svgEl.innerHTML = `
    <rect class="fader-bg" x="${FADER_X}" y="${FADER_Y}" width="${FADER_W}" height="${FADER_H}" ></rect>
    <rect class="fader-indicator" x="${FADER_X}" y="${FADER_Y}" width="${normalizedValue}" height="${FADER_H}" ></rect>
    <rect class="fader-handle" x="${FADER_X + normalizedValue - HANDLE_W / 2}" y="${
    FADER_Y - HANDLE_OFFSET_H
  }" width="${HANDLE_W}" height="${HANDLE_H}" ></rect>
  `;
  svgEl.setAttribute('viewBox', '0 0 80 14');
  wrapperEl.appendChild(svgEl);
  const internalCallback = (val: number) => {
    callback(val);
  };
  // create range
  const rangeEl = createRange(internalCallback, max, min, step);
  rangeEl.setAttribute('class', 'fader-range');
  rangeEl.value = value.toString();
  wrapperEl.appendChild(rangeEl);
  // append elements to root
  el.appendChild(wrapperEl);
  const labelEl = createEl('div', 'fader-label', label);
  el.appendChild(labelEl);
  return el;
};

const CIRCLE_POS = 20;
const CIRCLE_SIZE = 15;
const DIAL_SIZE = 10;
const DOT_OFFSET = CIRCLE_POS + 7;
const radianConverter = Math.PI / 180;
function circlePosX(value: number): number {
  return CIRCLE_SIZE * Math.cos((value * 3 + 120) * radianConverter) + CIRCLE_POS;
}
function circlePosY(value: number): number {
  return CIRCLE_SIZE * Math.sin((value * 3 + 120) * radianConverter) + CIRCLE_POS;
}
function largeArcFlag(value: number) {
  return value > 60 ? 1 : 0;
}
const PATH_PREFIX = `M${circlePosX(0)},${circlePosY(0)}A${CIRCLE_SIZE},${CIRCLE_SIZE},0`;
const PATH_SUFIX = `L${CIRCLE_POS},${CIRCLE_POS}Z`;
export const createKnob = (
  label: string,
  value: number,
  callback: (value: number) => void,
  max = 1,
  min = 0,
  step = 0.01
) => {
  const el: HTMLElement = createEl('div', 'knob');
  const wrapperEl: HTMLElement = createEl('div', 'knob-range-wrapper');
  // create svg
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('class', 'knob-visual');
  const normalizedValue = ((value - min) * 100) / (max - min);
  svgEl.innerHTML = `
    <path class="knob-ring-bg" d="${PATH_PREFIX},1,1,${circlePosX(100)},${circlePosY(100)}${PATH_SUFIX}"></path>
    <path class="knob-ring" d="${PATH_PREFIX},${largeArcFlag(normalizedValue)},1,${circlePosX(
    normalizedValue
  )},${circlePosY(normalizedValue)}${PATH_SUFIX}"></path>
    <g class="knob-dial">
      <circle class="knob-top" cx="${CIRCLE_POS}" cy="${CIRCLE_POS}" r="${DIAL_SIZE}"></circle>
      <circle class="knob-indictator-dot" cx="${CIRCLE_POS}" cy="${DOT_OFFSET}" r="1" style="transform: rotate(${
    30 + 3 * normalizedValue
  }deg);"></circle>
    </g>
  `;
  svgEl.setAttribute('viewBox', '0 0 40 40');
  wrapperEl.appendChild(svgEl);
  const internalCallback = (val: number) => {
    callback(val);
    const norm = ((val - min) * 100) / (max - min);
    const ring: SVGPathElement = svgEl.getElementsByClassName('knob-ring')[0] as SVGPathElement;
    ring.setAttribute(
      'd',
      `${PATH_PREFIX},${largeArcFlag(norm)},1,${circlePosX(norm)},${circlePosY(norm)}${PATH_SUFIX}`
    );
    const dot: SVGCircleElement = svgEl.getElementsByClassName('knob-indictator-dot')[0] as SVGCircleElement;
    dot.style.transform = `rotate(${30 + 3 * norm}deg)`;
  };
  // create range
  const rangeEl = createRange(internalCallback, max, min, step);
  rangeEl.setAttribute('class', 'knob-range');
  rangeEl.value = value.toString();
  wrapperEl.appendChild(rangeEl);
  // append elements to root
  el.appendChild(wrapperEl);
  const labelEl = createEl('div', 'knob-label', label);
  el.appendChild(labelEl);
  return el;
};
