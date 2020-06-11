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

export const createEl = (type: string, className: string = '', innerText: string = ''): HTMLElement => {
  const el: HTMLElement = document.createElement(type);
  el.setAttribute('class', className);
  el.innerText = innerText;
  return el;
};

export const createBtn = (title: string, text: string, className: string, callback: () => void): HTMLButtonElement => {
  const el: HTMLButtonElement = document.createElement('button');
  el.setAttribute('type', 'button');
  el.setAttribute('title', title);
  el.setAttribute('class', className);
  el.innerText = text;
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

export const createFader = (
  label: string,
  value: number,
  callback: (value: number) => void,
  max = 1,
  min = 0,
  step = 0.01
): HTMLElement => {
  const el: HTMLElement = createEl('div', 'fader');
  // create range
  const wrapperEl: HTMLElement = createEl('div', 'fader-range-wrapper');
  const rangeEl = createRange(callback, max, min, step);
  rangeEl.setAttribute('class', 'fader-range');
  rangeEl.value = value.toString();
  wrapperEl.appendChild(rangeEl);
  // append elements to root
  el.appendChild(wrapperEl);
  const labelEl = createEl('div', 'fader-label', label);
  el.appendChild(labelEl);
  return el;
};

export const createKnob = (
  label: string,
  value: number,
  callback: (value: number) => void,
  max = 1,
  min = 0,
  step = 0.01
) => {
  const el: HTMLElement = createEl('div', 'knob');
  // create range
  const wrapperEl: HTMLElement = createEl('div', 'knob-range-wrapper');
  const rangeEl = createRange(callback, max, min, step);
  rangeEl.setAttribute('class', 'knob-range');
  rangeEl.value = value.toString();
  wrapperEl.appendChild(rangeEl);
  // append elements to root
  el.appendChild(wrapperEl);
  const labelEl = createEl('div', 'knob-label', label);
  el.appendChild(labelEl);
  return el;
};
