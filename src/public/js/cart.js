async function postJSON(url, data) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

function setCartState(id, inCart) {
  document.querySelectorAll(`[data-add-to-cart][data-id="${CSS.escape(id)}"]`).forEach((btn) => {
    if (inCart) {
      btn.setAttribute('data-state', 'in-cart');
      btn.textContent = 'In Cart';
      btn.classList.add('bg-onyx');
    } else {
      btn.setAttribute('data-state', 'idle');
      btn.textContent = 'Add to Cart';
      btn.classList.remove('bg-onyx');
    }
  });
}

// Hydrate cart states from localStorage
document.addEventListener('DOMContentLoaded', () => {
  try {
    const cartLS = JSON.parse(localStorage.getItem('cart') || '[]');
    const ids = new Set(cartLS.map(l => l.bookId));
    document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      const id = btn.getAttribute('data-id');
      setCartState(id, ids.has(id));
    });
  } catch {}
});

document.addEventListener('click', async (e) => {
  const add = e.target.closest('[data-add-to-cart]');
  if (add) {
    const id = add.getAttribute('data-id');
    const qtyEl = document.getElementById('qty');
    const qty = qtyEl ? parseInt(qtyEl.value || '1', 10) : 1;
    const data = await postJSON('/cart/add', { bookId: id, qty });
    if (data.ok) toast('Added to cart');
    try {
      const cartLS = JSON.parse(localStorage.getItem('cart') || '[]');
      const line = cartLS.find(l => l.bookId === id);
      if (line) line.qty = qty; else cartLS.push({ bookId: id, qty });
      localStorage.setItem('cart', JSON.stringify(cartLS));
      setCartState(id, true);
    } catch {}
  }
  const rm = e.target.closest('[data-cart-remove]');
  if (rm) {
    const id = rm.getAttribute('data-id');
    const data = await postJSON('/cart/remove', { bookId: id });
    if (data.ok) location.reload();
    try {
      const cartLS = JSON.parse(localStorage.getItem('cart') || '[]').filter(l => l.bookId !== id);
      localStorage.setItem('cart', JSON.stringify(cartLS));
    } catch {}
  }
});

let qtyChangeTimeout;
document.addEventListener('input', (e) => {
  const qty = e.target.closest('[data-cart-qty]');
  if (qty) {
    clearTimeout(qtyChangeTimeout);
    qtyChangeTimeout = setTimeout(async () => {
      const lines = Array.from(document.querySelectorAll('[data-cart-qty]')).map(el => ({ bookId: el.getAttribute('data-id'), qty: parseInt(el.value || '1', 10) }));
      const data = await postJSON('/cart/update', { lines });
      if (data.ok) location.reload();
      try { localStorage.setItem('cart', JSON.stringify(lines)); } catch {}
    }, 300);
  }
});

// Buy Now from product page
document.addEventListener('click', (e) => {
  const buy = e.target.closest('[data-buy-now]');
  if (buy) {
    const id = buy.getAttribute('data-id');
    const qtyEl = document.getElementById('qty');
    const qty = qtyEl ? parseInt(qtyEl.value || '1', 10) : 1;
    window.location.href = `/buy/${encodeURIComponent(id)}?qty=${encodeURIComponent(qty)}`;
  }
});
