// Book Form Enhancements

// Tab switching
document.querySelectorAll('.book-form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update tabs
    document.querySelectorAll('.book-form-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update content
    document.querySelectorAll('.book-form-tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });
  });
});

// Character counters
const summaryTextarea = document.querySelector('[name="summary"]');
const metaTitleInput = document.querySelector('[name="metaTitle"]');
const metaDescriptionTextarea = document.querySelector('[name="metaDescription"]');

if (summaryTextarea) {
  updateCounter('summaryCount', summaryTextarea.value.length);
  summaryTextarea.addEventListener('input', (e) => {
    updateCounter('summaryCount', e.target.value.length);
  });
}

if (metaTitleInput) {
  updateCounter('metaTitleCount', metaTitleInput.value.length);
  metaTitleInput.addEventListener('input', (e) => {
    updateCounter('metaTitleCount', e.target.value.length);
  });
}

if (metaDescriptionTextarea) {
  updateCounter('metaDescriptionCount', metaDescriptionTextarea.value.length);
  metaDescriptionTextarea.addEventListener('input', (e) => {
    updateCounter('metaDescriptionCount', e.target.value.length);
  });
}

function updateCounter(id, count) {
  const counter = document.getElementById(id);
  if (counter) {
    counter.textContent = count;
  }
}

// Author search and selection
const authorSearch = document.getElementById('authorSearch');
const authorSuggestions = document.getElementById('authorSuggestions');
const authorsField = document.getElementById('authorsField');
const selectedAuthorsContainer = document.getElementById('selectedAuthors');
let selectedAuthors = new Set();
let authorsList = [];

function syncAuthorsFromTextarea() {
  if (!authorsField) return;
  const parsed = authorsField.value
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);
  selectedAuthors = new Set(parsed);
  renderAuthorTags();
}

// Load authors from textarea
if (authorsField && authorsField.value) {
  const existingAuthors = authorsField.value.split(',').map(a => a.trim()).filter(Boolean);
  existingAuthors.forEach(author => {
    selectedAuthors.add(author);
    addAuthorTag(author);
  });
}

// Keep tag UI in sync if user types directly in the textarea (prevents "reset" surprise)
if (authorsField) {
  authorsField.addEventListener('input', syncAuthorsFromTextarea);
  authorsField.addEventListener('blur', syncAuthorsFromTextarea);
}

// Fetch authors list (would come from API in real implementation)
// For now, we'll use the authors from the page if available
if (typeof window.authorsList !== 'undefined') {
  authorsList = window.authorsList;
}

if (authorSearch) {
  authorSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      searchAuthors(query);
    } else {
      authorSuggestions.classList.remove('active');
    }
  });

  authorSearch.addEventListener('blur', () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      authorSuggestions.classList.remove('active');
    }, 200);
  });
}

function searchAuthors(query) {
  const matches = authorsList.filter(author => 
    author.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (matches.length > 0) {
    authorSuggestions.innerHTML = matches.map(author => `
      <div class="author-suggestion-item" onclick="selectAuthor('${author.name.replace(/'/g, "\\'")}')">
        ${escapeHtml(author.name)}
      </div>
    `).join('');
    authorSuggestions.classList.add('active');
  } else {
    authorSuggestions.classList.remove('active');
  }
}

function selectAuthor(authorName) {
  if (!selectedAuthors.has(authorName)) {
    selectedAuthors.add(authorName);
    addAuthorTag(authorName);
    updateAuthorsField();
  }
  authorSearch.value = '';
  authorSuggestions.classList.remove('active');
}

function addAuthorTag(authorName) {
  const tag = document.createElement('div');
  tag.className = 'author-tag';
  tag.innerHTML = `
    <span>${escapeHtml(authorName)}</span>
    <span class="author-tag-remove" onclick="removeAuthor('${authorName.replace(/'/g, "\\'")}')">×</span>
  `;
  selectedAuthorsContainer.appendChild(tag);
}

function removeAuthor(authorName) {
  selectedAuthors.delete(authorName);
  updateAuthorsField();
  renderAuthorTags();
}

function renderAuthorTags() {
  selectedAuthorsContainer.innerHTML = '';
  selectedAuthors.forEach(author => addAuthorTag(author));
}

function updateAuthorsField() {
  if (authorsField) {
    authorsField.value = Array.from(selectedAuthors).join(', ');
  }
}

// Allow adding author by pressing Enter
if (authorSearch) {
  authorSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !selectedAuthors.has(value)) {
        selectAuthor(value);
      }
    }
  });
}

// Image preview and upload
document.querySelectorAll('.image-input').forEach((input, index) => {
  const uploadBox = input.closest('.image-upload-box');
  const placeholder = uploadBox.querySelector('.image-upload-placeholder');
  const preview = uploadBox.querySelector('.image-preview');

  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
});

// Discount calculation
const priceSaleInput = document.getElementById('priceSale');
const priceMRPInput = document.getElementById('priceMRP');
const discountDisplay = document.getElementById('discountDisplay');
const discountPercent = document.getElementById('discountPercent');

function calculateDiscount() {
  const sale = parseFloat(priceSaleInput?.value) || 0;
  const mrp = parseFloat(priceMRPInput?.value) || 0;
  
  if (mrp > sale && sale > 0) {
    const discount = Math.round(((mrp - sale) / mrp) * 100);
    if (discountPercent) discountPercent.textContent = discount;
    if (discountDisplay) discountDisplay.style.display = 'block';
  } else {
    if (discountDisplay) discountDisplay.style.display = 'none';
  }
}

if (priceSaleInput && priceMRPInput) {
  priceSaleInput.addEventListener('input', calculateDiscount);
  priceMRPInput.addEventListener('input', calculateDiscount);
  calculateDiscount(); // Initial calculation
}

// Form validation
const form = document.getElementById('bookForm');
if (form) {
  form.addEventListener('submit', function(e) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.admin-form-error').forEach(err => {
      err.classList.remove('show');
      err.textContent = '';
    });

    // Validate title
    const title = document.getElementById('bookTitle')?.value.trim();
    if (!title) {
      showError('bookTitle', 'Title is required');
      isValid = false;
      switchToTab('basic');
    }

    // Validate price
    const priceSale = parseFloat(priceSaleInput?.value);
    if (!priceSale || priceSale <= 0) {
      showError('priceSale', 'Valid sale price is required');
      isValid = false;
      switchToTab('pricing');
    }

    // Validate stock
    const stock = parseInt(document.getElementById('stock')?.value);
    if (isNaN(stock) || stock < 0) {
      showError('stock', 'Valid stock quantity is required');
      isValid = false;
      switchToTab('pricing');
    }

    if (!isValid) {
      e.preventDefault();
      return false;
    }
  });
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    const errorId = fieldId + 'Error';
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }
}

function switchToTab(tabName) {
  document.querySelectorAll('.book-form-tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.click();
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
window.selectAuthor = selectAuthor;
window.removeAuthor = removeAuthor;

// Categories chip multi-select (keeps existing <select multiple> for form submission)
const categorySelect = document.getElementById('categorySelect');
const categoryChips = document.getElementById('categoryChips');

function buildCategoryChips() {
  if (!categorySelect || !categoryChips) return;
  const options = Array.from(categorySelect.options || []);
  categoryChips.innerHTML = options
    .map((opt) => {
      const selected = opt.selected ? ' data-selected' : '';
      return `<button type="button" class="category-chip"${selected} data-value="${escapeHtml(opt.value)}">${escapeHtml(opt.textContent || opt.value)}</button>`;
    })
    .join('');

  categoryChips.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.getAttribute('data-value');
      const option = options.find((o) => o.value === value);
      if (!option) return;
      option.selected = !option.selected;
      if (option.selected) chip.setAttribute('data-selected', '');
      else chip.removeAttribute('data-selected');
    });
  });
}

if (categorySelect && categoryChips) {
  // If the <select> changes for any reason, keep chips in sync
  categorySelect.addEventListener('change', buildCategoryChips);
  buildCategoryChips();
}
