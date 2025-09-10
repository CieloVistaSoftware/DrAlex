# Run Chat Widget Test Suite
# This script tests the chat widget with multiple test pages

Write-Host "🚀 Starting Chat Widget Test Suite" -ForegroundColor Green
Write-Host "Killing any existing http-server processes..." -ForegroundColor Yellow

# Kill any existing server on port 5500
npx kill-port 5500

# Start HTTP server
Write-Host "Starting HTTP server on port 5500..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath "npx" -ArgumentList "http-server -p 5500 -c-1" -PassThru -WindowStyle Hidden

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Open each test page
Write-Host "📋 Opening test pages..." -ForegroundColor Cyan

Write-Host "1. Opening the original chat-test.html" -ForegroundColor Magenta
Start-Process "http://localhost:5500/chat-test.html"

Write-Host "2. Opening the simple-chat-test.html" -ForegroundColor Magenta
Start-Process "http://localhost:5500/simple-chat-test.html"

Write-Host "3. Opening the new improved-chat-test.html" -ForegroundColor Magenta
Start-Process "http://localhost:5500/improved-chat-test.html"

Write-Host "✅ All test pages launched! Review each page to verify dark mode works correctly." -ForegroundColor Green
Write-Host "📝 Use the controls on the improved-chat-test.html page to thoroughly test the widget." -ForegroundColor Yellow
Write-Host "⚠️ The backend server is not started by this script. Use 'npm run backend' in another terminal if needed." -ForegroundColor Red

# Prompt to close the server when done
Read-Host -Prompt "Press Enter to stop the HTTP server when finished testing"

# Stop the server
Stop-Process -Id $serverProcess.Id -Force
npx kill-port 5500

Write-Host "✅ HTTP server stopped. Test suite complete!" -ForegroundColor Green
