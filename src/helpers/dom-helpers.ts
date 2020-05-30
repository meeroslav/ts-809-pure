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
