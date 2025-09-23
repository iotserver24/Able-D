# Text-to-Speech (TTS) Implementation for Visually Impaired Students

## Overview
This TTS implementation provides comprehensive voice assistance for visually impaired students using the Web Speech API. The system automatically activates when a visually impaired student logs in and provides various features to enhance accessibility.

## Features

### 1. **Automatic TTS Welcome Popup**
- Shows a transparent overlay when visually impaired students log in
- Asks if they want to enable voice assistance
- Click anywhere or press Enter to enable
- Press Escape to skip

### 2. **Voice Reading Capabilities**
- Automatic page content reading on navigation
- Smart text extraction with priority-based reading (headings first)
- Form field descriptions and validation messages
- Navigation announcements
- Success/error message announcements

### 3. **TTS Controller**
- Floating control panel for managing TTS
- Play/Pause/Stop controls
- Speed adjustment (0.5x to 2x)
- Volume control (0% to 100%)
- Settings panel with keyboard shortcuts display
- Visual speaking indicator

### 4. **Keyboard Shortcuts**
- `Alt + R`: Read current page content
- `Alt + S`: Stop reading
- `Alt + P`: Pause/Resume reading
- `Alt + F`: Read focused element

## Components Structure

```
frontend/app/
├── components/tts/
│   ├── TTSWelcomePopup.jsx    # Welcome popup for first-time users
│   ├── TTSController.jsx      # Floating TTS control panel
│   └── README.md              # This documentation
├── contexts/
│   └── TTSContext.jsx         # Global TTS state management
├── hooks/
│   └── useTTS.js             # Core TTS functionality hook
├── utils/
│   └── tts.js                # TTS utility functions
└── styles/
    └── tts.css               # TTS-specific styles and animations
```

## Usage Flow

### 1. Student Login Flow
```javascript
// When a visually impaired student logs in:
1. StudentAuth component detects student type
2. If type === 'visually_impaired', shows TTS welcome popup
3. User clicks to enable or skip TTS
4. Dashboard loads with TTS enabled/disabled
```

### 2. Dashboard Integration
```javascript
// In Dashboard component:
- TTS context provides reading functions
- Auto-reads page content on load
- Announces navigation changes
- Provides feedback for user actions
```

### 3. Manual TTS Control
```javascript
// Using TTS in components:
import { useTTSContext } from '../contexts/TTSContext';

function MyComponent() {
  const { speak, readPageContent, announceSuccess } = useTTSContext();
  
  // Read specific text
  speak("Hello, this is a test");
  
  // Read entire page
  readPageContent();
  
  // Announce success
  announceSuccess("File uploaded successfully");
}
```

## API Reference

### useTTS Hook
```javascript
const {
  // State
  isSpeaking,      // Boolean: Currently speaking
  isPaused,        // Boolean: Speech is paused
  isSupported,     // Boolean: Browser supports TTS
  voices,          // Array: Available voices
  selectedVoice,   // Object: Current voice
  rate,            // Number: Speech rate (0.1-10)
  pitch,           // Number: Speech pitch (0-2)
  volume,          // Number: Speech volume (0-1)
  
  // Actions
  speak,           // Function: Speak text
  queueSpeak,      // Function: Add to speech queue
  speakElement,    // Function: Speak element content
  pause,           // Function: Pause speech
  resume,          // Function: Resume speech
  stop,            // Function: Stop all speech
  updateSettings,  // Function: Update TTS settings
} = useTTS();
```

### TTSContext Provider
```javascript
<TTSProvider 
  enabled={true}        // Enable TTS
  autoStart={false}     // Auto-read on mount
>
  {children}
</TTSProvider>
```

### TTS Utility Functions
```javascript
import { 
  cleanTextForTTS,           // Clean text for better speech
  extractImportantText,      // Extract key text from element
  getReadingTime,           // Estimate reading time
  createReadingQueue,       // Create reading queue from sections
  formatFormFieldForTTS,    // Format form fields for speech
  getNavigationAnnouncement, // Get navigation announcement
  getTTSKeyboardInstructions // Get keyboard instructions
} from '../utils/tts';
```

## Browser Compatibility

The TTS implementation uses the Web Speech API, which is supported in:
- Chrome 33+
- Edge 14+
- Firefox 49+
- Safari 7+
- Opera 21+

For browsers that don't support the Web Speech API, the system gracefully degrades without errors.

## Accessibility Best Practices

1. **ARIA Labels**: All interactive elements have proper ARIA labels
2. **Focus Management**: Keyboard navigation is fully supported
3. **Visual Indicators**: Speaking status is shown visually
4. **User Control**: Users can enable/disable TTS at any time
5. **Customization**: Speed, volume, and voice can be adjusted
6. **Non-Intrusive**: TTS doesn't interfere with screen readers

## Testing TTS Features

### Manual Testing Steps:
1. Navigate to the application
2. Select "Visually Impaired" as student type
3. Click "Continue to Dashboard"
4. TTS Welcome popup should appear
5. Click anywhere to enable TTS
6. Verify voice reads the welcome message
7. Test keyboard shortcuts (Alt+R, Alt+S, Alt+P)
8. Test TTS controller buttons
9. Adjust speed and volume settings
10. Navigate between pages to test announcements

### Automated Testing:
```javascript
// Example test for TTS hook
describe('useTTS', () => {
  it('should speak text when supported', () => {
    const { speak, isSupported } = useTTS();
    if (isSupported) {
      speak('Test message');
      expect(window.speechSynthesis.speaking).toBe(true);
    }
  });
});
```

## Troubleshooting

### Common Issues:

1. **TTS not working**
   - Check browser compatibility
   - Ensure browser has TTS voices installed
   - Check browser permissions for speech

2. **Voice not clear**
   - Adjust speech rate (slower for clarity)
   - Try different voices
   - Check system volume

3. **Keyboard shortcuts not working**
   - Ensure focus is on the page
   - Check for conflicting browser extensions
   - Verify Alt key combinations aren't reserved

## Future Enhancements

- [ ] Add support for multiple languages
- [ ] Implement voice commands for navigation
- [ ] Add reading progress indicator
- [ ] Support for mathematical expressions
- [ ] Integration with Google Cloud TTS for better voices
- [ ] Save user preferences locally
- [ ] Add reading history/bookmarks
- [ ] Support for PDF text extraction

## Contributing

When adding new TTS features:
1. Update the TTSContext with new functionality
2. Add keyboard shortcuts if applicable
3. Ensure ARIA labels are present
4. Test with actual TTS enabled
5. Update this documentation

## License

This TTS implementation is part of the Adaptive Learning Platform and follows the project's main license.
