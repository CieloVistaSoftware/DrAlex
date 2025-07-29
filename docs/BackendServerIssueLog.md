# Backend Server Issue Resolution

## Issue Description
1. Chat functionality fails to display responses intermittently
2. Server logs show successful API calls but responses don't appear in chat interface
3. Specifically observed with second question in conversation
4. Server is running and processing requests correctly

## Root Cause Analysis
1. Backend Service Status:
   - Server running on port 3000
   - Successful API calls to Claude
   - Responses being generated

2. Potential Issues:
   - WebSocket connection interruption
   - Frontend response handling
   - Message queue synchronization
   - CORS or network issues

## Immediate Solutions

### 1. Connection Reset
```powershell
# Stop all servers
npm run kill-ports

# Clear browser cache and reload
# Restart servers
npm start
```

### 2. WebSocket Check
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.log('WebSocket Error:', error);
```

### 3. Network Debug Mode
```powershell
# Start server with debug logging
$env:DEBUG="*"; npm start
```

## Detailed Troubleshooting

### 1. Server Status Check
```powershell
# Check if server process is running
Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*claude-service.js*"}

# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### 2. Common Error Messages

#### Server Not Running
```json
{
  "error": "Failed to fetch",
  "details": "Unable to connect to backend server"
}
```
Solution: Start the server using `npm run dev`

#### API Key Issues
```json
{
  "error": "API configuration error",
  "details": "CLAUDE_API_KEY environment variable is not set"
}
```
Solution: Set the CLAUDE_API_KEY in `.env` file

#### Port Conflict
```
Error: listen EADDRINUSE: address already in use :::3000
```
Solution:
```powershell
# Find and stop process using port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

## Prevention Measures

### 1. Server Start Verification
Add to your project startup script:
```powershell
function Start-ChatServer {
    # Navigate to server directory
    Set-Location -Path ".\server"
    
    # Check if server is already running
    $serverProcess = Get-Process -Name "node" | 
                    Where-Object {$_.CommandLine -like "*claude-service.js*"}
    
    if ($serverProcess) {
        Write-Host "Server is already running"
        return
    }
    
    # Start server
    npm run dev
}
```

### 2. Environment Check
```powershell
function Test-ServerEnvironment {
    # Check Node.js version
    $nodeVersion = node -v
    if ([version]($nodeVersion -replace 'v','') -lt [version]'18.0.0') {
        Write-Error "Node.js v18 or higher required"
        return $false
    }
    
    # Check .env file
    if (-not (Test-Path .\.env)) {
        Write-Error ".env file missing"
        return $false
    }
    
    # Check API key
    if (-not (Get-Content .\.env | Select-String 'CLAUDE_API_KEY=')) {
        Write-Error "CLAUDE_API_KEY not set in .env"
        return $false
    }
    
    return $true
}
```

## Monitoring

### 1. Server Health Check Script
```powershell
function Test-ServerHealth {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
        Write-Host "Server Status: $($health.status)"
        Write-Host "API Key Configured: $($health.config.apiKeyConfigured)"
        Write-Host "API Key Valid: $($health.config.apiKeyValid)"
    }
    catch {
        Write-Error "Server health check failed: $_"
    }
}
```

### 2. Log Monitoring
Server logs are available in the console where the server is running. Keep this window visible for real-time monitoring.

## Best Practices

1. **Server Management**
   - Always verify server status before testing chat
   - Keep the server running in a dedicated terminal
   - Monitor server logs for errors

2. **Environment Setup**
   - Use `.env.template` as a reference
   - Never commit API keys to version control
   - Keep Node.js updated to latest LTS version

3. **Testing**
   - Run health check before using chat
   - Test with simple queries first
   - Monitor server logs during testing

## Chat Widget Response Issue
Problem identified in chat-widget.js:
1. Response handling in sendMessage() function
2. WebSocket connection state management
3. Session history synchronization

### Quick Fix
```javascript
// In chat-widget.js
async sendMessage() {
  try {
    // ... existing code ...
    
    // Add debug logging
    console.log('Message sent, waiting for response...');
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversationId: this.conversationId,
        sessionHistory: this.sessionHistory
      })
    });
    
    console.log('Response received:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    // ... rest of the code ...
  } catch (error) {
    console.error('Error in sendMessage:', error);
    // ... error handling ...
  }
}
```

## Additional Resources

1. Server documentation in `server/README.md`
2. Claude API documentation
3. Environment setup guide in project root

## Support

If issues persist:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure no port conflicts with other services
4. Contact technical support with log outputs
