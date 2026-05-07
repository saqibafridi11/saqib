// ========================
// ARTICLE PAGE with DARK MODE & COMMENT SYSTEM
// ========================

const STORAGE_KEY = 'bytelog_posts';
const VISITS_STORAGE_KEY = 'bytelog_post_visits';
const COMMENTS_STORAGE_KEY = 'bytelog_comments';

function loadPostsFromCMS() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && JSON.parse(stored).length > 0) {
    return JSON.parse(stored);
  }
  return [
    { id: 1, title: "Rust vs. Go: Performance face-off in 2025", excerpt: "Comparing memory safety, concurrency models and real-world benchmarks for microservices.", category: "programming", imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format", date: "Apr 10, 2025", readTime: "8 min read", content: "<p>Rust and Go have emerged as the two dominant systems languages for cloud-native development. Rust offers memory safety without garbage collection, while Go provides goroutines and exceptional concurrency.</p><h3>Performance Benchmarks</h3><p>In our benchmarks, Rust outperformed Go by 40% in CPU-bound tasks, but Go's compilation speed and simplicity make it unbeatable for microservices.</p><ul><li><strong>Rust</strong>: Zero-cost abstractions, no runtime</li><li><strong>Go</strong>: Fast compilation, excellent concurrency primitives</li></ul><p>The verdict: choose Rust for low-latency, embedded systems; choose Go for rapid development and network services.</p>" },
    { id: 2, title: "Inside NVIDIA's Blackwell Architecture", excerpt: "How next-gen GPUs are pushing the limits of AI training and real-time ray tracing.", category: "hardware", imgUrl: "https://images.unsplash.com/photo-1591489378430-ef2e537ee8b4?w=800&auto=format", date: "Apr 5, 2025", readTime: "6 min read", content: "<p>NVIDIA's Blackwell B200 GPU represents a paradigm shift in AI hardware. With 208 billion transistors and a new chiplet design, Blackwell delivers 20 petaFLOPS of AI compute.</p><h3>Key Specifications</h3><ul><li>208 billion transistors</li><li>20 petaFLOPS AI compute (FP4)</li><li>1.8 TB/s memory bandwidth</li><li>NVLink-C2C chiplet interconnect</li></ul><p>Early benchmarks on Llama 3 70B show 4.5x inference throughput increase.</p>" },
    { id: 3, title: "Zero-day exploits: Modern mitigation strategies", excerpt: "From eBPF to confidential computing — hardening the kernel against emerging threats.", category: "security", imgUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format", date: "Mar 28, 2025", readTime: "10 min read", content: "<p>Zero-day exploits remain the top cybersecurity concern. This article explores next-gen mitigations: eBPF-based runtime security and confidential computing.</p><h3>Recommended Mitigation Stack</h3><ul><li><strong>Runtime:</strong> eBPF + Tetragon for real-time detection</li><li><strong>Hardware:</strong> AMD SEV-SNP or Intel TDX for confidential VMs</li><li><strong>Compiler:</strong> CFI and Shadow Stacks</li></ul><p>The future lies in post-quantum cryptography and zero-trust architectures.</p>" },
    { id: 4, title: "Building a Kubernetes homelab with Raspberry Pi", excerpt: "Step-by-step guide to orchestrate containers on a budget ARM cluster.", category: "devops", imgUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format", date: "Mar 22, 2025", readTime: "12 min read", content: "<p>Transform four Raspberry Pi 5 boards into a production-like Kubernetes cluster for under $400.</p><h3>Hardware Requirements</h3><ul><li>4x Raspberry Pi 5 (8GB RAM recommended)</li><li>4x 32GB+ microSD cards or SSDs</li><li>USB-C power supply (5V/5A per Pi)</li><li>Gigabit Ethernet switch</li></ul><p>Total cost: ~$350-400. This tutorial covers OS setup, k3s installation, and GitOps with ArgoCD.</p>" },
    { id: 5, title: "LLM observability: Tracing prompts in prod", excerpt: "OpenTelemetry meets generative AI — monitoring hallucinations and latency.", category: "ai-ml", imgUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format", date: "Mar 18, 2025", readTime: "7 min read", content: "<p>As LLMs move to production, observability becomes critical. We demonstrate how to instrument OpenAI applications using OpenTelemetry.</p><h3>Tools & Integration</h3><ul><li><strong>OpenTelemetry Collector</strong> for trace aggregation</li><li><strong>Langfuse</strong> for LLM-specific tracing</li><li><strong>Prometheus</strong> for metrics</li><li><strong>Grafana</strong> for visualization</li></ul><p>Case study: A fintech startup reduced GPT-4 costs by 38% using prompt compression.</p>" }
  ];
}

let allPosts = [];

function getPostById(id) {
  if (!allPosts.length) allPosts = loadPostsFromCMS();
  return allPosts.find(p => p.id === id) || null;
}

// Visit Counter Functions
function getPostVisitCount(postId) {
  const visits = localStorage.getItem(VISITS_STORAGE_KEY);
  const visitsData = visits ? JSON.parse(visits) : {};
  return visitsData[postId] || 0;
}

function incrementPostVisitCount(postId) {
  const visits = localStorage.getItem(VISITS_STORAGE_KEY);
  const visitsData = visits ? JSON.parse(visits) : {};
  visitsData[postId] = (visitsData[postId] || 0) + 1;
  localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visitsData));
  return visitsData[postId];
}

// ========================
// COMMENT SYSTEM
// ========================

function getComments(postId) {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  const allComments = stored ? JSON.parse(stored) : {};
  return allComments[postId] || [];
}

function saveComments(postId, comments) {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  const allComments = stored ? JSON.parse(stored) : {};
  allComments[postId] = comments;
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
}

function addComment(postId, name, email, text, parentId = null) {
  const comments = getComments(postId);
  const newComment = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    email: email ? email.trim() : '',
    text: text.trim(),
    date: new Date().toISOString(),
    likes: 0,
    parentId: parentId,
    replies: []
  };
  
  if (parentId) {
    const parentComment = comments.find(c => c.id === parentId);
    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = [];
      parentComment.replies.push(newComment);
    }
  } else {
    comments.unshift(newComment);
  }
  
  saveComments(postId, comments);
  return newComment;
}

function likeComment(postId, commentId, isReply = false, parentId = null) {
  const comments = getComments(postId);
  
  if (isReply && parentId) {
    const parentComment = comments.find(c => c.id === parentId);
    if (parentComment && parentComment.replies) {
      const reply = parentComment.replies.find(r => r.id === commentId);
      if (reply) reply.likes = (reply.likes || 0) + 1;
    }
  } else {
    const comment = comments.find(c => c.id === commentId);
    if (comment) comment.likes = (comment.likes || 0) + 1;
  }
  
  saveComments(postId, comments);
}

function formatCommentDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAvatarColor(name) {
  const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#ec489a'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

function renderComments(postId) {
  const container = document.getElementById('commentsList');
  const commentCountSpan = document.getElementById('commentCount');
  
  if (!container) return;
  
  const comments = getComments(postId);
  const mainComments = comments.filter(c => !c.parentId);
  
  if (commentCountSpan) {
    let totalCount = comments.length;
    comments.forEach(c => {
      if (c.replies) totalCount += c.replies.length;
    });
    commentCountSpan.textContent = totalCount;
  }
  
  if (mainComments.length === 0) {
    container.innerHTML = `
      <div class="empty-comments">
        <i class="fas fa-comment-dots"></i>
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = mainComments.map(comment => renderCommentItem(postId, comment)).join('');
  
  document.querySelectorAll('.comment-like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const commentId = btn.getAttribute('data-id');
      const isReply = btn.getAttribute('data-reply') === 'true';
      const parentId = btn.getAttribute('data-parent');
      likeComment(postId, commentId, isReply, parentId);
      renderComments(postId);
    });
  });
  
  document.querySelectorAll('.comment-reply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const commentId = btn.getAttribute('data-id');
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      if (replyForm) {
        replyForm.classList.toggle('active');
      }
    });
  });
  
  document.querySelectorAll('.reply-submit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const commentId = btn.getAttribute('data-id');
      const textarea = document.getElementById(`reply-text-${commentId}`);
      const nameInput = document.getElementById(`reply-name-${commentId}`);
      const emailInput = document.getElementById(`reply-email-${commentId}`);
      
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const text = textarea ? textarea.value.trim() : '';
      
      if (!name || !text) {
        alert('Please enter your name and comment');
        return;
      }
      
      addComment(postId, name, email, text, commentId);
      renderComments(postId);
      
      if (textarea) textarea.value = '';
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      if (replyForm) replyForm.classList.remove('active');
    });
  });
}

function renderCommentItem(postId, comment, isReply = false, parentId = null) {
  const avatarColor = getAvatarColor(comment.name);
  const initials = getInitials(comment.name);
  
  let repliesHtml = '';
  if (comment.replies && comment.replies.length > 0) {
    repliesHtml = `
      <div class="replies-container">
        ${comment.replies.map(reply => renderCommentItem(postId, reply, true, comment.id)).join('')}
      </div>
    `;
  }
  
  const replyFormHtml = `
    <div class="reply-form" id="reply-form-${comment.id}">
      <input type="text" id="reply-name-${comment.id}" placeholder="Your Name" style="width: 100%; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <input type="email" id="reply-email-${comment.id}" placeholder="Your Email (optional)" style="width: 100%; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <textarea id="reply-text-${comment.id}" rows="2" placeholder="Write your reply..."></textarea>
      <button class="reply-submit-btn" data-id="${comment.id}">Post Reply</button>
    </div>
  `;
  
  return `
    <div class="comment-item ${isReply ? 'reply-item' : ''}">
      <div class="comment-header">
        <div class="comment-author">
          <div class="comment-avatar" style="background: ${avatarColor}">
            ${initials}
          </div>
          <div class="comment-author-info">
            <h4>${escapeHtml(comment.name)}</h4>
            <span class="comment-date">${formatCommentDate(comment.date)}</span>
          </div>
        </div>
      </div>
      <div class="comment-text">${escapeHtml(comment.text).replace(/\n/g, '<br>')}</div>
      <div class="comment-actions">
        <button class="comment-like-btn" data-id="${comment.id}" data-reply="${isReply}" data-parent="${parentId || ''}">
          <i class="fas fa-heart"></i> ${comment.likes || 0}
        </button>
        <button class="comment-reply-btn" data-id="${comment.id}">
          <i class="fas fa-reply"></i> Reply
        </button>
      </div>
      ${replyFormHtml}
      ${repliesHtml}
    </div>
  `;
}

function initCommentForm(postId) {
  const form = document.getElementById('commentForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('commentName')?.value.trim();
    const email = document.getElementById('commentEmail')?.value.trim();
    const text = document.getElementById('commentText')?.value.trim();
    
    if (!name || !text) {
      alert('Please enter your name and comment');
      return;
    }
    
    addComment(postId, name, email, text);
    renderComments(postId);
    form.reset();
    document.getElementById('commentsSection')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ========================
// RELATED POSTS
// ========================

function getRelatedPosts(currentPost, limit = 2) {
  if (!allPosts.length) allPosts = loadPostsFromCMS();
  const sameCategory = allPosts.filter(p => p.id !== currentPost.id && p.category === currentPost.category);
  let related = [...sameCategory];
  if (related.length < limit) {
    const otherCategory = allPosts.filter(p => p.id !== currentPost.id && p.category !== currentPost.category);
    related = [...related, ...otherCategory];
  }
  return related.slice(0, limit);
}

function renderRelatedPosts(currentPost) {
  const relatedPosts = getRelatedPosts(currentPost, 2);
  const container = document.getElementById('relatedPostsContainer');
  if (!container) return;
  
  if (relatedPosts.length === 0) {
    container.innerHTML = '<div class="no-related"><i class="fas fa-book-open"></i><p>No related posts found.</p></div>';
    return;
  }
  
  const html = `
    <div class="related-posts">
      <h3><i class="fas fa-layer-group"></i> You Might Also Like</h3>
      <div class="related-grid">
        ${relatedPosts.map(post => renderRelatedCard(post)).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;
  
  document.querySelectorAll('.related-card').forEach(card => {
    card.addEventListener('click', () => {
      const postId = card.getAttribute('data-post-id');
      if (postId) window.location.href = `article.html?id=${postId}`;
    });
  });
}

function renderRelatedCard(post) {
  let categoryLabel = post.category.toUpperCase();
  if (post.category === 'ai-ml') categoryLabel = 'AI/ML';
  let icon = 'fa-microchip';
  if (post.category === 'programming') icon = 'fa-code';
  if (post.category === 'security') icon = 'fa-shield-haltered';
  if (post.category === 'devops') icon = 'fa-server';
  if (post.category === 'ai-ml') icon = 'fa-brain';
  
  return `
    <div class="related-card" data-post-id="${post.id}">
      <div class="related-card-img" style="background-image: url('${escapeHtml(post.imgUrl)}');">
        <span class="related-card-category"><i class="fas ${icon}"></i> ${categoryLabel}</span>
      </div>
      <div class="related-card-content">
        <h4 class="related-card-title">${escapeHtml(post.title)}</h4>
        <p class="related-card-excerpt">${escapeHtml(post.excerpt.substring(0, 100))}...</p>
        <div class="related-card-meta">
          <span><i class="far fa-calendar-alt"></i> ${post.date || 'Just now'}</span>
          <span class="related-read-more">Read More <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </div>
  `;
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

function renderArticleHTML(post) {
  if (!post) return null;
  
  let categoryLabel = post.category.replace('-', ' ').toUpperCase();
  let icon = 'fa-microchip';
  if (post.category === 'programming') icon = 'fa-code';
  if (post.category === 'security') icon = 'fa-shield-haltered';
  if (post.category === 'devops') icon = 'fa-server';
  if (post.category === 'ai-ml') icon = 'fa-brain';
  if (post.category === 'hardware') icon = 'fa-microchip';
  
  const safeTitle = escapeHtml(post.title);
  const safeDate = escapeHtml(post.date || 'Unknown date');
  const safeReadTime = escapeHtml(post.readTime || '5 min read');
  const visitCount = getPostVisitCount(post.id);
  
  let mainContent = post.content || `<p>${escapeHtml(post.excerpt)}</p>`;
  
  return `
    <div class="article-container">
      <div class="article-header-img" style="background-image: url('${escapeHtml(post.imgUrl)}');">
        <div class="article-category-badge"><i class="fas ${icon}"></i> ${categoryLabel}</div>
      </div>
      <div class="article-body">
        <h1 class="article-title">${safeTitle}</h1>
        <div class="article-meta">
          <span><i class="far fa-calendar-alt"></i> ${safeDate}</span>
          <span><i class="far fa-hourglass-half"></i> ${safeReadTime}</span>
          <span><i class="fas fa-tag"></i> ${categoryLabel}</span>
          <span><i class="fas fa-eye"></i> ${visitCount.toLocaleString()} views</span>
        </div>
        <div class="article-content">
          ${mainContent}
        </div>
        <div id="relatedPostsContainer"></div>
        
        <!-- Comment Section -->
        <div class="comments-section" id="commentsSection">
          <h3><i class="fas fa-comments"></i> Comments (<span id="commentCount">0</span>)</h3>
          
          <div class="comment-form">
            <h4>Leave a Comment</h4>
            <form id="commentForm">
              <div class="form-row">
                <div class="form-group">
                  <input type="text" id="commentName" placeholder="Your Name *" required>
                </div>
                <div class="form-group">
                  <input type="email" id="commentEmail" placeholder="Your Email (will not be published)">
                </div>
              </div>
              <div class="form-group">
                <textarea id="commentText" rows="4" placeholder="Write your comment... *" required></textarea>
              </div>
              <button type="submit" class="submit-comment-btn">
                <i class="fas fa-paper-plane"></i> Post Comment
              </button>
            </form>
          </div>
          
          <div id="commentsList" class="comments-list"></div>
        </div>
      </div>
    </div>
  `;
}

function loadAndDisplayArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get('id'));
  const container = document.getElementById('articleDynamicContent');
  if (!container) return;
  
  if (isNaN(postId)) {
    container.innerHTML = `<div class="error-404"><i class="fas fa-file-alt"></i><h2>Article not specified</h2><a href="index.html" class="back-btn">← Return to Blog</a></div>`;
    return;
  }
  
  const post = getPostById(postId);
  if (!post) {
    container.innerHTML = `<div class="error-404"><i class="fas fa-skull-crosswalk"></i><h2>404 | Article not found</h2><a href="index.html" class="back-btn">← Back to Home</a></div>`;
    return;
  }
  
  incrementPostVisitCount(postId);
  const articleHtml = renderArticleHTML(post);
  container.innerHTML = articleHtml;
  document.title = `${post.title} | Saqib Afridi`;
  renderRelatedPosts(post);
  initCommentForm(postId);
  renderComments(postId);
}

function openCMS() {
  window.open('cms.html', 'ByteLogCMS', 'width=1200,height=800');
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
    <p><i class="fas fa-terminal"></i> Hey there! I'm <strong>Saqib Afridi</strong>, a systems architect and full-stack developer with over a decade of experience.</p>
    <p><i class="fas fa-rocket"></i> I created this blog to share deep technical insights.</p>
    <div class="tech-stack">
      <span class="tech-badge">Rust</span>
      <span class="tech-badge">Go</span>
      <span class="tech-badge">Kubernetes</span>
      <span class="tech-badge">Python</span>
    </div>
  `;
  openModal('👨‍💻 About Saqib Afridi', aboutContent);
}

function showContactModal() {
  const contactContent = `
    <p><i class="fas fa-paper-plane"></i> Have a question? I'd love to hear from you!</p>
    <div class="contact-item"><i class="fas fa-envelope"></i> <a href="mailto:saqib@afridi.dev">saqib@afridi.dev</a></div>
    <div class="social-icons"><a href="#"><i class="fab fa-github"></i></a><a href="#"><i class="fab fa-twitter"></i></a></div>
  `;
  openModal('📬 Contact Saqib Afridi', contactContent);
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

// Reading Progress Bar
function updateReadingProgress() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  
  const progressBar = document.getElementById('readingProgressBar');
  if (progressBar) progressBar.style.width = scrolled + '%';
  
  const percentageEl = document.getElementById('progressPercentage');
  if (percentageEl) {
    percentageEl.textContent = Math.round(scrolled) + '%';
    if (scrolled > 5) percentageEl.classList.add('visible');
    else percentageEl.classList.remove('visible');
  }
  
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) {
    if (winScroll > 300) scrollBtn.classList.add('visible');
    else scrollBtn.classList.remove('visible');
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateReadingProgress();
      ticking = false;
    });
    ticking = true;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  allPosts = loadPostsFromCMS();
  loadAndDisplayArticle();
  
  const cmsBtn = document.getElementById('openCMSBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const contactBtn = document.getElementById('contactBtn');
  
  if (cmsBtn) cmsBtn.addEventListener('click', (e) => { e.preventDefault(); openCMS(); });
  if (aboutBtn) aboutBtn.addEventListener('click', showAboutModal);
  if (contactBtn) contactBtn.addEventListener('click', showContactModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); });
  
  document.querySelectorAll('.footer-links a').forEach(link => {
    if (link.getAttribute('href') === '#') link.addEventListener('click', (e) => e.preventDefault());
  });
  
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', updateReadingProgress);
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) scrollBtn.addEventListener('click', scrollToTop);
  updateReadingProgress();
  
  // Initialize Dark Mode
  initDarkMode();
});