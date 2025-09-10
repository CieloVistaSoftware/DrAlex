import { ChatWidget } from './chat-widget.js';
// Claude-Chat Web Component
// --- Merged from claude-service.js ---

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { Buffer } from 'buffer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ...existing code from claude-service.js...
class ClaudeChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.widget = null;
  }

  connectedCallback() {
    // Only create the widget once
    if (!this.widget) {
      try {
        this.widget = document.createElement('div');
        this.widget.style.display = 'block';
        this.shadowRoot.appendChild(this.widget);
        // Use the existing ChatWidget class to render into this.widget
        new ChatWidget({ mount: this.widget });
      } catch (err) {
        console.error('Error mounting ChatWidget in <claude-chat>:', err);
        this.shadowRoot.innerHTML = '<div style="color:red">Chat widget failed to load.</div>';
      }
    }
  }
}

customElements.define('claude-chat', ClaudeChat);
