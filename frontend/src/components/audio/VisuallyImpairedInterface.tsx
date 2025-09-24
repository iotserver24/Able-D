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
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-4">
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
            className="w-20 h-20 bg-red-500 hover:bg-red-600 border-4 border-red-700 rounded-full shadow-lg"
            aria-label="Logout"
          >
            <LogOut className="w-8 h-8 text-white" />
          </Button>
        </div>
        
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
          🎵 AUDIO LEARNING
        </h1>
        <p className="text-3xl font-bold text-white drop-shadow">
          Touch to Listen • Double Tap to Select
        </p>
      </div>

      {/* Main Controls */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Subject Selection */}
        <Card className="bg-white border-4 border-yellow-600 shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-4xl font-bold text-yellow-800 mb-6 text-center">
              📚 SUBJECTS
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <Button
                  key={subject.subjectName}
                  onClick={() => {
                    stopSpeaking();
                    speak(`Selected subject: ${subject.subjectName}. Loading topics...`);
                    onSubjectSelect(subject.subjectName);
                  }}
                  className={`h-24 text-2xl font-bold border-4 ${
                    selectedSubject === subject.subjectName
                      ? 'bg-yellow-500 text-black border-yellow-700'
                      : 'bg-blue-500 text-white border-blue-700 hover:bg-blue-600'
                  }`}
                >
                  {subject.subjectName.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card className="bg-white border-4 border-green-600 shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-4xl font-bold text-green-800 mb-6 text-center">
              📖 TOPICS
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {topics.map((topic) => (
                <Button
                  key={topic.topic}
                  onClick={() => handleTopicClick(topic)}
                  onDoubleClick={() => handleTopicDoubleClick(topic)}
                  className="h-20 text-2xl font-bold bg-green-500 text-white border-4 border-green-700 hover:bg-green-600"
                >
                  {topic.topic.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audio Controls */}
        <Card className={`bg-white border-4 shadow-2xl ${isPlaying ? 'border-green-600 bg-green-50' : 'border-purple-600'}`}>
          <CardContent className="p-8 text-center">
            <h2 className={`text-4xl font-bold mb-6 ${isPlaying ? 'text-green-800' : 'text-purple-800'}`}>
              {isPlaying ? '🔊 AUDIO PLAYING' : '🎤 AUDIO CONTROLS'}
            </h2>
            <div className="flex justify-center space-x-8">
              <Button
                onClick={handleMicClick}
                onDoubleClick={handleMicDoubleClick}
                className={`w-32 h-32 border-4 rounded-full ${isPlaying ? 'bg-green-500 hover:bg-green-600 border-green-700' : 'bg-purple-500 hover:bg-purple-600 border-purple-700'}`}
              >
                {isPlaying ? (
                  <Pause className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </Button>
            </div>
            <p className={`text-2xl font-bold mt-4 ${isPlaying ? 'text-green-800' : 'text-purple-800'}`}>
              {isPlaying ? 'TAP: Pause • DOUBLE TAP: Stop & Show Topics' : 'TAP: Play/Pause • DOUBLE TAP: Stop & Show Topics'}
            </p>
            {currentNote?.audioUrl && (
              <p className="text-lg font-medium text-gray-600 mt-2">
                Audio Available: {currentNote.audioUrl ? '✅' : '❌'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Content Info */}
        {currentNote && (
          <Card className="bg-white border-4 border-orange-600 shadow-2xl">
            <CardContent className="p-8">
              <h2 className="text-4xl font-bold text-orange-800 mb-4 text-center">
                📝 CURRENT CONTENT
              </h2>
              <p className="text-3xl font-bold text-orange-800 text-center">
                {selectedTopic.toUpperCase()}
              </p>
              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    stopSpeaking();
                    speak("Content ready for audio playback");
                  }}
                  className="h-16 text-xl font-bold bg-orange-500 text-white border-4 border-orange-700 hover:bg-orange-600"
                >
                  🔊 READY TO PLAY
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Topic Dialog */}
      <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
        <DialogContent className="max-w-2xl bg-yellow-100 border-4 border-yellow-600">
          <DialogHeader>
            <DialogTitle className="text-4xl font-bold text-yellow-800 text-center">
              📖 TOPIC PREVIEW
            </DialogTitle>
          </DialogHeader>
          {selectedTopicForDialog && (
            <div className="p-8 text-center space-y-6">
              <h3 className="text-5xl font-bold text-yellow-800">
                {selectedTopicForDialog.topic.toUpperCase()}
              </h3>
              <div className="space-y-4">
                <Button
                  onClick={() => handleTopicDoubleClick(selectedTopicForDialog)}
                  className="w-full h-20 text-3xl font-bold bg-green-500 text-white border-4 border-green-700 hover:bg-green-600"
                >
                  🎵 LOAD & PLAY
                </Button>
                <Button
                  onClick={() => {
                    setShowTopicDialog(false);
                    stopSpeaking();
                  }}
                  className="w-full h-16 text-2xl font-bold bg-red-500 text-white border-4 border-red-700 hover:bg-red-600"
                >
                  ❌ CANCEL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-xl bg-blue-100 border-4 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-4xl font-bold text-blue-800 text-center">
              🎤 AUDIO PERMISSION
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center space-y-6">
            <p className="text-3xl font-bold text-blue-800">
              Enable audio features for better learning experience?
            </p>
            <div className="space-y-4">
              <Button
                onClick={handlePermissionConfirm}
                className="w-full h-20 text-3xl font-bold bg-green-500 text-white border-4 border-green-700 hover:bg-green-600"
              >
                ✅ YES, ENABLE
              </Button>
              <Button
                onClick={() => {
                  setShowPermissionDialog(false);
                  speak("Audio features disabled");
                }}
                className="w-full h-16 text-2xl font-bold bg-red-500 text-white border-4 border-red-700 hover:bg-red-600"
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
