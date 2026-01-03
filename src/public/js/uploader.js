// Minimal preview for file input
document.addEventListener('change', (e) => {
  const input = e.target;
  if (input.type === 'file' && input.files && input.files[0]) {
    const url = URL.createObjectURL(input.files[0]);
    const img = document.createElement('img');
    img.src = url; img.className = 'w-24 h-24 object-cover rounded';
    input.parentElement.appendChild(img);
  }
});

