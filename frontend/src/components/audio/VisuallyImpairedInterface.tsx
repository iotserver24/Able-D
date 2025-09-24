import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, MicOff, Play, Pause, Volume2, VolumeX, Eye, EyeOff, LogOut } from 'lucide-react';

interface Subject {
  subjectName: string;
}

interface Note {
  content: string;
  audioUrl?: string;
  tips?: string;
}

interface VisuallyImpairedInterfaceProps {
  subjects: Subject[];
  topics: { topic: string; school: string; class: string; subject: string }[];
  currentNote: Note | null;
  selectedSubject: string;
  selectedTopic: string;
  onSubjectSelect: (subject: string) => void;
  onTopicSelect: (topic: string) => void;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
  onStopAudio: () => void;
  onLogout: () => void;
  isPlaying: boolean;
}

const VisuallyImpairedInterface: React.FC<VisuallyImpairedInterfaceProps> = ({
  subjects,
  topics,
  currentNote,
  selectedSubject,
  selectedTopic,
  onSubjectSelect,
  onTopicSelect,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  onLogout,
  isPlaying
}) => {
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [selectedTopicForDialog, setSelectedTopicForDialog] = useState<{ topic: string; school: string; class: string; subject: string } | null>(null);
  const [audioPermission, setAudioPermission] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Text-to-Speech functionality
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  // Handle topic selection with audio feedback
  const handleTopicClick = (topic: { topic: string; school: string; class: string; subject: string }) => {
    stopSpeaking();
    speak(`Topic: ${topic.topic}. Tap once to open, double tap to select`);
    setSelectedTopicForDialog(topic);
    setShowTopicDialog(true);
  };

  // Handle double tap for topic selection
  const handleTopicDoubleClick = (topic: { topic: string; school: string; class: string; subject: string }) => {
    stopSpeaking();
    speak(`Loading topic: ${topic.topic}`);
    onTopicSelect(topic.topic);
    setShowTopicDialog(false);
  };

  // Handle audio button clicks with proper single/double click detection
  const handleAudioButtonClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300 && timeDiff > 0) { // Double click detected (within 300ms)
      setShowTopicDialog(false);
      stopSpeaking();
      speak("Dialog closed");
    } else { // Single click
      if (isPlaying) {
        onPauseAudio();
        speak("Audio paused. Double tap quickly to close.");
      } else {
        onPlayAudio();
        speak("Playing audio content. Double tap quickly to close.");
      }
    }
    
    setLastClickTime(currentTime);
  };

  // Handle mic button interaction
  const handleMicClick = () => {
    stopSpeaking();
    if (!audioPermission) {
      setShowPermissionDialog(true);
      speak("Audio permission required. Please confirm to enable audio features.");
    } else if (isPlaying) {
      onPauseAudio();
      speak("Audio paused");
    } else {
      onPlayAudio();
      speak("Playing audio");
    }
  };

  // Handle double tap on mic
  const handleMicDoubleClick = () => {
    stopSpeaking();
    onStopAudio();
    speak("Audio stopped. Showing other topics");
    // This would trigger showing other topics
  };

  // Handle permission confirmation
  const handlePermissionConfirm = () => {
    setAudioPermission(true);
    setShowPermissionDialog(false);
    speak("Audio permission granted. You can now use audio features.");
  };

  // Auto-speak when content changes
  useEffect(() => {
    if (currentNote) {
      setTimeout(() => {
        speak("Content loaded. Use mic button to play audio or navigate with touch.");
      }, 500);
    }
  }, [currentNote]);

  // Auto-speak when topics change
  useEffect(() => {
    if (topics.length > 0) {
      setTimeout(() => {
        speak(`${topics.length} topics available. Tap any topic to preview, double tap to load.`);
      }, 300);
    }
  }, [topics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400 p-4">
      {/* Header */}
      <div className="text-center mb-8 relative">
        {/* Logout Button */}
        <div className="absolute top-0 right-0">
          <Button
            onClick={() => {
              stopSpeaking();
              speak("Logging out. Goodbye!");
              setTimeout(() => onLogout(), 2000);
            }}
            className="w-24 h-24 bg-red-600 hover:bg-red-700 border-6 border-red-800 rounded-full shadow-2xl"
            aria-label="Logout"
          >
            <LogOut className="w-10 h-10 text-white" />
          </Button>
        </div>
        
        <h1 className="text-8xl font-black text-white mb-6 drop-shadow-2xl">
          🎵 AUDIO LEARNING
        </h1>
        <p className="text-4xl font-bold text-white drop-shadow-lg">
          Touch to Listen • Double Tap to Select
        </p>
      </div>

      {/* Main Controls */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Subject Selection */}
        <Card className="bg-white border-8 border-yellow-600 shadow-2xl">
          <CardContent className="p-12">
            <h2 className="text-6xl font-bold text-yellow-800 mb-8 text-center">
              📚 SUBJECTS
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {subjects.map((subject) => (
                <Button
                  key={subject.subjectName}
                  onClick={() => {
                    stopSpeaking();
                    speak(`Selected subject: ${subject.subjectName}. Loading topics...`);
                    onSubjectSelect(subject.subjectName);
                  }}
                  className={`h-32 text-3xl font-bold border-8 ${
                    selectedSubject === subject.subjectName
                      ? 'bg-yellow-400 text-black border-yellow-600 shadow-lg'
                      : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700'
                  }`}
                >
                  {subject.subjectName.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card className="bg-white border-8 border-green-600 shadow-2xl">
          <CardContent className="p-12">
            <h2 className="text-6xl font-bold text-green-800 mb-8 text-center">
              📖 TOPICS
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {topics.map((topic) => (
                <Button
                  key={topic.topic}
                  onClick={() => handleTopicClick(topic)}
                  onDoubleClick={() => handleTopicDoubleClick(topic)}
                  className="h-24 text-2xl font-bold bg-green-600 text-white border-8 border-green-800 hover:bg-green-700"
                >
                  {topic.topic.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Current Content Info */}
        {currentNote && (
          <Card className="bg-white border-8 border-orange-600 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-6xl font-bold text-orange-800 mb-8 text-center">
                📝 CURRENT CONTENT
              </h2>
              <p className="text-4xl font-bold text-orange-800 text-center mb-6">
                {selectedTopic.toUpperCase()}
              </p>
              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    stopSpeaking();
                    speak("Content ready for audio playback");
                  }}
                  className="h-20 text-2xl font-bold bg-orange-500 text-white border-8 border-orange-700 hover:bg-orange-600"
                >
                  🔊 READY TO PLAY
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Topic Dialog with Audio Controls */}
      <Dialog open={showTopicDialog} onOpenChange={(open) => {
        if (!open) {
          setShowTopicDialog(false);
          stopSpeaking();
          speak("Dialog closed");
        }
      }}>
        <DialogContent className="max-w-5xl bg-gradient-to-br from-blue-50 to-purple-50 border-8 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-6xl font-bold text-blue-800 text-center">
              📚 TOPIC: {selectedTopicForDialog?.topic?.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedTopicForDialog && (
            <div className="p-12 text-center space-y-8">
              <div className="bg-white border-8 border-green-600 rounded-2xl p-8">
                <h3 className="text-4xl font-bold text-green-800 mb-8">
                  🎵 AUDIO CONTROLS
                </h3>
                
                {/* Large Audio Control Button */}
                <div className="flex justify-center mb-8">
                  <Button
                    onClick={handleAudioButtonClick}
                    className={`w-48 h-48 border-8 rounded-full shadow-2xl ${
                      isPlaying 
                        ? 'bg-red-600 hover:bg-red-700 border-red-800' 
                        : 'bg-green-600 hover:bg-green-700 border-green-800'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-24 h-24 text-white" />
                    ) : (
                      <Play className="w-24 h-24 text-white" />
                    )}
                  </Button>
                </div>
                
                <p className={`text-3xl font-bold ${
                  isPlaying ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {isPlaying ? '🔊 AUDIO PLAYING' : '🎵 TAP TO PLAY AUDIO'}
                </p>
                
                <p className="text-2xl text-gray-700 mt-4">
                  Single tap: Play/Pause • Quick double tap: Close dialog
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-8">
                <Button
                  onClick={() => {
                    setShowTopicDialog(false);
                    speak("Dialog closed");
                  }}
                  className="w-40 h-20 text-2xl font-bold bg-gray-600 hover:bg-gray-700 border-4 border-gray-800"
                >
                  CLOSE
                </Button>
                <Button
                  onClick={() => handleTopicDoubleClick(selectedTopicForDialog)}
                  className="w-40 h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 border-4 border-blue-800"
                >
                  LOAD TOPIC
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-2xl bg-blue-100 border-8 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-6xl font-bold text-blue-800 text-center">
              🎤 AUDIO PERMISSION
            </DialogTitle>
          </DialogHeader>
          <div className="p-12 text-center space-y-8">
            <p className="text-4xl font-bold text-blue-800">
              Enable audio features for better learning experience?
            </p>
            <div className="space-y-6">
              <Button
                onClick={handlePermissionConfirm}
                className="w-full h-24 text-4xl font-bold bg-green-500 text-white border-8 border-green-700 hover:bg-green-600"
              >
                ✅ YES, ENABLE
              </Button>
              <Button
                onClick={() => {
                  setShowPermissionDialog(false);
                  speak("Audio features disabled");
                }}
                className="w-full h-20 text-3xl font-bold bg-red-500 text-white border-8 border-red-700 hover:bg-red-600"
              >
                ❌ NO, THANKS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentNote?.audioUrl}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
};

export default VisuallyImpairedInterface;
