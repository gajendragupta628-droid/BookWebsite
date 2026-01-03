/**
 * Admin Panel JavaScript
 * Handles interactive features, real-time updates, and UI enhancements
 */

(function() {
  'use strict';

  // ======================
  // Confirmation Dialogs
  // ======================
document.addEventListener('click', (e) => {
  const confirmBtn = e.target.closest('[data-confirm]');
  if (confirmBtn && !confirm(confirmBtn.getAttribute('data-confirm'))) {
    e.preventDefault();
      e.stopPropagation();
    }
  });

  // ======================
  // Toast Notifications
  // ======================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--admin-success)' : type === 'danger' ? 'var(--admin-danger)' : 'var(--admin-info)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: var(--admin-shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Show success message from URL params (if any)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success')) {
    showToast(decodeURIComponent(urlParams.get('success')), 'success');
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ======================
  // Form Validation & Enhancement
  // ======================
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--admin-danger)';
          
          setTimeout(() => {
            field.style.borderColor = '';
          }, 3000);
        }
      });

      if (!isValid) {
        e.preventDefault();
        showToast('Please fill in all required fields', 'danger');
      }
    });
  });

  // ======================
  // Auto-save Draft (for long forms)
  // ======================
  const autoSaveForms = document.querySelectorAll('[data-autosave]');
  autoSaveForms.forEach(form => {
    const formId = form.id || 'unnamed-form';
    let saveTimeout;

    // Load saved data
    const savedData = localStorage.getItem(`admin-draft-${formId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(name => {
          const field = form.querySelector(`[name="${name}"]`);
          if (field && !field.value) {
            field.value = data[name];
          }
        });
        showToast('Draft restored', 'info');
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }

    // Save on input
    form.addEventListener('input', function() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          if (!key.startsWith('_')) { // Skip CSRF tokens
            data[key] = value;
          }
        });
        localStorage.setItem(`admin-draft-${formId}`, JSON.stringify(data));
      }, 1000);
    });

    // Clear draft on successful submit
    form.addEventListener('submit', function() {
      localStorage.removeItem(`admin-draft-${formId}`);
    });
  });

  // ======================
  // Table Row Selection
  // ======================
  const selectableRows = document.querySelectorAll('.admin-table tbody tr[data-selectable]');
  selectableRows.forEach(row => {
    row.addEventListener('click', function(e) {
      if (!e.target.closest('a, button')) {
        this.classList.toggle('selected');
      }
    });
  });

  // ======================
  // Image Upload Preview
  // ======================
  const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
  imageInputs.forEach(input => {
    input.addEventListener('change', function(e) {
      const files = e.target.files;
      if (files.length > 0) {
        const preview = input.closest('.admin-form-group')?.querySelector('.image-preview');
        if (preview) {
          preview.innerHTML = '';
          Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'max-width: 200px; max-height: 200px; border-radius: 0.5rem; border: 1px solid var(--admin-border);';
                preview.appendChild(img);
              };
              reader.readAsDataURL(file);
            }
          });
        }
      }
    });
  });

  // ======================
  // Keyboard Shortcuts
  // ======================
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }

    // Esc to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.admin-modal-overlay.show');
      if (modal) {
        modal.classList.remove('show');
      }
    }
  });

  // ======================
  // Search Debouncing
  // ======================
	  const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="Search"]:not([data-no-autosubmit])');
	  searchInputs.forEach(input => {
	    let searchTimeout;
	    input.addEventListener('input', function() {
	      clearTimeout(searchTimeout);
	      const form = this.closest('form');
	      if (form) {
	        const method = (form.getAttribute('method') || 'get').toLowerCase();
	        if (method !== 'get') return;
	        searchTimeout = setTimeout(() => {
	          form.submit();
	        }, 500);
	      }
	    });
	  });

  // ======================
  // Sticky Table Headers
  // ======================
  function setupStickyHeaders() {
    const tables = document.querySelectorAll('.admin-table-container');
    tables.forEach(container => {
      const table = container.querySelector('.admin-table');
      if (!table) return;

      container.addEventListener('scroll', function() {
        const thead = table.querySelector('thead');
        if (thead) {
          if (this.scrollTop > 0) {
            thead.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          } else {
            thead.style.boxShadow = '';
          }
        }
      });
    });
  }

  setupStickyHeaders();

  // ======================
  // Character Counter for Textareas
  // ======================
  const textareasWithMaxLength = document.querySelectorAll('textarea[maxlength], input[maxlength]');
  textareasWithMaxLength.forEach(field => {
    const maxLength = field.getAttribute('maxlength');
    if (maxLength) {
      const counter = document.createElement('div');
      counter.className = 'admin-form-hint';
      counter.style.cssText = 'text-align: right; font-size: 0.75rem; margin-top: 0.25rem;';
      
      const updateCounter = () => {
        const remaining = maxLength - field.value.length;
        counter.textContent = `${field.value.length} / ${maxLength} characters`;
        counter.style.color = remaining < 20 ? 'var(--admin-warning)' : 'var(--admin-text-muted)';
      };

      field.parentNode.insertBefore(counter, field.nextSibling);
      field.addEventListener('input', updateCounter);
      updateCounter();
    }
  });

  // ======================
  // Bulk Actions
  // ======================
  const bulkActionSelects = document.querySelectorAll('[data-bulk-action]');
  bulkActionSelects.forEach(select => {
    select.addEventListener('change', function() {
      const action = this.value;
      const selected = document.querySelectorAll('.admin-table tbody tr.selected');
      
      if (action && selected.length > 0) {
        const confirmMsg = `Apply "${action}" to ${selected.length} selected item(s)?`;
        if (confirm(confirmMsg)) {
          // Implement bulk action logic here
          showToast(`Applied "${action}" to ${selected.length} items`, 'success');
          selected.forEach(row => row.classList.remove('selected'));
        }
        this.value = '';
      } else if (action && selected.length === 0) {
        showToast('Please select items first', 'danger');
        this.value = '';
      }
    });
  });

  // ======================
  // Live Stats Update (every 30 seconds)
  // ======================
  function updateDashboardStats() {
    const statCards = document.querySelectorAll('.admin-stat-card');
    if (statCards.length > 0 && window.location.pathname === '/admin') {
      // Fetch latest stats
      fetch('/admin/api/stats')
        .then(res => res.json())
        .then(data => {
          // Update stat values with animation
          statCards.forEach(card => {
            const valueEl = card.querySelector('.admin-stat-value');
            const label = card.querySelector('.admin-stat-label').textContent.toLowerCase();
            
            if (data[label]) {
              const newValue = data[label];
              const oldValue = parseInt(valueEl.textContent) || 0;
              
              if (newValue !== oldValue) {
                valueEl.style.transform = 'scale(1.1)';
                setTimeout(() => {
                  valueEl.textContent = newValue;
                  valueEl.style.transform = 'scale(1)';
                }, 150);
              }
            }
          });
        })
        .catch(err => console.error('Failed to update stats:', err));
    }
  }

  // Update stats every 30 seconds
  setInterval(updateDashboardStats, 30000);

  // ======================
  // Copy to Clipboard
  // ======================
  document.addEventListener('click', function(e) {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      e.preventDefault();
      const text = copyBtn.getAttribute('data-copy');
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard!', 'success');
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      }
    }
  });

  // ======================
  // Smooth Scrolling
  // ======================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ======================
  // Print Functionality
  // ======================
  const printBtns = document.querySelectorAll('[data-print]');
  printBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.print();
    });
  });

  // ======================
  // Loading States
  // ======================
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
        
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <svg class="admin-loading" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"></circle>
          </svg>
          <span>Processing...</span>
        `;

        // Re-enable after timeout (in case of error)
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
          submitBtn.innerHTML = originalContent;
        }, 10000);
      }
    });
  });

  // ======================
  // Console Welcome Message
  // ======================
  console.log('%cBookstore Admin Panel', 'font-size: 20px; font-weight: bold; color: #f59e0b;');
  console.log('%cWelcome to the admin dashboard!', 'font-size: 14px; color: #888;');

})();
