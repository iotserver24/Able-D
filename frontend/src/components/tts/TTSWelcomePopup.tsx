import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTTS } from '@/contexts/TTSContext';
import { Volume2, Keyboard, X } from 'lucide-react';

const TTSWelcomePopup = () => {
  const { showWelcomePopup, closeWelcomePopup, readShortcuts } = useTTS();

  if (!showWelcomePopup) return null;

  const shortcuts = [
    { key: 'Alt + R', description: 'Read page content' },
    { key: 'Alt + S', description: 'Stop reading' },
    { key: 'Alt + P', description: 'Pause/Resume' },
    { key: 'Alt + F', description: 'Read focused element' },
    { key: 'Alt + T', description: 'Toggle TTS' },
    { key: 'Alt + H', description: 'Hear shortcuts' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-strong">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeWelcomePopup}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-visually-impaired/10 rounded-full flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-visually-impaired" />
            </div>
            <div>
              <CardTitle className="text-xl">Text-to-Speech Activated</CardTitle>
              <CardDescription>Your accessibility assistant is ready</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            I've automatically enabled Text-to-Speech for you. Use these keyboard shortcuts to navigate:
          </div>
          
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{shortcut.description}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={() => {
                readShortcuts();
                closeWelcomePopup();
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Hear Shortcuts
            </Button>
            <Button
              onClick={closeWelcomePopup}
              className="flex-1 bg-visually-impaired hover:bg-visually-impaired-dark"
              size="sm"
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TTSWelcomePopup;