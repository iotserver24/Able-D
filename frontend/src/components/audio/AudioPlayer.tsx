import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  text?: string;
  className?: string;
  onWordHighlight?: (wordIndex: number, word: string) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  text, 
  className = "",
  onWordHighlight,
  onPlayStateChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Split text into words for highlighting
  const words = text ? text.split(/(\s+)/) : [];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      onPlayStateChange?.(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!text || !isPlaying) return;

    // Simple word tracking based on time progress
    // This is a basic implementation - for more accurate tracking,
    // you'd need audio analysis or pre-processed timing data
    const progress = currentTime / duration;
    const wordIndex = Math.floor(progress * words.length);
    
    if (wordIndex !== currentWordIndex && wordIndex < words.length) {
      setCurrentWordIndex(wordIndex);
      
      // Call the callback to highlight word in external text
      if (onWordHighlight && words[wordIndex]) {
        onWordHighlight(wordIndex, words[wordIndex]);
      }
      
      // Scroll to current word (only if we have our own text display)
      const wordElement = textRef.current?.querySelector(`[data-word-index="${wordIndex}"]`);
      if (wordElement) {
        wordElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentTime, duration, words.length, isPlaying, currentWordIndex, text]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      audio.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Remove the separate text display - we'll track words in external text

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio Controls */}
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          className="flex items-center space-x-2"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 w-10">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              className="flex-1"
              max={100}
              step={0.1}
            />
            <span className="text-xs text-gray-500 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="p-2"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      {/* Progress Indicator */}
      {isPlaying && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Playing:</span>
          <span className="font-medium">
            {currentWordIndex >= 0 && currentWordIndex < words.length 
              ? words[currentWordIndex] 
              : '...'
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
