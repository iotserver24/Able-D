import { useState } from 'react';
import { AudioControls } from './AudioControls';

export function LearningContent({ content, studentType }) {
  const [fontSize, setFontSize] = useState('medium');

  const fontSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {studentType === 'visually_impaired' && content.audioUrl && (
        <AudioControls
          audioUrl={content.audioUrl}
          label="Content Audio"
        />
      )}

      {/* Accessibility Controls */}
      <div className="mb-4 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">
          Text Size:
        </label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="border rounded p-1"
        >
          {Object.keys(fontSizes).map(size => (
            <option key={size} value={size}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className={`${fontSizes[fontSize]} space-y-4`}>
        {content.sections?.map((section, index) => (
          <div key={index}>
            {section.title && (
              <h3 className="font-bold mb-2">{section.title}</h3>
            )}
            <p className="text-gray-700">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}