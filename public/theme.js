// Runs before first paint: applies the saved (or system) colour theme and marks JS as available.
(function () {
  var d = document.documentElement, t = null;
  d.classList.add('js');
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (t === 'dark') d.classList.add('dark');
})();
