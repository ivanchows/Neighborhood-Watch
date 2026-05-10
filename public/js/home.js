document.querySelectorAll('[data-incident]').forEach(el => {
  el.addEventListener('click', () => {
    window.location.href = '/incidents';
  });
});
