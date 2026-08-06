export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const on = (target, type, handler, options) => {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
};

export const toggleClass = (el, className, force) => el.classList.toggle(className, force);
