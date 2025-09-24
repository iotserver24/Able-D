import React, { useEffect, useRef } from 'react';

interface WordHighlightableProps {
  text: string;
  currentWordIndex: number;
  isPlaying: boolean;
  className?: string;
}

const WordHighlightable: React.FC<WordHighlightableProps> = ({
  text,
  currentWordIndex,
  isPlaying,
  className = ""
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  // Split text into words for highlighting
  const words = text.split(/(\s+)/);

  useEffect(() => {
    // Scroll to current word when it changes
    if (isPlaying && currentWordIndex >= 0 && currentWordIndex < words.length) {
      const wordElement = textRef.current?.querySelector(`[data-word-index="${currentWordIndex}"]`);
      if (wordElement) {
        wordElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentWordIndex, isPlaying, words.length]);

  return (
    <div 
      ref={textRef}
      className={`prose max-w-none whitespace-pre-wrap bg-gray-50 p-4 rounded-lg ${className}`}
    >
      {words.map((word, index) => (
        <span
          key={index}
          data-word-index={index}
          className={`transition-colors duration-200 ${
            index === currentWordIndex && isPlaying
              ? 'bg-yellow-200 text-yellow-900 font-medium'
              : 'text-gray-800'
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default WordHighlightable;
