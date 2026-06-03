<?php
// Blog homepage - reads all posts from _posts folder
$posts = [];

// Read all .md files from _posts directory
foreach (glob('_posts/*.md') as $file) {
    $content = file_get_contents($file);
    
    // Extract frontmatter (the --- section at the top)
    if (preg_match('/^---\n(.*?)\n---\n(.*)$/s', $content, $matches)) {
        $frontmatter = $matches[1];
        $body = $matches[2];
        
        // Parse YAML frontmatter (simple version)
        $post = [];
        preg_match_all('/^(\w+):\s*(.+)$/m', $frontmatter, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $post[$match[1]] = trim($match[2], '"');
        }
        
        $post['body'] = $body;
        $post['file'] = $file;
        $post['filename'] = basename($file);
        
        // Extract date from filename (format: YYYY-MM-DD-title.md)
        if (preg_match('/^(\d{4}-\d{2}-\d{2})/', $post['filename'], $dateMatch)) {
            $post['date'] = date('M d, Y', strtotime($dateMatch[1]));
        }
        
        $posts[] = $post;
    }
}

// Sort posts by date (newest first)
usort($posts, function($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

// Get unique categories for filter
$categories = array_unique(array_column($posts, 'category'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saqib Afridi | Tech Blog</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f8fafc; font-family: 'Inter', sans-serif; color: #0a0c10; }
        body.dark-mode { background: #0a0c10; color: #e2e8f0; }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
        
        /* Header */
        .site-header { background: #0a0f1a; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #1e2a3a; }
        .header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; padding: 18px 0; gap: 20px; }
        .logo h1 { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 1.8rem; background: linear-gradient(135deg, #3b82f6, #a855f7); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .logo p { font-size: 0.7rem; color: #7e8b9c; }
        .nav-links { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .nav-links a { text-decoration: none; font-weight: 500; color: #cfdfed; transition: 0.2s; }
        .nav-links a:hover { color: #60a5fa; }
        .nav-btn { background: transparent; border: 1px solid #3b82f6; padding: 8px 20px; border-radius: 30px; color: #cfdfed; cursor: pointer; }
        .dark-mode-btn { background: #1e2a3a; }
        
        /* Hero */
        .hero-tech { background: linear-gradient(135deg, #0a0f1a, #111827); padding: 60px 0; text-align: center; }
        .hero-tech h2 { font-size: 2.5rem; color: white; }
        .hero-tech h2 span { background: linear-gradient(135deg, #60a5fa, #a855f7); background-clip: text; -webkit-background-clip: text; color: transparent; }
        
        /* Filter Bar */
        .filter-bar { display: flex; flex-wrap: wrap; gap: 12px; margin: 30px 0 20px; }
        .tech-chip { background: #e2e8f0; padding: 8px 20px; border-radius: 30px; cursor: pointer; transition: 0.2s; }
        body.dark-mode .tech-chip { background: #1e293b; color: #e2e8f0; }
        .tech-chip.active { background: #3b82f6; color: white; }
        
        /* Blog Grid */
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; margin: 40px 0; }
        .tech-card { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; transition: transform 0.2s; cursor: pointer; }
        body.dark-mode .tech-card { background: #111827; border-color: #1f2a3e; }
        .tech-card:hover { transform: translateY(-5px); }
        .card-img { height: 200px; background-size: cover; background-position: center; position: relative; }
        .card-category-badge { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.7); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; color: white; }
        .card-content { padding: 20px; }
        .card-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
        .card-excerpt { color: #64748b; font-size: 0.85rem; line-height: 1.5; margin-bottom: 15px; }
        body.dark-mode .card-excerpt { color: #94a3b8; }
        .meta-stats { display: flex; gap: 15px; font-size: 0.7rem; color: #64748b; }
        
        /* Footer */
        .footer-tech { background: #030712; padding: 40px 0; text-align: center; margin-top: 60px; color: #6c7a91; }
        
        @media (max-width: 768px) {
            .container { padding: 0 20px; }
            .blog-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<header class="site-header">
    <div class="container header-inner">
        <div class="logo">
            <h1>&lt;Saqib Afridi/&gt;</h1>
            <p>// computers, code & innovation</p>
        </div>
        <div class="nav-links">
            <a href="index.php">Home</a>
            <a href="About me.html" class="nav-btn">About Me</a>
            <a href="contact me.html" class="nav-btn">Contact Me</a>
            <button class="nav-btn dark-mode-btn" id="darkModeToggle">🌙 Dark Mode</button>
            <a href="https://saqibafridi.netlify.app/admin/" class="nav-btn" style="background:#10b981;">Admin CMS</a>
        </div>
    </div>
</header>

<section class="hero-tech">
    <div class="container">
        <h2>Welcome to <span>Saqib Afridi Blog</span></h2>
        <p style="color: #94a3b8; margin-top: 15px;">Technology, programming, and hardware insights</p>
    </div>
</section>

<div class="container">
    <!-- Category Filter -->
    <div class="filter-bar" id="filterBar">
        <div class="tech-chip active" data-category="all">📡 All</div>
        <?php foreach ($categories as $cat): ?>
            <?php 
            $icon = match($cat) {
                'programming' => '💻',
                'hardware' => '🖥️',
                'security' => '🔒',
                'computer-tricks' => '🪄',
                'tutorial' => '📚',
                default => '📁'
            };
            ?>
            <div class="tech-chip" data-category="<?php echo $cat; ?>"><?php echo $icon . ' ' . ucfirst($cat); ?></div>
        <?php endforeach; ?>
    </div>

    <!-- Blog Posts Grid -->
    <div class="blog-grid" id="blogGrid">
        <?php foreach ($posts as $post): ?>
            <?php
            $categoryIcon = match($post['category']) {
                'programming' => '💻',
                'hardware' => '🖥️',
                'security' => '🔒',
                'computer-tricks' => '🪄',
                default => '📁'
            };
            $imgUrl = $post['imgUrl'] ?? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600';
            ?>
            <div class="tech-card" data-category="<?php echo $post['category']; ?>">
                <div class="card-img" style="background-image: url('<?php echo $imgUrl; ?>');">
                    <div class="card-category-badge"><?php echo $categoryIcon . ' ' . ucfirst($post['category']); ?></div>
                </div>
                <div class="card-content">
                    <div class="card-title"><?php echo htmlspecialchars($post['title']); ?></div>
                    <div class="card-excerpt"><?php echo htmlspecialchars(substr($post['excerpt'] ?? '', 0, 120)) . '...'; ?></div>
                    <div class="meta-stats">
                        <span><i class="far fa-calendar-alt"></i> <?php echo $post['date']; ?></span>
                        <span><i class="far fa-clock"></i> <?php echo $post['readTime'] ?? '5 min read'; ?></span>
                        <a href="post.php?post=<?php echo urlencode($post['filename']); ?>" style="color: #3b82f6; text-decoration: none;">Read more →</a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<footer class="footer-tech">
    <div class="container">
        <div class="copyright">© 2026 All rights Reserved. Crafted with ❤️ by Saqib Afridi.</div>
    </div>
</footer>

<script>
// Category filter
document.querySelectorAll('.tech-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const category = chip.dataset.category;
        
        document.querySelectorAll('.tech-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        document.querySelectorAll('.tech-card').forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Dark mode
const darkModeToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});
</script>
</body>
</html>