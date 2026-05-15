const SWIPE_THRESHOLD_PX = 80;
const SWIPE_VELOCITY_PX_MS = 0.5;

/**
 * Attaches swipe detection to `element` via PointerEvents.
 * `indicatorLeft` and `indicatorRight` (optional) fade in as the card drags.
 * Fires a CustomEvent `swipe` with `detail: { direction: 'left'|'right' }` on commit.
 * Returns a cleanup function that removes all listeners.
 */
export function attachSwipe(element, indicatorLeft = null, indicatorRight = null) {
  let startX = 0;
  let startTime = 0;
  let dragging = false;

  function applyIndicators(dx) {
    const ratio = Math.min(Math.abs(dx) / SWIPE_THRESHOLD_PX, 1);
    if (indicatorLeft)  indicatorLeft.style.opacity  = dx < 0 ? ratio : 0;
    if (indicatorRight) indicatorRight.style.opacity = dx > 0 ? ratio : 0;
  }

  function resetIndicators() {
    if (indicatorLeft)  indicatorLeft.style.opacity  = 0;
    if (indicatorRight) indicatorRight.style.opacity = 0;
  }

  function applyTransform(dx) {
    const deg = dx * 0.05;
    element.style.transform = `translateX(${dx}px) rotate(${deg}deg)`;
    applyIndicators(dx);
  }

  function commit(direction) {
    element.style.transition = '';
    element.style.transform = '';
    element.classList.remove('dragging');
    resetIndicators();
    element.dispatchEvent(new CustomEvent('swipe', {
      bubbles: true,
      detail: { direction },
    }));
  }

  function springBack() {
    element.style.transition = 'transform 0.3s ease';
    element.style.transform = '';
    element.classList.remove('dragging');
    resetIndicators();
    element.addEventListener('transitionend', () => {
      element.style.transition = '';
    }, { once: true });
  }

  function onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    startX = e.clientX;
    startTime = e.timeStamp;
    dragging = true;
    element.setPointerCapture(e.pointerId);
    element.classList.add('dragging');
    element.style.transition = 'none';
    element.style.willChange = 'transform';
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    applyTransform(dx);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    element.style.willChange = '';

    const dx = e.clientX - startX;
    const dt = e.timeStamp - startTime;
    const velocity = dt > 0 ? Math.abs(dx) / dt : 0;
    const absDx = Math.abs(dx);

    if (absDx > SWIPE_THRESHOLD_PX || velocity > SWIPE_VELOCITY_PX_MS) {
      commit(dx < 0 ? 'left' : 'right');
    } else {
      springBack();
    }
  }

  function onPointerCancel() {
    if (!dragging) return;
    dragging = false;
    element.style.willChange = '';
    springBack();
  }

  element.style.touchAction = 'none';
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerCancel);

  return function cleanup() {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointercancel', onPointerCancel);
  };
}
