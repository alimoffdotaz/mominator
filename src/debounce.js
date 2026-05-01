/** Вызывает fn после паузы delayMs без новых вызовов. */
export function debounce(fn, delayMs) {
  let t = null;
  const wrapped = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn(...args);
    }, delayMs);
  };
  wrapped.cancel = () => {
    clearTimeout(t);
    t = null;
  };
  return wrapped;
}
