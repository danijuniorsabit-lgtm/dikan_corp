// Mirrors src/assets/scss/abstracts/_breakpoints.scss — keep both in sync.
export const BREAKPOINTS = {
  xxl: 1920,
  xl: 1440,
  lg: 1280,
  md: 1024,
  sm: 768,
  xs: 480,
  xxs: 375,
};

export const matches = (name) => window.matchMedia(`(max-width: ${BREAKPOINTS[name]}px)`).matches;

export const onBreakpointChange = (name, callback) => {
  const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[name]}px)`);
  const listener = (event) => callback(event.matches);
  mql.addEventListener('change', listener);
  callback(mql.matches);
  return () => mql.removeEventListener('change', listener);
};
