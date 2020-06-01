export const removeClass = (el: HTMLElement, className: string) => {
  el.className = el.className.replace(` ${className}`, '');
};

export const addClass = (el: HTMLElement, className: string) => {
  el.className += ` ${className}`;
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
