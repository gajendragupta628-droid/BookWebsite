(() => {
  // Minimal Alpine-like helpers
  const toasts = document.getElementById('toasts');
  window.toast = (msg) => {
    if (!toasts) return alert(msg);
    const el = document.createElement('div');
    el.className = 'rounded bg-charcoal text-ivory px-3 py-2 shadow-soft';
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };
  // Merge localStorage cart to session if needed
  try {
    const cartLS = JSON.parse(localStorage.getItem('cart') || '[]');
    const mergedOnce = sessionStorage.getItem('cart-merged');
    if (cartLS.length && !mergedOnce) {
      fetch('/cart/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines: cartLS }) })
        .then(() => sessionStorage.setItem('cart-merged', '1'))
        .catch(()=>{});
    }
  } catch {}
})();
