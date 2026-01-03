async function post(url) {
  const res = await fetch(url, { method: 'POST' });
  return res.json();
}

function setWishlistState(id, inWishlist) {
  document.querySelectorAll(`[data-toggle-wishlist][data-id="${CSS.escape(id)}"]`).forEach((btn) => {
    btn.setAttribute('aria-pressed', inWishlist ? 'true' : 'false');
    const activeIcon = btn.querySelector('.wishlist-icon-active');
    const outlineIcon = btn.querySelector('.wishlist-icon-outline');

    if (activeIcon && outlineIcon) {
      activeIcon.hidden = !inWishlist;
      outlineIcon.hidden = inWishlist;
      activeIcon.setAttribute('aria-hidden', inWishlist ? 'false' : 'true');
      outlineIcon.setAttribute('aria-hidden', inWishlist ? 'true' : 'false');
    }

    if (btn.classList.contains('product-card-wishlist')) {
      btn.classList.toggle('product-card-wishlist-active', inWishlist);
      btn.setAttribute('aria-label', inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist');
      btn.title = inWishlist ? 'Remove from wishlist' : 'Add to wishlist';
      return;
    }

    if (btn.classList.contains('btn-wishlist')) {
      btn.classList.toggle('active', inWishlist);
      const icon = btn.querySelector('svg.btn-icon');
      if (icon) icon.setAttribute('fill', inWishlist ? 'currentColor' : 'none');
      const label = btn.querySelector('.btn-text');
      if (label) label.textContent = inWishlist ? 'In Wishlist' : 'Add to Wishlist';
      btn.title = inWishlist ? 'Remove from wishlist' : 'Add to wishlist';
      return;
    }

    // Generic fallback: only update tooltip/title; do not clobber button contents.
    btn.title = inWishlist ? 'Remove from wishlist' : 'Add to wishlist';
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
