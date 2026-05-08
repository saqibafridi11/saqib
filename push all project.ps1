cd C:\xampp\htdocs\my

# Check current status
Write-Host "Current status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Adding ALL files..." -ForegroundColor Green
git add .

Write-Host ""
Write-Host "Committing all files..." -ForegroundColor Green
git commit -m "Full project upload: HTML, CSS, JS, and all assets"

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "Done! All files pushed!" -ForegroundColor Green