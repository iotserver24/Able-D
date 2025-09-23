/**
 * TTS Utility Functions
 * Helper functions for Text-to-Speech functionality
 */

/**
 * Extract readable text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Cleaned text for TTS
 */
export function extractTextFromHTML(html) {
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script and style elements
  const scripts = temp.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get text content
  let text = temp.textContent || temp.innerText || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Prioritize content for reading
 * @param {HTMLElement} element - DOM element
 * @returns {Array} - Array of text segments in priority order
 */
export function prioritizeContent(element) {
  const segments = [];
  
  // Priority 1: Main headings
  const h1Elements = element.querySelectorAll('h1');
  h1Elements.forEach(h1 => {
    segments.push({
      text: h1.textContent.trim(),
      type: 'heading',
      priority: 1
    });
  });
  
  // Priority 2: Subheadings
  const h2Elements = element.querySelectorAll('h2, h3');
  h2Elements.forEach(h => {
    segments.push({
      text: h.textContent.trim(),
      type: 'subheading',
      priority: 2
    });
  });
  
  // Priority 3: Important alerts/notifications
  const alerts = element.querySelectorAll('[role="alert"], .alert, .notification');
  alerts.forEach(alert => {
    segments.push({
      text: alert.textContent.trim(),
      type: 'alert',
      priority: 3
    });
  });
  
  // Priority 4: Main content paragraphs
  const paragraphs = element.querySelectorAll('p, li');
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    if (text.length > 20) { // Skip very short paragraphs
      segments.push({
        text: text,
        type: 'content',
        priority: 4
      });
    }
  });
  
  // Priority 5: Buttons and links
  const interactive = element.querySelectorAll('button, a');
  interactive.forEach(el => {
    const text = el.textContent.trim();
    if (text) {
      segments.push({
        text: `${el.tagName === 'BUTTON' ? 'Button' : 'Link'}: ${text}`,
        type: 'interactive',
        priority: 5
      });
    }
  });
  
  // Sort by priority
  segments.sort((a, b) => a.priority - b.priority);
  
  return segments;
}

/**
 * Format text for better TTS pronunciation
 * @param {string} text - Raw text
 * @returns {string} - Formatted text
 */
export function formatForTTS(text) {
  let formatted = text;
  
  // Expand common abbreviations
  const abbreviations = {
    'Dr.': 'Doctor',
    'Mr.': 'Mister',
    'Mrs.': 'Missus',
    'Ms.': 'Miss',
    'Prof.': 'Professor',
    'St.': 'Street',
    'Ave.': 'Avenue',
    'etc.': 'et cetera',
    'vs.': 'versus',
    'e.g.': 'for example',
    'i.e.': 'that is',
  };
  
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}`, 'gi');
    formatted = formatted.replace(regex, full);
  });
  
  // Add pauses for better readability
  formatted = formatted.replace(/([.!?])\s+/g, '$1 ... ');
  formatted = formatted.replace(/([,;:])\s+/g, '$1 .. ');
  
  // Handle numbers
  formatted = formatted.replace(/\b(\d+)\s*%/g, '$1 percent');
  formatted = formatted.replace(/\$\s*(\d+)/g, '$1 dollars');
  
  // Handle special characters
  formatted = formatted.replace(/&/g, ' and ');
  formatted = formatted.replace(/@/g, ' at ');
  formatted = formatted.replace(/#/g, ' number ');
  
  return formatted;
}

/**
 * Get reading time estimate
 * @param {string} text - Text to read
 * @param {number} wordsPerMinute - Reading speed (default 150)
 * @returns {number} - Estimated time in seconds
 */
export function getReadingTime(text, wordsPerMinute = 150) {
  const words = text.split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes * 60);
}

/**
 * Create speech-friendly description of UI element
 * @param {HTMLElement} element - DOM element
 * @returns {string} - Description for TTS
 */
export function describeElement(element) {
  const descriptions = [];
  
  // Get role or element type
  const role = element.getAttribute('role') || element.tagName.toLowerCase();
  
  // Get label or text content
  const label = element.getAttribute('aria-label') || 
                element.getAttribute('title') || 
                element.textContent?.trim();
  
  // Build description based on element type
  switch (role) {
    case 'button':
      descriptions.push(`Button: ${label}`);
      if (element.disabled) descriptions.push('Disabled');
      break;
      
    case 'link':
    case 'a':
      descriptions.push(`Link: ${label}`);
      const href = element.getAttribute('href');
      if (href && href.startsWith('http')) {
        descriptions.push('External link');
      }
      break;
      
    case 'textbox':
    case 'input':
      const inputType = element.getAttribute('type') || 'text';
      descriptions.push(`${inputType} input`);
      if (label) descriptions.push(label);
      if (element.value) descriptions.push(`Current value: ${element.value}`);
      if (element.required) descriptions.push('Required field');
      break;
      
    case 'img':
      const alt = element.getAttribute('alt');
      if (alt) {
        descriptions.push(`Image: ${alt}`);
      } else {
        descriptions.push('Image without description');
      }
      break;
      
    case 'heading':
    case 'h1':
    case 'h2':
    case 'h3':
      const level = element.tagName.charAt(1);
      descriptions.push(`Heading level ${level}: ${label}`);
      break;
      
    default:
      if (label) descriptions.push(label);
  }
  
  return descriptions.join('. ');
}

/**
 * Check if element is visible
 * @param {HTMLElement} element - DOM element
 * @returns {boolean} - Whether element is visible
 */
export function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetParent !== null;
}

/**
 * Get focusable elements
 * @param {HTMLElement} container - Container element
 * @returns {Array} - Array of focusable elements
 */
export function getFocusableElements(container = document) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  const elements = container.querySelectorAll(focusableSelectors);
  return Array.from(elements).filter(isElementVisible);
}

/**
 * Announce message with ARIA live region
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export default {
  extractTextFromHTML,
  prioritizeContent,
  formatForTTS,
  getReadingTime,
  describeElement,
  isElementVisible,
  getFocusableElements,
  announceToScreenReader,
};
