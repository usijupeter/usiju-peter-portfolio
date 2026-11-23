// Runs before first paint: applies the saved (or system) colour theme and marks JS as available.
(function () {
  var d = document.documentElement, t = null;
  d.classList.add('js');
  try { t = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (t === 'dark') d.classList.add('dark');
  // Safety net: the 'js' class hides scroll-reveal content until the app shows it. Module scripts run before
  // the load event, so if the app hasn't marked itself ready by then (blocked, failed or crashed), show everything.
  window.addEventListener('load', function () { if (!d.hasAttribute('data-app')) d.classList.remove('js'); });
})();
