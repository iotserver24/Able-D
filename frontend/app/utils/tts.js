/**
 * TTS Utility Functions
 * Helper functions for text-to-speech functionality
 */

/**
 * Clean text for TTS reading
 * Removes unnecessary characters and formats text for better speech
 */
export const cleanTextForTTS = (text) => {
  if (!text) return '';
  
  return text
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove special characters that don't need to be spoken
    .replace(/[•·▪▫◦‣⁃]/g, '')
    // Replace common abbreviations
    .replace(/\betc\b/gi, 'et cetera')
    .replace(/\be\.g\./gi, 'for example')
    .replace(/\bi\.e\./gi, 'that is')
    // Add pauses for better readability
    .replace(/([.!?])\s*/g, '$1 ')
    .replace(/([,;:])\s*/g, '$1 ')
    // Clean up
    .trim();
};

/**
 * Extract important text from a page section
 * Prioritizes headings, then paragraphs, then other content
 */
export const extractImportantText = (element) => {
  if (!element) return '';
  
  const texts = [];
  const processedElements = new Set();
  
  // Priority selectors in order of importance
  const prioritySelectors = [
    { selector: 'h1', prefix: 'Main heading: ' },
    { selector: 'h2', prefix: 'Section: ' },
    { selector: 'h3', prefix: 'Subsection: ' },
    { selector: '[role="alert"]', prefix: 'Alert: ' },
    { selector: '.error, .error-message', prefix: 'Error: ' },
    { selector: '.success, .success-message', prefix: 'Success: ' },
    { selector: 'label', prefix: 'Label: ' },
    { selector: 'button:not(:disabled)', prefix: 'Button: ' },
    { selector: 'a', prefix: 'Link: ' },
    { selector: 'p', prefix: '' },
    { selector: 'li', prefix: 'List item: ' },
    { selector: 'td', prefix: '' },
    { selector: 'span[aria-label]', prefix: '' },
  ];
  
  prioritySelectors.forEach(({ selector, prefix }) => {
    const elements = element.querySelectorAll(selector);
    
    elements.forEach(el => {
      // Skip if already processed or hidden
      if (processedElements.has(el)) return;
      if (isElementHidden(el)) return;
      
      // Mark element and its children as processed
      markAsProcessed(el, processedElements);
      
      // Get text content
      let text = getDirectTextContent(el);
      
      // Add ARIA label if available and different
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel !== text) {
        text = ariaLabel;
      }
      
      // Add value for input elements
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const value = el.value;
        if (value) {
          text = text ? `${text}: ${value}` : value;
        }
      }
      
      if (text) {
        texts.push(prefix + cleanTextForTTS(text));
      }
    });
  });
  
  return texts.join('. ');
};

/**
 * Check if an element is hidden
 */
const isElementHidden = (element) => {
  if (!element) return true;
  
  const style = window.getComputedStyle(element);
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hasAttribute('hidden') ||
    element.getAttribute('aria-hidden') === 'true'
  );
};

/**
 * Get direct text content (not from nested elements)
 */
const getDirectTextContent = (element) => {
  let text = '';
  
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    }
  }
  
  return text.trim();
};

/**
 * Mark element and its children as processed
 */
const markAsProcessed = (element, processedSet) => {
  processedSet.add(element);
  const children = element.querySelectorAll('*');
  children.forEach(child => processedSet.add(child));
};

/**
 * Get reading time estimate for text
 * Average reading speed: 150-160 words per minute for TTS
 */
export const getReadingTime = (text, wordsPerMinute = 150) => {
  if (!text) return 0;
  
  const words = text.trim().split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  
  return {
    minutes: Math.ceil(minutes),
    seconds: Math.ceil(minutes * 60),
    words
  };
};

/**
 * Create a reading queue from page sections
 */
export const createReadingQueue = (container) => {
  const queue = [];
  
  // Find main sections
  const sections = container.querySelectorAll('section, article, [role="region"]');
  
  if (sections.length > 0) {
    sections.forEach(section => {
      const text = extractImportantText(section);
      if (text) {
        queue.push({
          text,
          element: section,
          type: 'section'
        });
      }
    });
  } else {
    // Fall back to reading the entire container
    const text = extractImportantText(container);
    if (text) {
      queue.push({
        text,
        element: container,
        type: 'content'
      });
    }
  }
  
  return queue;
};

/**
 * Format form field for TTS
 */
export const formatFormFieldForTTS = (field) => {
  const parts = [];
  
  // Get label
  const label = field.labels?.[0]?.textContent || 
                field.getAttribute('aria-label') ||
                field.getAttribute('placeholder') ||
                field.name ||
                'Field';
  
  parts.push(cleanTextForTTS(label));
  
  // Add field type
  const type = field.type || field.tagName.toLowerCase();
  if (type !== 'text') {
    parts.push(type);
  }
  
  // Add required status
  if (field.required || field.getAttribute('aria-required') === 'true') {
    parts.push('required');
  }
  
  // Add current value
  if (field.value) {
    parts.push(`current value: ${field.value}`);
  }
  
  // Add error message if present
  const errorId = field.getAttribute('aria-describedby');
  if (errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement && !isElementHidden(errorElement)) {
      parts.push(`Error: ${cleanTextForTTS(errorElement.textContent)}`);
    }
  }
  
  return parts.join(', ');
};

/**
 * Get navigation announcement for route changes
 */
export const getNavigationAnnouncement = (routeName, pageTitle) => {
  const parts = [];
  
  if (pageTitle) {
    parts.push(`Navigated to ${pageTitle}`);
  } else if (routeName) {
    parts.push(`Navigated to ${routeName} page`);
  } else {
    parts.push('Page changed');
  }
  
  // Add page landmark information
  const mainContent = document.querySelector('main, [role="main"]');
  if (mainContent) {
    const heading = mainContent.querySelector('h1');
    if (heading) {
      parts.push(`Page heading: ${cleanTextForTTS(heading.textContent)}`);
    }
  }
  
  return parts.join('. ');
};

/**
 * Create keyboard navigation instructions
 */
export const getTTSKeyboardInstructions = () => {
  return `
    Voice assistance keyboard shortcuts:
    Alt plus R to read the current page.
    Alt plus S to stop reading.
    Alt plus P to pause or resume reading.
    Alt plus F to read the focused element.
    Tab key to navigate through interactive elements.
    Enter or Space to activate buttons and links.
  `;
};

/**
 * Format time for TTS
 */
export const formatTimeForTTS = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  
  return d.toLocaleDateString('en-US', options);
};

export default {
  cleanTextForTTS,
  extractImportantText,
  getReadingTime,
  createReadingQueue,
  formatFormFieldForTTS,
  getNavigationAnnouncement,
  getTTSKeyboardInstructions,
  formatTimeForTTS
};
