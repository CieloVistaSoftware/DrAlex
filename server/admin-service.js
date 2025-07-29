import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Middleware to check admin authorization
const checkAdminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Handle image changes
router.post('/update-image', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { target, newImage } = req.body;
    if (!target || !req.file) {
      return res.status(400).json({ error: 'Missing target location or image' });
    }

    // Update HTML files that reference this image
    const htmlDir = path.join(__dirname, '../');
    const htmlFiles = await fs.readdir(htmlDir);
    
    for (const file of htmlFiles) {
      if (file.endsWith('.html')) {
        const filePath = path.join(htmlDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Replace image references
        content = content.replace(
          new RegExp(`src=["']${target}["']`, 'g'),
          `src="${req.file.filename}"`
        );
        
        await fs.writeFile(filePath, content);
      }
    }

    res.json({ 
      success: true, 
      message: 'Image updated successfully',
      newPath: req.file.filename
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Handle text content changes
router.post('/update-content', checkAdminAuth, async (req, res) => {
  try {
    const { selector, newContent, page } = req.body;
    if (!selector || !newContent || !page) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filePath = path.join(__dirname, '..', page);
    let content = await fs.readFile(filePath, 'utf8');

    // Use regex to find and replace content within the specified selector
    const regex = new RegExp(`(<${selector}[^>]*>)(.*?)(</${selector}>)`, 'gs');
    content = content.replace(regex, `$1${newContent}$3`);

    await fs.writeFile(filePath, content);

    res.json({ 
      success: true, 
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Handle style changes
router.post('/update-style', checkAdminAuth, async (req, res) => {
  try {
    const { selector, property, value } = req.body;
    if (!selector || !property || !value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cssPath = path.join(__dirname, '../css/custom.css');
    let css = await fs.readFile(cssPath, 'utf8');

    // Update or add style rule
    const ruleRegex = new RegExp(`${selector}\\s*{[^}]*}`);
    const propertyRegex = new RegExp(`${property}:\\s*[^;]+;`);

    if (ruleRegex.test(css)) {
      if (propertyRegex.test(css)) {
        css = css.replace(propertyRegex, `${property}: ${value};`);
      } else {
        css = css.replace(ruleRegex, (match) => {
          return match.replace('}', `  ${property}: ${value};\n}`);
        });
      }
    } else {
      css += `\n\n${selector} {\n  ${property}: ${value};\n}`;
    }

    await fs.writeFile(cssPath, css);

    res.json({ 
      success: true, 
      message: 'Style updated successfully' 
    });
  } catch (error) {
    console.error('Error updating style:', error);
    res.status(500).json({ error: 'Failed to update style' });
  }
});

// Log all changes for audit
router.post('/log-change', checkAdminAuth, async (req, res) => {
  try {
    const { type, details, user } = req.body;
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      details,
      user
    };

    const logPath = path.join(__dirname, '../logs/changes.json');
    let logs = [];
    try {
      const existing = await fs.readFile(logPath, 'utf8');
      logs = JSON.parse(existing);
    } catch (e) {
      // File doesn't exist or is invalid, start new log
    }

    logs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging change:', error);
    res.status(500).json({ error: 'Failed to log change' });
  }
});

// Verify admin key
router.post('/verify', checkAdminAuth, (req, res) => {
  res.json({ success: true });
});

export default router;
