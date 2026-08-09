// Demos stay unloaded until asked for: the page ships as text, the iframe is opt-in.
function mountDemo(container) {
  const frame = document.createElement('iframe');
  frame.src = container.dataset.src;
  frame.title = container.dataset.title || 'Project demo';
  frame.loading = 'lazy';
  frame.setAttribute('sandbox', 'allow-scripts');

  const stage = container.querySelector('.demo-stage');
  stage.replaceChildren(frame);
  frame.focus();

  const bar = container.querySelector('.demo-bar');
  if (bar) {
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'demo-reset';
    reset.textContent = 'Restart';
    reset.addEventListener('click', () => {
      frame.src = frame.src;
    });
    bar.replaceChild(reset, bar.querySelector('.demo-hint'));
  }
}

document.querySelectorAll('[data-demo]').forEach((container) => {
  const play = container.querySelector('[data-play]');
  if (play) play.addEventListener('click', () => mountDemo(container));
});

// The deck keeps one project in the middle and its neighbours dimmed on either
// side. Scroll snapping already pages on swipe; the arrows and a click on a
// neighbour are shortcuts to the same move.
const deck = document.getElementById('deck');

if (deck) {
  const panels = Array.from(deck.children);
  const prev = document.querySelector('[data-deck="prev"]');
  const next = document.querySelector('[data-deck="next"]');
  const position = document.querySelector('[data-deck-position]');
  const total = document.querySelector('[data-deck-total]');

  if (total) total.textContent = String(panels.length);

  // Measured rather than derived from a panel width, so the padding that lets
  // the first and last panel reach the middle does not throw the sums off.
  function offsetOf(panel) {
    return panel.getBoundingClientRect().left - deck.getBoundingClientRect().left + deck.scrollLeft;
  }

  function nearest() {
    const middle = deck.scrollLeft + deck.clientWidth / 2;
    let best = 0;
    let shortest = Infinity;
    panels.forEach((panel, index) => {
      const distance = Math.abs(offsetOf(panel) + panel.offsetWidth / 2 - middle);
      if (distance < shortest) {
        shortest = distance;
        best = index;
      }
    });
    return best;
  }

  // CSS scroll snapping is deliberately not used here: mandatory snapping
  // cancels a smooth scroll the moment it starts, so the deck never moves.
  // Paging is done here instead, and a free swipe is left alone.
  function goTo(index) {
    const panel = panels[Math.max(0, Math.min(panels.length - 1, index))];
    deck.scrollTo({
      left: offsetOf(panel) + panel.offsetWidth / 2 - deck.clientWidth / 2,
      behavior: 'smooth',
    });
  }

  function sync() {
    const index = nearest();
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
    if (position) position.textContent = String(index + 1);
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === panels.length - 1;
  }

  if (prev) prev.addEventListener('click', () => goTo(nearest() - 1));
  if (next) next.addEventListener('click', () => goTo(nearest() + 1));

  // Capture, so a link or a button on a dimmed panel never fires: the first
  // click on a neighbour only brings it to the middle.
  deck.addEventListener('click', (event) => {
    const panel = event.target.closest('.project');
    if (!panel || panel.classList.contains('is-active')) return;
    event.preventDefault();
    event.stopPropagation();
    goTo(panels.indexOf(panel));
  }, true);

  deck.addEventListener('scroll', sync, {passive: true});
  window.addEventListener('resize', sync);
  sync();
}

// Pointer light. Skipped on touch, where there is no pointer to follow, and for
// anyone who has asked the system for less motion.
const glow = document.querySelector('.glow');

if (glow && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let x = 0;
  let y = 0;
  let queued = false;

  function moveTo(clientX, clientY) {
    x = clientX;
    y = clientY;
    // One write per frame: a pointer fires far more often than the screen
    // repaints, and each write costs a style recalculation.
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      glow.style.setProperty('--glow-x', x + 'px');
      glow.style.setProperty('--glow-y', y + 'px');
      glow.classList.add('is-lit');
      queued = false;
    });
  }

  window.addEventListener('pointermove', (event) => moveTo(event.clientX, event.clientY), {passive: true});
  document.addEventListener('mouseleave', () => glow.classList.remove('is-lit'));

  // A frame keeps the pointer to itself, which would strand the light at the
  // edge of a running demo. The demo reports where the pointer is and that
  // position is translated back into page coordinates here.
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.from !== 'demo' || typeof data.x !== 'number' || typeof data.y !== 'number') return;

    const frame = Array.from(document.querySelectorAll('.demo-stage iframe'))
      .find((candidate) => candidate.contentWindow === event.source);
    if (!frame) return;

    const box = frame.getBoundingClientRect();
    moveTo(box.left + data.x, box.top + data.y);
  });
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
