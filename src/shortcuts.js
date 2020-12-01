export function addShortcut(modifier, keys, callback) {
  const onKeyDown = (e) => {
    if (e[modifier] && keys.includes(e.code)) {
      callback(e);
    }
  };

  document.addEventListener('keydown', onKeyDown);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
  };
}
