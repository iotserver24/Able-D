import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Volume2, LogOut, FileText, MessageSquare, Loader2, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface Subject {
  subjectName: string;
}

interface Topic {
  topic: string;
  school: string;
  class: string;
  subject: string;
}

interface Note {
  content: string;
  audioUrl?: string;
  tips?: string;
  _id: string;
  updatedAt: string;
}

interface DyslexiaSupportInterfaceProps {
  subjects: Subject[];
  topics: Topic[];
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
  user: {
    name: string;
    class?: string;
    studentType?: string;
  };
  onAskQuestion: (question: string) => Promise<void>;
  isLoadingQnA: boolean;
  answer: string;
}

// Component to render text with capsulated words for dyslexia support
const DyslexiaTextDisplay: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  // Split text into words and render each as a capsule
  const words = text.split(/(\s+|[.,!?;:])/);
  
  return (
    <div className={`dyslexia-font ${className}`}>
      {words.map((word, index) => {
        // Skip whitespace and punctuation
        if (/^\s+$/.test(word) || /^[.,!?;:]$/.test(word)) {
          return <span key={index}>{word}</span>;
        }
        
        return (
          <span key={index} className="dyslexia-word-capsule">
            {word}
          </span>
        );
      })}
    </div>
  );
};

const DyslexiaSupportInterface: React.FC<DyslexiaSupportInterfaceProps> = ({
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
  isPlaying,
  user,
  onAskQuestion,
  isLoadingQnA,
  answer
}) => {
  const [question, setQuestion] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Text-to-Speech functionality
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7; // Slower for dyslexia support
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question first.',
        variant: 'destructive',
      });
      return;
    }

    await onAskQuestion(question);
    setQuestion('');
  };

  const handleTopicClick = (topic: string) => {
    stopSpeaking();
    speak(`Loading topic: ${topic}`);
    onTopicSelect(topic);
  };

  const handleSubjectClick = (subject: string) => {
    stopSpeaking();
    speak(`Selected subject: ${subject}. Loading topics...`);
    onSubjectSelect(subject);
  };

  return (
    <div className="min-h-screen dyslexia-minimal p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold dyslexia-font-bold mb-2">
              <span className="dyslexia-word-capsule">Welcome</span>, <span className="dyslexia-word-capsule">{user?.name}</span>!
            </h1>
            <p className="text-xl dyslexia-font">
              <span className="dyslexia-word-capsule">Dyslexia</span> <span className="dyslexia-word-capsule">Learning</span> <span className="dyslexia-word-capsule">Support</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="dyslexia-font-bold text-lg px-4 py-2">
              <span className="dyslexia-word-capsule">Slow</span> <span className="dyslexia-word-capsule">Learner</span>
            </Badge>
            <Button variant="outline" onClick={onLogout} className="dyslexia-font-bold">
              <LogOut className="w-5 h-5 mr-2" />
              <span className="dyslexia-word-capsule">Logout</span>
            </Button>
          </div>
        </div>

        {/* Subject Selection */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dyslexia-font-bold text-2xl">
              <BookOpen className="w-6 h-6" />
              <span className="dyslexia-word-capsule">Select</span> <span className="dyslexia-word-capsule">Subject</span> - <span className="dyslexia-word-capsule">Class</span> {user?.class || 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Button
                  key={subject.subjectName}
                  variant={selectedSubject === subject.subjectName ? "default" : "outline"}
                  className="w-full justify-start h-16 text-lg dyslexia-font-bold"
                  onClick={() => handleSubjectClick(subject.subjectName)}
                >
                  <ChevronRight className="w-5 h-5 mr-2" />
                  <span className="dyslexia-word-capsule">{subject.subjectName}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Panel */}
          <Card className="lg:col-span-1 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dyslexia-font-bold text-xl">
                <BookOpen className="w-5 h-5" />
                <span className="dyslexia-word-capsule">Topics</span> - <span className="dyslexia-word-capsule">{selectedSubject || 'Select Subject'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSubject ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="dyslexia-font">
                    <span className="dyslexia-word-capsule">Please</span> <span className="dyslexia-word-capsule">select</span> <span className="dyslexia-word-capsule">subject</span> <span className="dyslexia-word-capsule">first</span>
                  </p>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="dyslexia-font">
                    <span className="dyslexia-word-capsule">No</span> <span className="dyslexia-word-capsule">topics</span> <span className="dyslexia-word-capsule">available</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <Button
                      key={topic.topic}
                      variant={selectedTopic === topic.topic ? "default" : "ghost"}
                      className="w-full justify-start h-14 text-base dyslexia-font-bold"
                      onClick={() => handleTopicClick(topic.topic)}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      <span className="dyslexia-word-capsule">{topic.topic}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Panel */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dyslexia-font-bold text-xl">
                <FileText className="w-5 h-5" />
                <span className="dyslexia-word-capsule">{selectedTopic || 'Select Topic'}</span> <span className="dyslexia-word-capsule">Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSubject ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg dyslexia-font">
                    <span className="dyslexia-word-capsule">Please</span> <span className="dyslexia-word-capsule">select</span> <span className="dyslexia-word-capsule">subject</span> <span className="dyslexia-word-capsule">first</span>
                  </p>
                </div>
              ) : !selectedTopic ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg dyslexia-font">
                    <span className="dyslexia-word-capsule">Choose</span> <span className="dyslexia-word-capsule">topic</span> <span className="dyslexia-word-capsule">to</span> <span className="dyslexia-word-capsule">view</span> <span className="dyslexia-word-capsule">content</span>
                  </p>
                </div>
              ) : !currentNote ? (
                <div className="text-center py-8">
                  <p className="dyslexia-font">
                    <span className="dyslexia-word-capsule">Content</span> <span className="dyslexia-word-capsule">not</span> <span className="dyslexia-word-capsule">available</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Note Content with Dyslexia Support */}
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-6 rounded-lg border-2">
                      <h3 className="text-xl font-bold dyslexia-font-bold mb-4">
                        <span className="dyslexia-word-capsule">Learning</span> <span className="dyslexia-word-capsule">Content</span>
                      </h3>
                      <DyslexiaTextDisplay 
                        text={currentNote.content} 
                        className="text-lg leading-relaxed max-h-96 overflow-y-auto"
                      />
                    </div>
                  </div>

                  {/* Audio Player */}
                  {currentNote.audioUrl && (
                    <div className="bg-blue-50 p-6 rounded-lg border-2">
                      <h3 className="text-xl font-bold dyslexia-font-bold mb-4">
                        <Volume2 className="w-5 h-5 inline mr-2" />
                        <span className="dyslexia-word-capsule">Audio</span> <span className="dyslexia-word-capsule">Support</span>
                      </h3>
                      <div className="flex gap-3">
                        <Button
                          onClick={isPlaying ? onPauseAudio : onPlayAudio}
                          className="dyslexia-font-bold"
                          variant={isPlaying ? "secondary" : "default"}
                        >
                          {isPlaying ? (
                            <>
                              <Volume2 className="w-4 h-4 mr-2" />
                              <span className="dyslexia-word-capsule">Pause</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 mr-2" />
                              <span className="dyslexia-word-capsule">Play</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={onStopAudio}
                          variant="outline"
                          className="dyslexia-font-bold"
                        >
                          <span className="dyslexia-word-capsule">Stop</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {currentNote.tips && (
                    <div className="bg-yellow-50 p-6 rounded-lg border-2">
                      <h3 className="text-xl font-bold dyslexia-font-bold mb-4">
                        💡 <span className="dyslexia-word-capsule">Learning</span> <span className="dyslexia-word-capsule">Tips</span>
                      </h3>
                      <DyslexiaTextDisplay 
                        text={currentNote.tips} 
                        className="text-base leading-relaxed"
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Q&A Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold dyslexia-font-bold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      <span className="dyslexia-word-capsule">Ask</span> <span className="dyslexia-word-capsule">Question</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Ask a question about this topic..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="min-h-[100px] dyslexia-font text-lg"
                      />
                      
                      <Button
                        onClick={handleAskQuestion}
                        disabled={isLoadingQnA || !question.trim()}
                        className="w-full h-12 text-lg dyslexia-font-bold"
                      >
                        {isLoadingQnA ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            <span className="dyslexia-word-capsule">Generating</span> <span className="dyslexia-word-capsule">Answer</span>...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-5 h-5 mr-2" />
                            <span className="dyslexia-word-capsule">Ask</span> <span className="dyslexia-word-capsule">Question</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Answer */}
                    {answer && (
                      <div className="bg-green-50 p-6 rounded-lg border-2">
                        <h4 className="font-bold dyslexia-font-bold text-lg mb-4">
                          <span className="dyslexia-word-capsule">Answer</span>
                        </h4>
                        <DyslexiaTextDisplay 
                          text={answer} 
                          className="text-base leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          preload="metadata"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default DyslexiaSupportInterface;
