# push-to-github.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pushing Website to GitHub" -ForegroundColor Cyan
Write-Host "  Repository: saqibafridi11/saqib" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to your project folder (CHANGE THIS PATH!)
$projectPath = "C:\path\to\your\project"  # <-- CHANGE THIS TO YOUR FOLDER PATH
Set-Location $projectPath

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Green
    git init
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""

# Create/Update .gitignore
Write-Host "📝 Creating .gitignore..." -ForegroundColor Green
@"
# OS files
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# PHP files (not needed for GitHub Pages)
*.php

# Backup files
*.bak
*.log
*.tmp
*.old

# Environment
.env
.env.local
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "✅ .gitignore created" -ForegroundColor Green
Write-Host ""

# Add all files
Write-Host "📦 Adding files to git..." -ForegroundColor Green
git add .

Write-Host ""

# Check what's being added
Write-Host "📋 Files being committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Commit files
Write-Host "💾 Committing files..." -ForegroundColor Green
$commitMessage = "Update website with secure CMS - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

Write-Host ""

# Check if remote exists
$remote = git remote
if (-not $remote) {
    Write-Host "🔗 Adding remote repository..." -ForegroundColor Green
    git remote add origin https://github.com/saqibafridi11/saqib.git
} else {
    Write-Host "✅ Remote already configured" -ForegroundColor Green
    git remote set-url origin https://github.com/saqibafridi11/saqib.git
}

Write-Host ""

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
Write-Host "   This may take a moment..." -ForegroundColor Yellow
git push -u origin main

# If main fails, try master
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Trying with 'master' branch..." -ForegroundColor Yellow
    git push -u origin master
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Repository: https://github.com/saqibafridi11/saqib" -ForegroundColor Yellow
Write-Host "🌐 Live Site: https://saqibafridi11.github.io/saqib/" -ForegroundColor Yellow
Write-Host "🔐 CMS Password: peshawar.123" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Website will be live in 1-2 minutes" -ForegroundColor Cyan
Write-Host "📊 Check progress: https://github.com/saqibafridi11/saqib/actions" -ForegroundColor Cyan
Write-Host ""