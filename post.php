<?php
// Single post view - displays one blog post
$postFile = $_GET['post'] ?? '';

if (!$postFile || !file_exists("_posts/$postFile")) {
    header('Location: index.php');
    exit;
}

$content = file_get_contents("_posts/$postFile");

// Parse frontmatter
if (preg_match('/^---\n(.*?)\n---\n(.*)$/s', $content, $matches)) {
    $frontmatter = $matches[1];
    $body = $matches[2];
    
    $post = [];
    preg_match_all('/^(\w+):\s*(.+)$/m', $frontmatter, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $post[$match[1]] = trim($match[2], '"');
    }
    $post['body'] = $body;
    
    // Extract date from filename
    if (preg_match('/^(\d{4}-\d{2}-\d{2})/', $postFile, $dateMatch)) {
        $post['date'] = date('F d, Y', strtotime($dateMatch[1]));
    }
    
    // Convert Markdown to HTML (simple version)
    $post['body'] = htmlspecialchars($post['body']);
    $post['body'] = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $post['body']);
    $post['body'] = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $post['body']);
    $post['body'] = preg_replace('/## (.*?)\n/', '<h2>$1</h2>', $post['body']);
    $post['body'] = preg_replace('/### (.*?)\n/', '<h3>$1</h3>', $post['body']);
    $post['body'] = nl2br($post['body']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($post['title']); ?> | Saqib Afridi</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f8fafc; font-family: 'Inter', sans-serif; color: #0a0c10; line-height: 1.6; }
        body.dark-mode { background: #0a0c10; color: #e2e8f0; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        
        .site-header { background: #0a0f1a; padding: 20px 0; border-bottom: 1px solid #1e2a3a; }
        .header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; max-width: 1280px; margin: 0 auto; padding: 0 32px; }
        .logo h1 { font-size: 1.5rem; background: linear-gradient(135deg, #3b82f6, #a855f7); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .nav-links a { text-decoration: none; color: #cfdfed; margin-left: 20px; }
        
        .post-header { margin: 50px 0 30px; text-align: center; }
        .post-title { font-size: 2.5rem; margin-bottom: 20px; }
        .post-meta { color: #64748b; margin-bottom: 30px; }
        .post-content { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        body.dark-mode .post-content { background: #111827; }
        .post-content h2 { margin: 30px 0 15px; }
        .post-content p { margin-bottom: 20px; }
        .post-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        
        .back-link { display: inline-block; margin: 30px 0; color: #3b82f6; text-decoration: none; }
        .footer-tech { background: #030712; padding: 40px 0; text-align: center; margin-top: 60px; color: #6c7a91; }
        
        @media (max-width: 768px) {
            .post-title { font-size: 1.8rem; }
            .post-content { padding: 24px; }
        }
    </style>
</head>
<body>

<header class="site-header">
    <div class="header-inner">
        <div class="logo"><h1>&lt;Saqib Afridi/&gt;</h1></div>
        <div class="nav-links">
            <a href="index.php">Home</a>
            <a href="About me.html">About</a>
            <a href="contact me.html">Contact</a>
        </div>
    </div>
</header>

<div class="container">
    <div class="post-header">
        <h1 class="post-title"><?php echo htmlspecialchars($post['title']); ?></h1>
        <div class="post-meta">
            <span><i class="far fa-calendar-alt"></i> <?php echo $post['date']; ?></span>
            <span style="margin-left: 20px;"><i class="far fa-folder"></i> <?php echo ucfirst($post['category']); ?></span>
            <span style="margin-left: 20px;"><i class="far fa-clock"></i> <?php echo $post['readTime'] ?? '5 min read'; ?></span>
        </div>
    </div>
    
    <div class="post-content">
        <?php echo $post['body']; ?>
    </div>
    
    <a href="index.php" class="back-link"><i class="fas fa-arrow-left"></i> ← Back to Blog</a>
</div>

<footer class="footer-tech">
    <div class="container">
        <div class="copyright">© 2026 All rights Reserved. Crafted with ❤️ by Saqib Afridi.</div>
    </div>
</footer>

<script>
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
</script>
</body>
</html>