# Website Access and Modification Guide

## Directory Structure
```
DrAlex/
├── css/
│   └── styles.css        # Main stylesheet
├── js/
│   ├── scripts.js        # Main JavaScript
│   └── chat-widget.js    # Chat functionality
├── server/               # Backend server
├── docs/                 # Documentation
└── images/              # Image assets
```

## Accessing Web Pages

### Development Server
1. Start the development server:
```powershell
npm start
```
This will:
- Start the backend server on port 3000
- Start the frontend server on port 5000
- Kill any existing processes on these ports

2. Access the website:
- Main site: http://localhost:5000
- Backend API: http://localhost:3000

### File Locations

#### HTML Pages
- Main page: `index.html`
- Edit these files directly to modify page content

#### Styles
- Main CSS: `css/styles.css`
- Theme files in `css/themes/`

#### Scripts
- Main JavaScript: `js/scripts.js`
- Chat widget: `js/chat-widget.js`

## Documentation Access

### Location
All documentation is in the `docs/` folder:
```
docs/
├── Analysis.md          # Technical analysis
├── BackendServerIssue.md # Server troubleshooting
├── CSSAnalysis.md      # CSS documentation
├── Layout.md           # Layout system docs
└── UsingAI.md         # AI integration guide
```

### Editing Documentation
1. Direct editing:
   - Open .md files in VS Code or any text editor
   - Use Markdown formatting
   - Save changes directly

2. Version control:
   ```powershell
   # Stage changes
   git add docs/*.md
   
   # Commit changes
   git commit -m "Update documentation: [description]"
   
   # Push changes
   git push origin master
   ```

## Making Changes

### 1. Local Development
```powershell
# Start development servers
npm start

# Edit files in your preferred editor
code .  # Opens VS Code
```

### 2. File Watching
The development server automatically reloads when you make changes to:
- HTML files
- CSS files
- JavaScript files

### 3. Testing Changes
1. View changes at http://localhost:5000
2. Test chat functionality with backend
3. Verify documentation updates in VS Code

## Best Practices

### 1. Website Changes
- Test changes locally first
- Follow existing patterns in HTML/CSS
- Update documentation when making structural changes
- Test across different themes

### 2. Documentation Updates
- Keep docs up to date with code changes
- Use consistent Markdown formatting
- Include code examples where helpful
- Cross-reference related documents

### 3. Version Control
- Commit changes regularly
- Use descriptive commit messages
- Create branches for major changes
- Review changes before pushing

## Access Control

### 1. Development Access
- All files accessible through VS Code
- Direct file system access
- Git repository access

### 2. Server Access
- Backend runs on port 3000
- Frontend on port 5000
- Environment variables in `.env`

### 3. Documentation Access
- Markdown files in `docs/`
- Readable in VS Code or any text editor
- Supports live preview

## Troubleshooting

### 1. Server Issues
- Check `BackendServerIssue.md`
- Verify ports 3000 and 5000 are available
- Check server logs in terminal

### 2. File Access Issues
- Verify file permissions
- Check file paths are correct
- Ensure VS Code has workspace access

### 3. Documentation Issues
- Verify Markdown syntax
- Check file encoding (should be UTF-8)
- Ensure no merge conflicts

## Support Resources

1. Local documentation in `docs/`
2. Project README.md
3. Server documentation in `server/README.md`
4. Theme documentation in `css/themes/README.md`

## Security Notes

1. Never commit:
   - `.env` files
   - API keys
   - Sensitive credentials

2. Always use:
   - Environment variables for secrets
   - `.gitignore` for sensitive files
   - Secure protocols for deployment
