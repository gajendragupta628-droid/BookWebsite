// Home Settings Management
let currentSection = null;
let selectedBooks = new Set();
let allBooks = [];
let currentPage = 1;
let totalPages = 1;

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
}

function withCsrfHeaders(headers = {}) {
  const csrfToken = getCsrfToken();
  if (!csrfToken) return headers;
  return { ...headers, 'X-CSRF-Token': csrfToken };
}

// Tab switching
function switchTab(sectionId) {
  // Update tabs
  document.querySelectorAll('.home-settings-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === sectionId);
  });
  
  // Update content
  document.querySelectorAll('.home-settings-content').forEach(content => {
    content.classList.toggle('active', content.dataset.section === sectionId);
  });
}

// Toggle section enabled/disabled
async function toggleSection(sectionId, enabled) {
  try {
    const response = await fetch(`/admin/home/sections/${sectionId}`, {
      method: 'POST',
      headers: withCsrfHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ enabled })
    });
    
    const data = await response.json();
    if (data.success) {
      showNotification('Section updated successfully', 'success');
    } else {
      showNotification('Error updating section', 'error');
    }
  } catch (error) {
    console.error('Error toggling section:', error);
    showNotification('Error updating section', 'error');
  }
}

// Update section field
async function updateSectionField(sectionId, field, value) {
  try {
    const response = await fetch(`/admin/home/sections/${sectionId}`, {
      method: 'POST',
      headers: withCsrfHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ [field]: value })
    });
    
    const data = await response.json();
    if (data.success) {
      // Silent update - no notification needed for every keystroke
    }
  } catch (error) {
    console.error('Error updating field:', error);
  }
}

// Open book picker modal
function openBookPicker(sectionId) {
  currentSection = sectionId;
  selectedBooks.clear();
  
  // Get currently selected books for this section
  const sectionElement = document.querySelector(`[data-section="${sectionId}"]`);
  const currentBooks = Array.from(sectionElement.querySelectorAll('.selected-book-item'))
    .map(item => item.dataset.bookId);
  selectedBooks = new Set(currentBooks);
  
  document.getElementById('bookPickerModal').classList.add('active');
  loadBooks();
  loadFilters();
}

// Close book picker modal
function closeBookPicker() {
  document.getElementById('bookPickerModal').classList.remove('active');
  currentSection = null;
  selectedBooks.clear();
  document.getElementById('bookSearchInput').value = '';
  document.getElementById('bookCategoryFilter').value = '';
  document.getElementById('bookAuthorFilter').value = '';
}

// Load books for picker
async function loadBooks(page = 1) {
  const searchQuery = document.getElementById('bookSearchInput').value;
  const category = document.getElementById('bookCategoryFilter').value;
  const author = document.getElementById('bookAuthorFilter').value;
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20'
  });
  
  if (searchQuery) params.append('q', searchQuery);
  if (category) params.append('category', category);
  if (author) params.append('author', author);
  
  try {
    const response = await fetch(`/admin/home/books?${params}`);
    const data = await response.json();
    
    if (data.success) {
      allBooks = data.books;
      currentPage = data.pagination.page;
      totalPages = data.pagination.pages;
      renderBooks();
    } else {
      showNotification('Error loading books', 'error');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    showNotification('Error loading books', 'error');
  }
}

// Render books in picker
function renderBooks() {
  const container = document.getElementById('bookPickerResults');
  
  if (allBooks.length === 0) {
    container.innerHTML = '<div class="loading-state">No books found</div>';
    return;
  }
  
  container.innerHTML = allBooks.map(book => {
    const isSelected = selectedBooks.has(book._id.toString());
    const imageUrl = book.images && book.images.length > 0 ? book.images[0].src : '';
    
    return `
      <div class="book-picker-item ${isSelected ? 'selected' : ''}" 
           onclick="toggleBookSelection('${book._id}')"
           data-book-id="${book._id}">
        <div class="book-picker-item-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${book.title}" />` : '<div class="book-item-placeholder">No Image</div>'}
          ${isSelected ? '<div class="book-picker-item-checkbox" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>' : ''}
        </div>
        <div class="book-picker-item-info">
          <div class="book-picker-item-title">${escapeHtml(book.title)}</div>
          <div class="book-picker-item-price">Rs. ${(book.priceSale || 0).toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle book selection
function toggleBookSelection(bookId) {
  if (selectedBooks.has(bookId)) {
    selectedBooks.delete(bookId);
  } else {
    selectedBooks.add(bookId);
  }
  renderBooks();
}

// Add selected books to section
async function addSelectedBooks() {
  if (!currentSection || selectedBooks.size === 0) {
    showNotification('Please select at least one book', 'error');
    return;
  }
  
  try {
    // Get current book IDs for this section
    const sectionElement = document.querySelector(`#selectedBooks-${currentSection}`);
    const currentBookIds = Array.from(sectionElement.querySelectorAll('.selected-book-item'))
      .map(item => item.dataset.bookId);
    
    // Add new books (avoid duplicates)
    const newBookIds = Array.from(selectedBooks).filter(id => !currentBookIds.includes(id));
    const allBookIds = [...currentBookIds, ...newBookIds];
    
    const response = await fetch(`/admin/home/sections/${currentSection}`, {
      method: 'POST',
      headers: withCsrfHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ bookIds: allBookIds })
    });
    
    const data = await response.json();
    if (data.success) {
      location.reload(); // Reload to show updated books
    } else {
      showNotification('Error adding books', 'error');
    }
  } catch (error) {
    console.error('Error adding books:', error);
    showNotification('Error adding books', 'error');
  }
}

// Remove book from section
async function removeBook(sectionId, bookId) {
  if (!confirm('Remove this book from the section?')) return;
  
  try {
    const sectionElement = document.querySelector(`#selectedBooks-${sectionId}`);
    const currentBookIds = Array.from(sectionElement.querySelectorAll('.selected-book-item'))
      .map(item => item.dataset.bookId)
      .filter(id => id !== bookId);
    
    const response = await fetch(`/admin/home/sections/${sectionId}`, {
      method: 'POST',
      headers: withCsrfHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ bookIds: currentBookIds })
    });
    
    const data = await response.json();
    if (data.success) {
      location.reload();
    } else {
      showNotification('Error removing book', 'error');
    }
  } catch (error) {
    console.error('Error removing book:', error);
    showNotification('Error removing book', 'error');
  }
}

// Search books
function searchBooks() {
  loadBooks(1);
}

// Load filters (categories and authors)
async function loadFilters() {
  // This would ideally fetch from API, but for now we'll leave it empty
  // Categories and authors can be populated from the books data
}

// Drag and drop for reordering
function initDragAndDrop() {
  document.querySelectorAll('.selected-books-list').forEach(list => {
    const items = list.querySelectorAll('.selected-book-item');
    
    items.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
    });
  });
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedElement = null;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  
  const afterElement = getDragAfterElement(this.parentNode, e.clientY);
  const dragging = this.parentNode.querySelector('.dragging');
  
  if (afterElement == null) {
    this.parentNode.appendChild(dragging);
  } else {
    this.parentNode.insertBefore(dragging, afterElement);
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  const sectionId = this.closest('.selected-books-list').dataset.section;
  const bookIds = Array.from(this.closest('.selected-books-list').querySelectorAll('.selected-book-item'))
    .map(item => item.dataset.bookId);
  
  // Save new order
  saveBookOrder(sectionId, bookIds);
  
  return false;
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.selected-book-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveBookOrder(sectionId, bookIds) {
  try {
    const response = await fetch(`/admin/home/sections/${sectionId}/reorder`, {
      method: 'POST',
      headers: withCsrfHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ bookIds })
    });
    
    const data = await response.json();
    if (data.success) {
      showNotification('Book order updated', 'success');
    }
  } catch (error) {
    console.error('Error saving order:', error);
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = 'info') {
  // Simple notification - can be enhanced
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--admin-success)' : type === 'error' ? 'var(--admin-danger)' : 'var(--admin-info)'};
    color: white;
    border-radius: 0.5rem;
    z-index: 10000;
    box-shadow: var(--admin-shadow);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBookPicker();
    }
  });
});
