// ========================
// SAQIB AFRIDI BLOG with DARK MODE
// ========================

const STORAGE_KEY = 'bytelog_posts';
const VISITS_STORAGE_KEY = 'bytelog_post_visits';

// Load posts from localStorage
function loadPostsFromCMS() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && JSON.parse(stored).length > 0) {
    return JSON.parse(stored);
  }
  return [
    { id: 1, title: "Rust vs. Go: Performance face-off in 2025", excerpt: "Comparing memory safety, concurrency models and real-world benchmarks for microservices.", category: "programming", imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format", date: "Apr 10, 2025", readTime: "8 min read", content: "<p>Rust and Go have emerged as the two dominant systems languages for cloud-native development...</p>" },
    { id: 2, title: "Inside NVIDIA's Blackwell Architecture", excerpt: "How next-gen GPUs are pushing the limits of AI training and real-time ray tracing.", category: "hardware", imgUrl: "https://images.unsplash.com/photo-1591489378430-ef2e537ee8b4?w=600&auto=format", date: "Apr 5, 2025", readTime: "6 min read", content: "<p>NVIDIA's Blackwell B200 GPU represents a paradigm shift in AI hardware...</p>" },
    { id: 3, title: "Zero-day exploits: Modern mitigation strategies", excerpt: "From eBPF to confidential computing — hardening the kernel against emerging threats.", category: "security", imgUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format", date: "Mar 28, 2025", readTime: "10 min read", content: "<p>Zero-day exploits remain the top cybersecurity concern...</p>" },
    { id: 4, title: "Building a Kubernetes homelab with Raspberry Pi", excerpt: "Step-by-step guide to orchestrate containers on a budget ARM cluster.", category: "devops", imgUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format", date: "Mar 22, 2025", readTime: "12 min read", content: "<p>Transform four Raspberry Pi 5 boards into a production-like Kubernetes cluster...</p>" },
    { id: 5, title: "LLM observability: Tracing prompts in prod", excerpt: "OpenTelemetry meets generative AI — monitoring hallucinations and latency.", category: "ai-ml", imgUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format", date: "Mar 18, 2025", readTime: "7 min read", content: "<p>As LLMs move to production, observability becomes critical...</p>" }
  ];
}

let blogPosts = [];
let activeCategory = 'all';
let searchQuery = '';

// Visit Counter Functions
function getPostVisitCount(postId) {
  const visits = localStorage.getItem(VISITS_STORAGE_KEY);
  const visitsData = visits ? JSON.parse(visits) : {};
  return visitsData[postId] || 0;
}

function getAllPostVisits() {
  const visits = localStorage.getItem(VISITS_STORAGE_KEY);
  return visits ? JSON.parse(visits) : {};
}

function getTopVisitedPosts(limit = 5) {
  const visitsData = getAllPostVisits();
  const postsWithVisits = Object.entries(visitsData).map(([id, count]) => ({
    id: parseInt(id),
    visits: count
  }));
  postsWithVisits.sort((a, b) => b.visits - a.visits);
  return postsWithVisits.slice(0, limit);
}

function updateBlogStats() {
  const totalPosts = blogPosts.length;
  const visitsData = getAllPostVisits();
  const totalViews = Object.values(visitsData).reduce((sum, count) => sum + count, 0);
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
  
  const totalPostsEl = document.getElementById('totalPosts');
  const totalViewsEl = document.getElementById('totalViews');
  const avgViewsEl = document.getElementById('avgViews');
  
  if (totalPostsEl) totalPostsEl.textContent = totalPosts;
  if (totalViewsEl) totalViewsEl.textContent = totalViews.toLocaleString();
  if (avgViewsEl) avgViewsEl.textContent = avgViews.toLocaleString();
}

// Modal functionality
const modal = document.getElementById('infoModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');

function openModal(title, content) {
  if (!modal || !modalTitle || !modalBody) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function showAboutModal() {
  const aboutContent = `
    <p><i class="fas fa-terminal"></i> Hey there! I'm <strong>Saqib Afridi</strong>, a systems architect and full-stack developer with over a decade of experience in cloud infrastructure, AI/ML, and developer tooling.</p>
    <p><i class="fas fa-rocket"></i> I created this blog to share deep technical insights, battle-tested strategies, and the latest trends in modern computing.</p>
    <p><i class="fas fa-code"></i> Currently building open-source tools at the intersection of Rust, eBPF, and distributed systems.</p>
    <div class="tech-stack">
      <span class="tech-badge">Rust</span>
      <span class="tech-badge">Go</span>
      <span class="tech-badge">Kubernetes</span>
      <span class="tech-badge">Python</span>
      <span class="tech-badge">React</span>
      <span class="tech-badge">TypeScript</span>
    </div>
    <p style="margin-top: 20px;"><i class="fas fa-heart" style="color:#f43f5e;"></i> When I'm not coding, I contribute to open-source and mentor junior developers.</p>
  `;
  openModal('👨‍💻 About Saqib Afridi', aboutContent);
}

function showContactModal() {
  const contactContent = `
    <p><i class="fas fa-paper-plane"></i> Have a question, collaboration idea, or just want to say hi? I'd love to hear from you!</p>
    <div class="contact-item">
      <i class="fas fa-envelope"></i> <a href="mailto:saqib@afridi.dev">saqib@afridi.dev</a>
    </div>
    <div class="contact-item">
      <i class="fab fa-github"></i> <a href="#" target="_blank">github.com/saqibafridi</a>
    </div>
    <div class="contact-item">
      <i class="fab fa-twitter"></i> <a href="#" target="_blank">@saqib_afridi</a>
    </div>
    <div class="social-icons">
      <a href="#"><i class="fab fa-github"></i></a>
      <a href="#"><i class="fab fa-twitter"></i></a>
      <a href="#"><i class="fab fa-linkedin"></i></a>
    </div>
  `;
  openModal('📬 Contact Saqib Afridi', contactContent);
}

function getUniqueCategories() {
  const cats = blogPosts.map(p => p.category);
  return ['all', ...new Set(cats)];
}

function renderFilters() {
  const categories = getUniqueCategories();
  const container = document.getElementById('techFilterContainer');
  if (!container) return;
  
  container.innerHTML = categories.map(cat => {
    let displayName = cat === 'all' ? '📡 All' : cat.toUpperCase();
    if (cat === 'ai-ml') displayName = '🤖 AI/ML';
    if (cat === 'devops') displayName = '⚙️ DevOps';
    if (cat === 'programming') displayName = '💻 Programming';
    if (cat === 'hardware') displayName = '🖥️ Hardware';
    if (cat === 'security') displayName = '🔒 Security';
    return `<div class="tech-chip ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${displayName}</div>`;
  }).join('');
  
  document.querySelectorAll('.tech-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.getAttribute('data-category');
      renderFilters();
      renderSidebarCategories();
      renderBlogPosts();
    });
  });
}

function filterPosts() {
  let filtered = blogPosts;
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }
  if (searchQuery !== '') {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(lowerQuery) || p.excerpt.toLowerCase().includes(lowerQuery));
  }
  return filtered;
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

function openArticlePage(postId) {
  window.location.href = `article.html?id=${postId}`;
}

function renderBlogPosts() {
  const container = document.getElementById('techBlogGrid');
  if (!container) return;
  
  const filtered = filterPosts();
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results"><i class="fas fa-database" style="font-size: 2rem; opacity: 0.5; margin-bottom: 1rem; display: block;"></i> No articles found. <a href="#" id="cmsSuggestion" style="color:#3b82f6;">Create a post in CMS</a></div>`;
    const cmsLink = document.getElementById('cmsSuggestion');
    if (cmsLink) cmsLink.addEventListener('click', (e) => { e.preventDefault(); openCMS(); });
    return;
  }
  
  const cardsHtml = filtered.map(art => {
    let categoryLabel = art.category.toUpperCase();
    if (art.category === 'ai-ml') categoryLabel = '🤖 AI/ML';
    let icon = 'fa-microchip';
    if (art.category === 'programming') icon = 'fa-code';
    if (art.category === 'security') icon = 'fa-shield-haltered';
    if (art.category === 'devops') icon = 'fa-server';
    if (art.category === 'ai-ml') icon = 'fa-brain';
    
    const views = getPostVisitCount(art.id);
    
    return `<div class="tech-card" data-post-id="${art.id}">
      <div class="card-img" style="background-image: url('${escapeHtml(art.imgUrl)}');">
        <div class="card-category-badge"><i class="fas ${icon}"></i> ${categoryLabel}</div>
      </div>
      <div class="card-content">
        <div class="card-title">${escapeHtml(art.title)}</div>
        <div class="card-excerpt">${escapeHtml(art.excerpt.substring(0, 120))}${art.excerpt.length > 120 ? '...' : ''}</div>
        <div class="meta-stats">
          <span><i class="far fa-calendar-alt"></i> ${art.date || 'Just now'}</span>
          <span><i class="far fa-hourglass-half"></i> ${art.readTime || '5 min read'}</span>
          <span><i class="fas fa-eye"></i> ${views.toLocaleString()} views</span>
          <a href="#" class="read-link" data-id="${art.id}">Read more <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>`;
  }).join('');
  
  container.innerHTML = cardsHtml;
  
  document.querySelectorAll('.tech-card').forEach(card => {
    const postId = card.getAttribute('data-post-id');
    if (postId) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.read-link')) return;
        openArticlePage(parseInt(postId));
      });
    }
  });
  
  document.querySelectorAll('.read-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(link.getAttribute('data-id'));
      openArticlePage(id);
    });
  });
}

function performSearch() {
  const input = document.getElementById('searchTechInput');
  searchQuery = input ? input.value.trim() : '';
  activeCategory = 'all';
  renderFilters();
  renderSidebarCategories();
  renderBlogPosts();
}

function refreshFromCMS() {
  blogPosts = loadPostsFromCMS();
  renderFilters();
  renderSidebarCategories();
  renderPopularPosts();
  renderBlogPosts();
  updateBlogStats();
}

function openCMS() {
  window.open('cms.html', 'ByteLogCMS', 'width=1200,height=800');
}

// Sidebar Functions
function renderSidebarCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  
  const categoryCount = {};
  blogPosts.forEach(post => {
    categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
  });
  
  const categoryConfig = {
    'all': { icon: 'fa-globe', name: 'All Posts' },
    'programming': { icon: 'fa-code', name: 'Programming' },
    'hardware': { icon: 'fa-microchip', name: 'Hardware' },
    'security': { icon: 'fa-shield-haltered', name: 'Security' },
    'devops': { icon: 'fa-server', name: 'DevOps' },
    'ai-ml': { icon: 'fa-brain', name: 'AI/ML' }
  };
  
  const categories = ['all', ...new Set(blogPosts.map(p => p.category))];
  
  container.innerHTML = categories.map(cat => {
    const count = cat === 'all' ? blogPosts.length : categoryCount[cat] || 0;
    const config = categoryConfig[cat] || { icon: 'fa-folder', name: cat.toUpperCase() };
    const isActive = activeCategory === cat;
    
    return `
      <div class="category-item ${isActive ? 'active' : ''}" data-category="${cat}">
        <span class="category-name">
          <i class="fas ${config.icon}"></i> ${config.name}
        </span>
        <span class="category-count">${count}</span>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');
      activeCategory = category;
      searchQuery = '';
      const searchInput = document.getElementById('searchTechInput');
      if (searchInput) searchInput.value = '';
      renderSidebarCategories();
      renderFilters();
      renderBlogPosts();
    });
  });
}

function renderPopularPosts() {
  const container = document.getElementById('popularPostsList');
  if (!container) return;
  
  const topVisited = getTopVisitedPosts(5);
  
  if (topVisited.length === 0) {
    const popularPosts = [...blogPosts].sort((a, b) => b.id - a.id).slice(0, 5);
    renderPopularPostsList(popularPosts, container);
  } else {
    const popularPosts = topVisited
      .map(item => blogPosts.find(post => post.id === item.id))
      .filter(post => post !== undefined);
    renderPopularPostsList(popularPosts, container);
  }
}

function renderPopularPostsList(posts, container) {
  if (posts.length === 0) {
    container.innerHTML = '<div class="empty-state">No posts yet</div>';
    return;
  }
  
  container.innerHTML = posts.map(post => {
    let icon = 'fa-microchip';
    if (post.category === 'programming') icon = 'fa-code';
    if (post.category === 'security') icon = 'fa-shield-haltered';
    if (post.category === 'devops') icon = 'fa-server';
    if (post.category === 'ai-ml') icon = 'fa-brain';
    
    const visitCount = getPostVisitCount(post.id);
    
    return `
      <div class="popular-post-item" data-id="${post.id}">
        <div class="popular-post-img" style="background-image: url('${escapeHtml(post.imgUrl)}');"></div>
        <div class="popular-post-content">
          <div class="popular-post-title">${escapeHtml(post.title)}</div>
          <div class="popular-post-meta">
            <span><i class="far fa-calendar-alt"></i> ${post.date || 'Just now'}</span>
            <span><i class="fas ${icon}"></i> ${post.category.toUpperCase()}</span>
            <span><i class="fas fa-eye"></i> ${visitCount.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.popular-post-item').forEach(item => {
    item.addEventListener('click', () => {
      const postId = item.getAttribute('data-id');
      if (postId) openArticlePage(parseInt(postId));
    });
  });
}

function initSidebarNewsletter() {
  const subscribeBtn = document.getElementById('sidebarSubscribeBtn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      const email = document.getElementById('sidebarNewsEmail')?.value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
      } else {
        alert(`✅ Subscribed! Tech insights sent to ${email}`);
        document.getElementById('sidebarNewsEmail').value = '';
      }
    });
  }
}

function initTags() {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const tagText = tag.textContent;
      const searchInput = document.getElementById('searchTechInput');
      if (searchInput) {
        searchInput.value = tagText;
        performSearch();
      }
    });
  });
}

// ========================
// DARK MODE FUNCTIONALITY
// ========================

function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;
  
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateDarkModeButton(true);
  }
  
  darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkModeButton(isDark);
  });
}

function updateDarkModeButton(isDark) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;
  
  const icon = darkModeToggle.querySelector('i');
  const span = darkModeToggle.querySelector('span');
  
  if (isDark) {
    icon.className = 'fas fa-sun';
    span.textContent = ' Light Mode';
  } else {
    icon.className = 'fas fa-moon';
    span.textContent = ' Dark Mode';
  }
}

// Storage event listener
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) refreshFromCMS();
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Saqib Afridi Blog initialized');
  refreshFromCMS();
  
  // Search buttons
  const searchBtn = document.getElementById('searchTechBtn');
  const searchInput = document.getElementById('searchTechInput');
  if (searchBtn) searchBtn.addEventListener('click', performSearch);
  if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
  
  // CMS button
  const cmsBtn = document.getElementById('openCMSBtn');
  if (cmsBtn) cmsBtn.addEventListener('click', (e) => { e.preventDefault(); openCMS(); });
  
  // Newsletter button (main)
  const subscribeBtn = document.getElementById('techSubscribeBtn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      const email = document.getElementById('techNewsEmail')?.value.trim();
      if (!email || !email.includes('@')) alert('Please enter valid email');
      else { alert(`✅ Subscribed!`); if(document.getElementById('techNewsEmail')) document.getElementById('techNewsEmail').value = ''; }
    });
  }
  
  // Modal buttons
  const aboutBtn = document.getElementById('aboutBtn');
  const contactBtn = document.getElementById('contactBtn');
  const footerAboutLink = document.getElementById('footerAboutLink');
  const footerContactLink = document.getElementById('footerContactLink');
  const homeLink = document.getElementById('homeLink');
  
  if (aboutBtn) aboutBtn.addEventListener('click', showAboutModal);
  if (contactBtn) contactBtn.addEventListener('click', showContactModal);
  if (footerAboutLink) footerAboutLink.addEventListener('click', (e) => { e.preventDefault(); showAboutModal(); });
  if (footerContactLink) footerContactLink.addEventListener('click', (e) => { e.preventDefault(); showContactModal(); });
  if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  
  // ESC key to close modal
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); });
  
  // Sidebar initialization
  renderSidebarCategories();
  renderPopularPosts();
  initSidebarNewsletter();
  initTags();
  updateBlogStats();
  
  // Dark Mode initialization
  initDarkMode();
});