// ========================
// CMS Admin Panel with File Upload & Category Management
// ========================

const ADMIN_PASSWORD = "peshawar.123";
const STORAGE_KEY = 'bytelog_posts';
const FILES_STORAGE_KEY = 'bytelog_files';
const CATEGORIES_STORAGE_KEY = 'bytelog_categories';
const AUTH_KEY = 'bytelog_auth';

let blogPosts = [];
let editPostId = null;
let uploadedFiles = [];
let blogCategories = [];

// ========================
// DEFAULT CATEGORIES
// ========================
const DEFAULT_CATEGORIES = [
    { id: "programming", name: "Programming", icon: "fa-code", displayIcon: "💻" },
    { id: "hardware", name: "Hardware", icon: "fa-microchip", displayIcon: "🖥️" },
    { id: "security", name: "Security", icon: "fa-shield-haltered", displayIcon: "🔒" },
    { id: "devops", name: "DevOps", icon: "fa-server", displayIcon: "⚙️" },
    { id: "ai-ml", name: "AI/ML", icon: "fa-brain", displayIcon: "🤖" },
    { id: "tutorial", name: "Tutorials", icon: "fa-video", displayIcon: "📚" },
    { id: "emerging-tech", name: "Emerging Tech", icon: "fa-rocket", displayIcon: "🌌" }
];

// ========================
// CATEGORY MANAGEMENT
// ========================

function loadCategories() {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
        blogCategories = JSON.parse(stored);
    } else {
        blogCategories = [...DEFAULT_CATEGORIES];
        saveCategories();
    }
    renderCategoriesGrid();
    updateCategorySelect();
}

function saveCategories() {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(blogCategories));
    // Update the category select dropdown in the form
    updateCategorySelect();
    // Dispatch storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { 
        key: CATEGORIES_STORAGE_KEY, 
        newValue: JSON.stringify(blogCategories) 
    }));
}

function updateCategorySelect() {
    const select = document.getElementById('postCategory');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = blogCategories.map(cat => {
        const displayIcon = cat.displayIcon || '';
        return `<option value="${cat.id}">${displayIcon} ${cat.name}</option>`;
    }).join('');
    
    // Restore previous selection if possible
    if (blogCategories.some(cat => cat.id === currentValue)) {
        select.value = currentValue;
    }
}

function renderCategoriesGrid() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    // Count posts per category
    const postCount = {};
    blogPosts.forEach(post => {
        postCount[post.category] = (postCount[post.category] || 0) + 1;
    });
    
    if (blogCategories.length === 0) {
        container.innerHTML = '<div class="empty-state">No categories yet. Click "Add Category" to create one.</div>';
        return;
    }
    
    container.innerHTML = blogCategories.map(cat => {
        const count = postCount[cat.id] || 0;
        const displayIcon = cat.displayIcon || '';
        return `
            <div class="category-card" data-category-id="${cat.id}">
                <div class="category-info">
                    <div class="category-icon">
                        <i class="fas ${cat.icon || 'fa-folder'}"></i>
                    </div>
                    <div class="category-details">
                        <h4>${displayIcon} ${escapeHtml(cat.name)}</h4>
                        <p>${cat.id}</p>
                    </div>
                    <span class="category-stats">${count} post${count !== 1 ? 's' : ''}</span>
                </div>
                <div class="category-actions">
                    <button class="edit-cat-btn" onclick="editCategory('${cat.id}')" title="Edit Category">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-cat-btn" onclick="deleteCategory('${cat.id}')" title="Delete Category">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openCategoryModal(editMode = false, categoryData = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');
    const deleteWarning = document.getElementById('categoryDeleteWarning');
    
    if (editMode && categoryData) {
        title.innerHTML = '<i class="fas fa-edit"></i> Edit Category';
        document.getElementById('categoryId').value = categoryData.id;
        document.getElementById('categoryId').disabled = true;
        document.getElementById('categoryName').value = categoryData.name;
        document.getElementById('categoryIcon').value = categoryData.icon || 'fa-folder';
        document.getElementById('categoryDisplayIcon').value = categoryData.displayIcon || '';
        document.getElementById('editingCategoryId').value = categoryData.id;
        if (deleteWarning) deleteWarning.style.display = 'block';
    } else {
        title.innerHTML = '<i class="fas fa-tag"></i> Add Category';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryId').disabled = false;
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryIcon').value = 'fa-folder';
        document.getElementById('categoryDisplayIcon').value = '';
        document.getElementById('editingCategoryId').value = '';
        if (deleteWarning) deleteWarning.style.display = 'none';
    }
    
    // Update icon preview
    updateIconPreview();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateIconPreview() {
    const iconInput = document.getElementById('categoryIcon');
    const preview = document.getElementById('iconPreview');
    if (preview && iconInput) {
        const iconName = iconInput.value.trim() || 'fa-folder';
        preview.innerHTML = `<i class="fas ${iconName}"></i> ${iconName}`;
    }
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').disabled = false;
        document.getElementById('editingCategoryId').value = '';
    }
}

function saveCategoryFromForm() {
    const categoryId = document.getElementById('categoryId').value.trim().toLowerCase();
    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryIcon = document.getElementById('categoryIcon').value.trim() || 'fa-folder';
    const categoryDisplayIcon = document.getElementById('categoryDisplayIcon').value.trim();
    const editingId = document.getElementById('editingCategoryId').value;
    
    if (!categoryId || !categoryName) {
        showMessage('⚠️ Please enter both Category ID and Name', 'error');
        return;
    }
    
    // Validate category ID format (only lowercase, letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(categoryId)) {
        showMessage('❌ Category ID can only contain lowercase letters, numbers, and hyphens', 'error');
        return;
    }
    
    if (editingId) {
        // Editing existing category
        const index = blogCategories.findIndex(c => c.id === editingId);
        if (index !== -1) {
            const oldId = blogCategories[index].id;
            blogCategories[index] = {
                id: categoryId,
                name: categoryName,
                icon: categoryIcon,
                displayIcon: categoryDisplayIcon
            };
            
            // Update posts that had the old category ID
            if (oldId !== categoryId) {
                blogPosts.forEach(post => {
                    if (post.category === oldId) {
                        post.category = categoryId;
                    }
                });
                saveToLocalStorage();
            }
            
            saveCategories();
            showMessage(`✅ Category "${categoryName}" updated successfully!`, 'success');
        }
    } else {
        // Check if category already exists
        if (blogCategories.some(c => c.id === categoryId)) {
            showMessage(`❌ Category "${categoryId}" already exists!`, 'error');
            return;
        }
        
        blogCategories.push({
            id: categoryId,
            name: categoryName,
            icon: categoryIcon,
            displayIcon: categoryDisplayIcon
        });
        saveCategories();
        showMessage(`🎉 Category "${categoryName}" added successfully!`, 'success');
    }
    
    closeCategoryModal();
    renderCategoriesGrid();
    updateCategorySelect();
}

window.editCategory = function(categoryId) {
    const category = blogCategories.find(c => c.id === categoryId);
    if (category) {
        openCategoryModal(true, category);
    }
};

window.deleteCategory = function(categoryId) {
    // Prevent deletion of categories that have posts
    const postsWithCategory = blogPosts.filter(p => p.category === categoryId);
    
    let warningMsg = `Are you sure you want to delete category "${categoryId}"?`;
    if (postsWithCategory.length > 0) {
        warningMsg = `⚠️ WARNING: ${postsWithCategory.length} post(s) use this category.\n\nDeleting this category will NOT delete the posts, but they will need to be reassigned to another category.\n\nAre you sure you want to delete this category?`;
    }
    
    if (confirm(warningMsg)) {
        blogCategories = blogCategories.filter(c => c.id !== categoryId);
        saveCategories();
        renderCategoriesGrid();
        updateCategorySelect();
        
        // Optionally reset posts with this category to 'uncategorized' or first available
        if (postsWithCategory.length > 0 && blogCategories.length > 0) {
            const defaultCat = blogCategories[0].id;
            postsWithCategory.forEach(post => {
                post.category = defaultCat;
            });
            saveToLocalStorage();
            showMessage(`📝 ${postsWithCategory.length} post(s) reassigned to "${blogCategories[0].name}"`, 'info');
        }
        
        showMessage(`🗑️ Category deleted successfully`, 'info');
        renderTable(); // Refresh posts table to show updated categories
    }
};

// ========================
// FILE MANAGEMENT
// ========================

function loadFiles() {
  const stored = localStorage.getItem(FILES_STORAGE_KEY);
  if (stored) {
    uploadedFiles = JSON.parse(stored);
  } else {
    uploadedFiles = [];
  }
  renderFileList();
}

function saveFiles() {
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(uploadedFiles));
  window.dispatchEvent(new StorageEvent('storage', { 
    key: FILES_STORAGE_KEY, 
    newValue: JSON.stringify(uploadedFiles) 
  }));
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) return 'fa-image';
  if (fileType === 'application/pdf') return 'fa-file-pdf';
  if (fileType.includes('text')) return 'fa-file-alt';
  if (fileType.includes('word')) return 'fa-file-word';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'fa-file-archive';
  if (fileType.includes('json')) return 'fa-file-code';
  if (fileType.includes('csv')) return 'fa-file-excel';
  return 'fa-file';
}

function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const fileData = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: e.target.result,
        uploadDate: new Date().toISOString()
      };
      uploadedFiles.unshift(fileData);
      saveFiles();
      renderFileList();
      showMessage(`✅ ${file.name} uploaded successfully!`, 'success');
      resolve(fileData);
    };
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
      showMessage(`❌ Failed to upload ${file.name}`, 'error');
    };
    reader.readAsDataURL(file);
  });
}

function deleteFile(fileId) {
  const file = uploadedFiles.find(f => f.id === fileId);
  if (file && confirm(`Are you sure you want to delete "${file.name}"?`)) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    saveFiles();
    renderFileList();
    showMessage(`🗑️ ${file.name} deleted successfully`, 'info');
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showMessage('✅ URL copied to clipboard!', 'success');
  }).catch(() => {
    showMessage('Failed to copy URL', 'error');
  });
}

function getFileUrl(fileId) {
  const file = uploadedFiles.find(f => f.id === fileId);
  return file ? file.data : null;
}

function renderFileList() {
  const container = document.getElementById('filesContainer');
  if (!container) return;
  
  if (uploadedFiles.length === 0) {
    container.innerHTML = '<div class="empty-state">No files uploaded yet. Drag and drop or click to upload.</div>';
    return;
  }
  
  container.innerHTML = uploadedFiles.map(file => {
    const icon = getFileIcon(file.type);
    const isImage = file.type.startsWith('image/');
    
    return `
      <div class="file-item" data-file-id="${file.id}">
        <div class="file-info">
          ${isImage ? `<img src="${escapeHtml(file.data)}" alt="${escapeHtml(file.name)}">` : `<i class="fas ${icon}"></i>`}
          <span class="file-name">${escapeHtml(file.name)}</span>
          <span class="file-size">(${formatFileSize(file.size)})</span>
        </div>
        <div class="file-actions">
          <button class="copy-url-btn" onclick="copyFileUrl('${file.id}')" title="Copy URL"><i class="fas fa-link"></i></button>
          <button class="insert-btn" onclick="insertFileIntoCMS('${file.id}')" title="Insert into content"><i class="fas fa-plus-circle"></i></button>
          <button class="delete-file-btn" onclick="deleteFile('${file.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

window.copyFileUrl = function(fileId) {
  const file = uploadedFiles.find(f => f.id === fileId);
  if (file) {
    copyToClipboard(file.data);
  }
};

window.deleteFile = deleteFile;

window.insertFileIntoCMS = function(fileId) {
  const file = uploadedFiles.find(f => f.id === fileId);
  if (!file) return;
  
  const textarea = document.getElementById('postContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  let insertHtml = '';
  if (file.type.startsWith('image/')) {
    insertHtml = `\n<img src="${file.data}" alt="${escapeHtml(file.name)}" style="max-width: 100%; border-radius: 12px; margin: 16px 0;">\n`;
  } else if (file.type === 'application/pdf') {
    insertHtml = `\n<div class="file-attachment"><a href="${file.data}" target="_blank" class="file-link"><i class="fas fa-file-pdf"></i> ${escapeHtml(file.name)}</a></div>\n`;
  } else {
    insertHtml = `\n<div class="file-attachment"><a href="${file.data}" target="_blank" class="file-link"><i class="fas fa-download"></i> Download ${escapeHtml(file.name)}</a></div>\n`;
  }
  
  textarea.value = textarea.value.substring(0, start) + insertHtml + textarea.value.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + insertHtml.length, start + insertHtml.length);
  showMessage(`📎 ${file.name} inserted into content`, 'success');
};

function openFileBrowser() {
  const modal = document.getElementById('fileBrowserModal');
  const grid = document.getElementById('fileBrowserGrid');
  
  if (!modal || !grid) return;
  
  const images = uploadedFiles.filter(f => f.type && f.type.startsWith('image/'));
  
  if (images.length === 0) {
    grid.innerHTML = '<div class="empty-state">No images uploaded yet. Upload some images first.</div>';
  } else {
    grid.innerHTML = images.map(img => `
      <div class="file-browser-item" onclick="selectImageForPost('${img.id}')">
        <img src="${img.data}" class="image-preview" alt="${escapeHtml(img.name)}">
        <div class="file-name">${escapeHtml(img.name)}</div>
        <div class="file-size">${formatFileSize(img.size)}</div>
      </div>
    `).join('');
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.selectImageForPost = function(fileId) {
  const file = uploadedFiles.find(f => f.id === fileId);
  if (file && file.type && file.type.startsWith('image/')) {
    document.getElementById('postImage').value = file.data;
    closeFileBrowser();
    showMessage('🖼️ Image URL inserted', 'success');
  }
};

function closeFileBrowser() {
  const modal = document.getElementById('fileBrowserModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========================
// RICH TEXT FORMATTING
// ========================

function formatText(type) {
  const textarea = document.getElementById('postContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let replacement = '';
  
  switch(type) {
    case 'bold':
      replacement = `<strong>${selectedText || 'bold text'}</strong>`;
      break;
    case 'italic':
      replacement = `<em>${selectedText || 'italic text'}</em>`;
      break;
    case 'heading':
      replacement = `\n<h3>${selectedText || 'Heading'}</h3>\n`;
      break;
    case 'subheading':
      replacement = `\n<h4>${selectedText || 'Subheading'}</h4>\n`;
      break;
    case 'paragraph':
      replacement = `\n<p>${selectedText || 'Paragraph text here...'}</p>\n`;
      break;
    case 'ul':
      replacement = `\n<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>\n`;
      break;
    case 'ol':
      replacement = `\n<ol>\n  <li>${selectedText || 'List item'}</li>\n</ol>\n`;
      break;
    case 'code':
      replacement = `\n<pre><code>${selectedText || 'code here'}</code></pre>\n`;
      break;
    case 'link':
      const url = prompt('Enter URL:', 'https://');
      if (url) replacement = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText || 'link text'}</a>`;
      break;
    default:
      return;
  }
  
  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + replacement.length, start + replacement.length);
}

function insertImage() {
  const url = prompt('Enter image URL:', 'https://');
  if (url) {
    const textarea = document.getElementById('postContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const insertHtml = `\n<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 12px; margin: 16px 0;">\n`;
    textarea.value = textarea.value.substring(0, start) + insertHtml + textarea.value.substring(end);
    textarea.focus();
  }
}

function insertFileLink() {
  openFileBrowser();
}

function previewContent() {
  const title = document.getElementById('postTitle').value || 'Preview';
  const content = document.getElementById('postContent').value;
  const previewWindow = window.open('', 'Preview', 'width=900,height=700');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Preview: ${escapeHtml(title)}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h3 { color: #1e293b; margin-top: 24px; }
        pre { background: #f1f5f9; padding: 12px; border-radius: 8px; overflow-x: auto; }
        code { font-family: monospace; }
        ul, ol { margin: 12px 0 12px 24px; }
        img { max-width: 100%; border-radius: 12px; }
        .file-link { display: inline-flex; align-items: center; gap: 8px; background: #eef2ff; padding: 8px 16px; border-radius: 8px; text-decoration: none; color: #3b82f6; margin: 8px 0; }
        .file-attachment { margin: 12px 0; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <hr>
      ${content || '<p><em>No content yet...</em></p>'}
    </body>
    </html>
  `);
  previewWindow.document.close();
}

// ========================
// AUTHENTICATION
// ========================

function checkAuth() {
  return sessionStorage.getItem(AUTH_KEY) === 'authenticated';
}

function setAuth(authenticated) {
  if (authenticated) {
    sessionStorage.setItem(AUTH_KEY, 'authenticated');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  loadPosts();
  loadFiles();
  loadCategories();
}

function handleLogin() {
  const passwordInput = document.getElementById('passwordInput');
  const password = passwordInput.value;
  const errorDiv = document.getElementById('loginError');
  
  if (password === ADMIN_PASSWORD) {
    setAuth(true);
    errorDiv.style.display = 'none';
    passwordInput.value = '';
    showAdminPanel();
  } else {
    errorDiv.textContent = '❌ Incorrect password. Access denied.';
    errorDiv.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function handleLogout() {
  setAuth(false);
  showLoginScreen();
}

// ========================
// POST MANAGEMENT
// ========================

function loadPosts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    blogPosts = JSON.parse(stored);
  } else {
    blogPosts = [
      { id: 1, title: "Rust vs. Go: Performance face-off in 2025", excerpt: "Comparing memory safety, concurrency models and real-world benchmarks for microservices.", category: "programming", imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format", date: "Apr 10, 2025", readTime: "8 min read", content: "<p>Rust and Go have emerged as the two dominant systems languages...</p><h3>Performance Benchmarks</h3><p>Rust outperformed Go by 40% in CPU-bound tasks...</p>" },
      { id: 2, title: "Inside NVIDIA's Blackwell Architecture", excerpt: "How next-gen GPUs are pushing the limits of AI training and real-time ray tracing.", category: "hardware", imgUrl: "https://images.unsplash.com/photo-1591489378430-ef2e537ee8b4?w=600&auto=format", date: "Apr 5, 2025", readTime: "6 min read", content: "<p>NVIDIA's Blackwell B200 GPU represents a paradigm shift...</p><h3>Key Specifications</h3><ul><li>208 billion transistors</li><li>20 petaFLOPS AI compute</li></ul>" },
      { id: 3, title: "Zero-day exploits: Modern mitigation strategies", excerpt: "From eBPF to confidential computing — hardening the kernel against emerging threats.", category: "security", imgUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format", date: "Mar 28, 2025", readTime: "10 min read", content: "<p>Zero-day exploits remain the top cybersecurity concern...</p><h3>Mitigation Stack</h3><ul><li>eBPF + Tetragon</li><li>AMD SEV-SNP</li></ul>" },
      { id: 4, title: "Building a Kubernetes homelab with Raspberry Pi", excerpt: "Step-by-step guide to orchestrate containers on a budget ARM cluster.", category: "devops", imgUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format", date: "Mar 22, 2025", readTime: "12 min read", content: "<p>Transform four Raspberry Pi 5 boards into a Kubernetes cluster...</p><h3>Requirements</h3><ul><li>4x Raspberry Pi 5</li><li>32GB+ microSD cards</li></ul>" },
      { id: 5, title: "LLM observability: Tracing prompts in prod", excerpt: "OpenTelemetry meets generative AI — monitoring hallucinations and latency.", category: "ai-ml", imgUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format", date: "Mar 18, 2025", readTime: "7 min read", content: "<p>As LLMs move to production, observability becomes critical...</p><h3>Tools</h3><ul><li>OpenTelemetry</li><li>Langfuse</li></ul>" }
    ];
    saveToLocalStorage();
  }
  renderTable();
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogPosts));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(blogPosts) }));
}

function getCurrentDate() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getNextId() {
  return blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.id)) + 1 : 6;
}

function renderTable() {
  const tbody = document.getElementById('postsTableBody');
  if (!tbody) return;
  if (blogPosts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No posts yet. Create your first tech article!</td></tr>';
    return;
  }
  tbody.innerHTML = blogPosts.map(post => {
    const category = blogCategories.find(c => c.id === post.category) || { name: post.category, displayIcon: '' };
    const categoryDisplay = category.displayIcon ? `${category.displayIcon} ${category.name}` : category.name;
    return `
      <tr>
        <td>${post.id}</td>
        <td><strong>${escapeHtml(post.title.substring(0, 50))}</strong>${post.title.length > 50 ? '...' : ''}</td>
        <td><span class="category-badge">${categoryDisplay}</span></td>
        <td>${post.date || 'Just now'}</td>
        <td class="action-buttons">
          <button class="edit-btn" onclick="editPost(${post.id})"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" onclick="deletePost(${post.id})"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function showMessage(msg, type = 'success') {
  const div = document.createElement('div');
  div.className = 'status-msg';
  div.style.background = type === 'error' ? '#dc2626' : '#10b981';
  div.innerHTML = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function resetForm() {
  document.getElementById('postTitle').value = '';
  document.getElementById('postExcerpt').value = '';
  document.getElementById('postCategory').value = blogCategories.length > 0 ? blogCategories[0].id : 'programming';
  document.getElementById('postImage').value = '';
  document.getElementById('postReadTime').value = '';
  document.getElementById('postContent').value = '';
  editPostId = null;
  document.getElementById('editIndicator').style.display = 'none';
  const submitBtn = document.querySelector('#postForm button[type="submit"]');
  if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Publish Post';
}

window.editPost = function(id) {
  const post = blogPosts.find(p => p.id === id);
  if (!post) return;
  editPostId = post.id;
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postExcerpt').value = post.excerpt;
  document.getElementById('postCategory').value = post.category;
  document.getElementById('postImage').value = post.imgUrl;
  document.getElementById('postReadTime').value = post.readTime;
  document.getElementById('postContent').value = post.content || '';
  document.getElementById('editIndicator').style.display = 'inline-block';
  const submitBtn = document.querySelector('#postForm button[type="submit"]');
  if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-pen"></i> Update Post';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePost = function(id) {
  if (confirm('Are you sure you want to delete this article?')) {
    blogPosts = blogPosts.filter(p => p.id !== id);
    saveToLocalStorage();
    renderTable();
    renderCategoriesGrid(); // Update category counts
    showMessage('🗑️ Post deleted successfully', 'info');
    if (editPostId === id) resetForm();
  }
};

// ========================
// EVENT LISTENERS
// ========================

document.addEventListener('DOMContentLoaded', () => {
  // Toolbar buttons
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      if (format) formatText(format);
    });
  });
  
  // Image and file buttons
  document.getElementById('insertImageBtn')?.addEventListener('click', insertImage);
  document.getElementById('insertFileBtn')?.addEventListener('click', insertFileLink);
  document.getElementById('browseImagesBtn')?.addEventListener('click', openFileBrowser);
  document.getElementById('closeFileBrowserBtn')?.addEventListener('click', closeFileBrowser);
  
  // Preview button
  document.getElementById('previewBtn')?.addEventListener('click', previewContent);
  
  // View blog button
  document.getElementById('viewBlogBtn')?.addEventListener('click', () => window.open('index.html', '_blank'));
  
  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  
  // Login button
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  
  // Category modal buttons
  document.getElementById('addCategoryBtn')?.addEventListener('click', () => openCategoryModal(false));
  document.getElementById('closeCategoryModalBtn')?.addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryBtn')?.addEventListener('click', closeCategoryModal);
  
  // Category form submission
  document.getElementById('categoryForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCategoryFromForm();
  });
  
  // Icon preview on input
  document.getElementById('categoryIcon')?.addEventListener('input', updateIconPreview);
  
  // File upload handling
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  
  if (uploadArea) {
    uploadArea.addEventListener('click', () => fileInput?.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#3b82f6';
      uploadArea.style.background = '#2d3a4e';
    });
    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#334155';
      uploadArea.style.background = '#1e293b';
    });
    uploadArea.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#334155';
      uploadArea.style.background = '#1e293b';
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.size <= 10 * 1024 * 1024) {
          await uploadFile(file);
        } else {
          showMessage(`❌ ${file.name} is too large (max 10MB)`, 'error');
        }
      }
    });
  }
  
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => fileInput?.click());
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        if (file.size <= 10 * 1024 * 1024) {
          await uploadFile(file);
        } else {
          showMessage(`❌ ${file.name} is too large (max 10MB)`, 'error');
        }
      }
      fileInput.value = '';
    });
  }
  
  // Post form submission
  document.getElementById('postForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const category = document.getElementById('postCategory').value;
    const imgUrl = document.getElementById('postImage').value.trim();
    let readTime = document.getElementById('postReadTime').value.trim();
    let content = document.getElementById('postContent').value.trim();
    
    if (!title || !excerpt || !imgUrl) {
      showMessage('⚠️ Please fill Title, Excerpt and Image URL', 'error');
      return;
    }
    if (!readTime) readTime = "5 min read";
    if (!content) content = `<p>${escapeHtml(excerpt)}</p><p>Full article content goes here.</p>`;
    
    if (editPostId !== null) {
      const index = blogPosts.findIndex(p => p.id === editPostId);
      if (index !== -1) {
        blogPosts[index] = { ...blogPosts[index], title, excerpt, category, imgUrl, readTime, content };
        showMessage('✅ Post updated successfully!', 'success');
        editPostId = null;
        resetForm();
      }
    } else {
      const newPost = { id: getNextId(), title, excerpt, category, imgUrl, date: getCurrentDate(), readTime, content };
      blogPosts.unshift(newPost);
      showMessage('🎉 New article published!', 'success');
      resetForm();
    }
    saveToLocalStorage();
    renderTable();
    renderCategoriesGrid(); // Update category counts
  });
  
  // Modal close on overlay click
  const fileBrowserModal = document.getElementById('fileBrowserModal');
  if (fileBrowserModal) {
    fileBrowserModal.addEventListener('click', (e) => {
      if (e.target === fileBrowserModal) closeFileBrowser();
    });
  }
  
  const categoryModal = document.getElementById('categoryModal');
  if (categoryModal) {
    categoryModal.addEventListener('click', (e) => {
      if (e.target === categoryModal) closeCategoryModal();
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFileBrowser();
      closeCategoryModal();
    }
  });
  
  // Check authentication
  if (checkAuth()) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
});