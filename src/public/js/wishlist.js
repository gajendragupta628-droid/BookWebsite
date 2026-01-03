async function post(url) {
  const res = await fetch(url, { method: 'POST' });
  return res.json();
}

function setWishlistState(id, inWishlist) {
  document.querySelectorAll(`[data-toggle-wishlist][data-id="${CSS.escape(id)}"]`).forEach((btn) => {
    btn.setAttribute('aria-pressed', inWishlist ? 'true' : 'false');
    if (inWishlist) {
      btn.classList.add('text-gold', 'border-gold');
      btn.classList.remove('text-charcoal');
      btn.textContent = '❤';
      btn.title = 'Wishlisted';
    } else {
      btn.classList.remove('text-gold', 'border-gold');
      btn.textContent = '❤';
      btn.title = 'Add to wishlist';
    }
  });
}

// Hydrate initial wishlist button states from localStorage
document.addEventListener('DOMContentLoaded', () => {
  try {
    const ls = new Set(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    document.querySelectorAll('[data-toggle-wishlist]').forEach((btn) => {
      const id = btn.getAttribute('data-id');
      setWishlistState(id, ls.has(id));
    });
  } catch {}
});

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-toggle-wishlist]');
  if (btn) {
    const id = btn.getAttribute('data-id');
    const data = await post(`/wishlist/${id}`);
    if (data.ok) toast(data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    try {
      const ls = new Set(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      if (data.inWishlist) ls.add(id); else ls.delete(id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(ls)));
      setWishlistState(id, data.inWishlist);
    } catch {}
  }
});
