import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useTTS } from '@/contexts/TTSContext';
import { Volume2, Play, Pause, Square, Settings, Minimize2, Maximize2 } from 'lucide-react';

const TTSController = () => {
  const {
    isEnabled,
    isReading,
    isPaused,
    currentText,
    speed,
    volume,
    setSpeed,
    setVolume,
    pause,
    resume,
    stop,
    readPageContent,
  } = useTTS();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!isEnabled) return null;

  const handlePlayPause = () => {
    if (isReading) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      readPageContent();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 rounded-full bg-visually-impaired hover:bg-visually-impaired-dark text-white shadow-strong"
          aria-label="Open TTS Controls"
        >
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-strong border-visually-impaired/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-visually-impaired" />
              <span className="font-medium text-sm">Text-to-Speech</span>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsMinimized(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {currentText && (
            <div className="mb-3 p-2 bg-visually-impaired/5 rounded text-xs text-muted-foreground line-clamp-2">
              {currentText}
            </div>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={handlePlayPause}
              className="bg-visually-impaired hover:bg-visually-impaired-dark text-white"
              size="sm"
            >
              {isReading && !isPaused ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={stop}
              variant="outline"
              size="sm"
              disabled={!isReading}
            >
              <Square className="w-4 h-4" />
            </Button>
            <div className="text-xs text-muted-foreground">
              {isReading ? (isPaused ? 'Paused' : 'Speaking') : 'Ready'}
            </div>
          </div>

          {showSettings && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Speed</label>
                  <span className="text-xs text-muted-foreground">{speed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Volume</label>
                  <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
            Press Alt+H to hear keyboard shortcuts
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TTSController;