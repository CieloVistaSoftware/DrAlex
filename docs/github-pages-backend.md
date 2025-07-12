# Integrating Backend Services with GitHub Pages

GitHub Pages is designed to host static websites, which means it doesn't support running server-side code like Node.js directly. However, you can still create a dynamic site by connecting your GitHub Pages frontend to an external backend service.

This guide explains several methods to integrate backend functionality with the Dr. Alex Kisitu website when deployed on GitHub Pages.

## Option 1: Use a Serverless Architecture (Recommended)

Serverless functions provide a way to run backend code without maintaining a server.

### Using Netlify Functions

1. **Move your repository to Netlify**:
   - Connect your GitHub repository to Netlify
   - Set up build settings (typically `npm run build`)
   - Configure environment variables for your Claude API key

2. **Convert your backend to Netlify Functions**:
   ```javascript
   // netlify/functions/chat.js
   const express = require('express');
   const serverless = require('serverless-http');
   const app = express();
   
   // Import your existing chat service logic
   const chatService = require('../../server/claude-service');
   
   // Set up routes
   app.use('/.netlify/functions/chat', chatService);
   
   // Export the serverless function
   module.exports.handler = serverless(app);
   ```

3. **Update API URL in your frontend**:
   ```javascript
   // Update in chat-widget.js
   this.apiUrl = '/.netlify/functions/chat';
   ```

### Using Vercel Serverless Functions

1. **Move your repository to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set up environment variables for your Claude API key

2. **Create API routes**:
   ```javascript
   // api/chat.js
   import { createServer } from 'http';
   import { parse } from 'url';
   import chatService from '../../server/claude-service';
   
   export default async function handler(req, res) {
     // Implement your chat service logic here
     return chatService(req, res);
   }
   ```

3. **Update API URL in your frontend**:
   ```javascript
   this.apiUrl = '/api/chat';
   ```

## Option 2: Use a Dedicated Backend Service

Host your backend service separately and connect it to your GitHub Pages frontend.

### Using a Cloud Provider (AWS, Azure, GCP)

1. **Deploy your Node.js backend to a cloud provider**:
   - AWS Elastic Beanstalk
   - Azure App Service
   - Google Cloud Run
   - Heroku

2. **Configure CORS on your backend**:
   ```javascript
   const corsOptions = {
     origin: 'https://YOUR-GITHUB-USERNAME.github.io',
     methods: ['GET', 'POST', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

3. **Update API URL in your frontend**:
   ```javascript
   this.apiUrl = 'https://your-backend-service.com/api/chat';
   ```

## Option 3: Use a Third-Party API Service

For the Claude AI integration specifically, you can consider using a third-party API proxy.

### Using API Proxy Services

1. **Set up an account with an API gateway service**:
   - [RapidAPI](https://rapidapi.com/)
   - [Postman](https://www.postman.com/)
   - [Kong](https://konghq.com/)

2. **Configure the API gateway to forward requests to Claude's API**

3. **Update your frontend to use the API gateway URL**

## Option 4: Client-Side Only Approach with User-Provided Keys

If appropriate for your use case, you can modify the chat widget to allow users to enter their own Claude API key.

1. **Update the chat widget to include a settings panel**:
   ```javascript
   // Add a settings button to the chat header
   const settingsButton = document.createElement('button');
   settingsButton.className = 'settings-button';
   settingsButton.innerHTML = '⚙️';
   settingsButton.title = 'Settings';
   
   // Add a form for the API key
   const settingsPanel = document.createElement('div');
   settingsPanel.className = 'settings-panel';
   settingsPanel.innerHTML = `
     <h4>Claude API Settings</h4>
     <form>
       <label>
         API Key:
         <input type="password" id="claude-api-key" />
       </label>
       <button type="submit">Save</button>
     </form>
     <p class="hint">Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.</p>
   `;
   ```

2. **Store the user-provided API key in localStorage**:
   ```javascript
   settingsForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const apiKey = document.getElementById('claude-api-key').value;
     if (apiKey) {
       localStorage.setItem('claude-api-key', apiKey);
       this.userApiKey = apiKey;
       settingsPanel.classList.remove('open');
     }
   });
   ```

3. **Call the Claude API directly from the frontend** (Note: Only do this for non-sensitive applications as exposing API calls directly from the frontend has security implications)

## Deployment Instructions

### When Using GitHub Pages with a Serverless Backend

1. **Prepare your repository structure**:
   ```
   dr-alex-website/
   ├── index.html
   ├── css/
   ├── js/
   ├── images/
   ├── api/           # Serverless functions
   └── netlify.toml   # Or vercel.json
   ```

2. **Configure your deployment settings**:
   - For GitHub Pages with a custom action, create a GitHub Action workflow file:
   
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Set up Node.js
           uses: actions/setup-node@v1
           with:
             node-version: '16'
         - name: Install dependencies
           run: npm ci
         - name: Build site
           run: npm run build
         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@4.1.4
           with:
             branch: gh-pages
             folder: build
   ```

3. **Set up environment variables for CI/CD**:
   - Add your Claude API key to GitHub Secrets

### Recommended Solution for Dr. Alex Website

Based on the project structure and requirements, we recommend:

1. **Use Netlify or Vercel** for deploying both the frontend and backend functions
2. **Keep the GitHub repository** as the source of truth
3. **Configure automatic deployments** when changes are pushed to the main branch

This approach eliminates the need to maintain separate hosting for the backend while still allowing you to use GitHub for version control.

## Testing Your Setup

Once deployed, you should verify:

1. The chat widget can connect to the backend service
2. API keys are properly secured
3. CORS is correctly configured to allow requests from your GitHub Pages domain
4. Error handling gracefully manages connection issues

## Security Considerations

When integrating backend services with GitHub Pages:

1. **Never commit API keys** to your repository
2. **Set up proper CORS restrictions** to prevent unauthorized domains from using your API
3. **Implement rate limiting** to prevent abuse
4. **Add proper authentication** if handling sensitive information

For the Claude AI integration specifically, ensure your API key is kept secure and not exposed to client-side code when possible.
