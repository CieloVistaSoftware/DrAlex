// Admin controller for dynamic website changes
class AdminController {
  constructor() {
    this.adminKey = localStorage.getItem('adminKey');
    this.isAdmin = false;
    this.pendingChanges = [];
    console.log('AdminController initialized');
  }

  // Initialize admin features
  async init() {
    console.log('Initializing AdminController...');
    if (!this.adminKey) {
      console.log('No admin key found in localStorage');
      this.isAdmin = false;
      return;
    }

    try {
      console.log('Verifying admin key...');
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': this.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`Admin verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.isAdmin = data.success;
      console.log('Admin verification complete. Status:', this.isAdmin ? 'Verified' : 'Not verified');
    } catch (error) {
      console.error('Admin verification error:', error);
      this.isAdmin = false;
      localStorage.removeItem('adminKey');
      throw new Error('Failed to verify admin access: ' + error.message);
    }
  }

  // Make authenticated admin request
  async makeAdminRequest(endpoint, method = 'POST', data = null) {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': this.adminKey
      },
      body: data ? JSON.stringify(data) : null
    });

    if (!response.ok) {
      throw new Error(`Admin request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Handle image updates
  async updateImage(target, newImage) {
    const formData = new FormData();
    formData.append('image', newImage);
    formData.append('target', target);

    try {
      const response = await fetch('/api/admin/update-image', {
        method: 'POST',
        headers: {
          'x-admin-key': this.adminKey
        },
        body: formData
      });

      if (!response.ok) throw new Error('Image update failed');

      const result = await response.json();
      this.logChange('image', { target, newImage: result.newPath });
      return result;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }

  // Handle text content updates
  async updateContent(selector, newContent, page) {
    try {
      const result = await this.makeAdminRequest('/api/admin/update-content', 'POST', {
        selector,
        newContent,
        page
      });

      this.logChange('content', { selector, newContent, page });
      return result;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  // Handle style updates
  async updateStyle(selector, property, value) {
    try {
      const result = await this.makeAdminRequest('/api/admin/update-style', 'POST', {
        selector,
        property,
        value
      });

      this.logChange('style', { selector, property, value });
      return result;
    } catch (error) {
      console.error('Error updating style:', error);
      throw error;
    }
  }

  // Log changes for audit
  async logChange(type, details) {
    try {
      await this.makeAdminRequest('/api/admin/log-change', 'POST', {
        type,
        details,
        user: 'admin' // Could be enhanced with actual user identification
      });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  }

  // Parse and handle admin commands from chat
  async handleAdminCommand(command) {
    // Common commands pattern matching
    const imageMatch = command.match(/change (image|picture) (.*?) to (.*)/i);
    const textMatch = command.match(/change (text|content) (in|of) (.*?) to ["'](.*)["']/i);
    const styleMatch = command.match(/change (style|css) of (.*?) (.*?) to (.*)/i);

    try {
      if (imageMatch) {
        const [, , target, newImage] = imageMatch;
        return await this.updateImage(target, newImage);
      } 
      else if (textMatch) {
        const [, , , selector, newContent] = textMatch;
        return await this.updateContent(selector, newContent, window.location.pathname);
      }
      else if (styleMatch) {
        const [, , selector, property, value] = styleMatch;
        return await this.updateStyle(selector, property, value);
      }
      else {
        throw new Error('Unknown admin command format');
      }
    } catch (error) {
      console.error('Error handling admin command:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AdminController();
