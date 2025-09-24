import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTTS } from '@/contexts/TTSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getStudentTypeByValue } from '@/constants/studentTypes';
import { BookOpen, Volume2, Settings, LogOut, FileText, MessageSquare, Mic, Loader2, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getSubjects, getTopics, getNotes, generateQnA, Subject } from '@/services/studentService';
import { toast } from '@/hooks/use-toast';
import AudioPlayer from '@/components/audio/AudioPlayer';
import WordHighlightable from '@/components/audio/WordHighlightable';
import EnhancedTextDisplay from '@/components/audio/EnhancedTextDisplay';
import VisuallyImpairedInterface from '@/components/audio/VisuallyImpairedInterface';

interface Topic {
  topic: string;
  school: string;
  class: string;
  subject: string;
}

interface Note {
  school: string;
  class: string;
  subject: string;
  topic: string;
  studentType?: string;
  content: string;
  audioUrl?: string;
  tips?: string;
  _id: string;
  updatedAt: string;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { isEnabled: ttsEnabled, speak } = useTTS();
  
  const studentTypeConfig = user?.studentType ? getStudentTypeByValue(user.studentType) : null;
  const colorClass = studentTypeConfig?.primaryColor || 'primary';

  // State management
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isLoadingQnA, setIsLoadingQnA] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Load subjects on component mount
  useEffect(() => {
    if (user?.token && user?.class) {
      loadSubjects();
    }
  }, [user]);

  // Load topics when subject is selected
  useEffect(() => {
    if (user?.token && user?.class && selectedSubject) {
      loadTopics();
    }
  }, [selectedSubject, user]);

  const loadSubjects = async () => {
    if (!user?.token || !user?.class) {
      console.log('Missing required user data for subjects:', {
        hasToken: !!user?.token,
        class: user?.class,
        user
      });
      return;
    }
    
    // Debug: Log the actual token being used
    console.log('Using token for subjects request:', {
      tokenLength: user.token.length,
      tokenStart: user.token.substring(0, 50) + '...',
      tokenEnd: '...' + user.token.substring(user.token.length - 20),
      fullToken: user.token // This will show the full token in console
    });
    
    setIsLoadingSubjects(true);
    try {
      console.log('Loading subjects with params:', {
        school: 'DemoSchool',
        class: user.class,
        hasToken: !!user.token
      });
      
      const response = await getSubjects(
        'DemoSchool',
        user.class,
        user.token
      );
      setSubjects(response.items || []);
      
      // Auto-select the first subject if available
      if (response.items && response.items.length > 0) {
        setSelectedSubject(response.items[0].subjectName);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Test local backend connection
  useEffect(() => {
    const testLocalBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/health');
        console.log('Local backend health check:', { 
          status: response.status, 
          ok: response.ok,
          data: await response.json()
        });
      } catch (error) {
        console.error('Local backend health check failed:', error);
      }
    };
    testLocalBackend();
  }, []);


  const loadTopics = async () => {
    if (!user?.token || !user?.class || !selectedSubject) {
      console.log('Missing required user data for topics:', {
        hasToken: !!user?.token,
        class: user?.class,
        selectedSubject,
        user
      });
      return;
    }
    
    setIsLoadingTopics(true);
    try {
      console.log('Loading topics with params:', {
        school: 'DemoSchool',
        class: user.class,
        subject: selectedSubject,
        hasToken: !!user.token
      });
      
      const response = await getTopics(
        'DemoSchool',
        user.class,
        selectedSubject,
        user.token
      );
      console.log('Topics response:', response);
      console.log('Topics items:', response.items);
      setTopics(response.items || []);
      
      // Clear selected topic and current note when switching subjects
      setSelectedTopic('');
      setCurrentNote(null);
      setAnswer('');
    } catch (error) {
      console.error('Error loading topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const loadNote = async (topic: string) => {
    if (!user?.token || !user?.class || !selectedSubject || !user?.studentType) return;
    
    console.log('Loading note with params:', {
      school: 'DemoSchool',
      class: user.class,
      subject: selectedSubject,
      topic: topic,
      studentType: user.studentType,
      hasToken: !!user.token
    });
    
    setIsLoadingNote(true);
    try {
      const response = await getNotes(
        'DemoSchool',
        user.class,
        selectedSubject,
        topic,
        user.studentType,
        user.token
      );
      setCurrentNote(response.note);
      
      // Auto-read content for visually impaired students
      if (user.studentType === 'visually_impaired' && ttsEnabled && response.note.content) {
        speak(response.note.content);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      toast({
        title: 'Error',
        description: 'Failed to load note content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNote(false);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedTopic('');
    setCurrentNote(null);
    setAnswer('');
  };

  const handleTopicSelect = (topic: string) => {
    console.log('Topic selected:', { topic, selectedSubject, userClass: user?.class });
    setSelectedTopic(topic);
    setCurrentNote(null);
    setAnswer('');
    setCurrentWordIndex(-1);
    setIsAudioPlaying(false);
    loadNote(topic);
  };

  const handleWordHighlight = (wordIndex: number, word: string) => {
    setCurrentWordIndex(wordIndex);
    console.log('Highlighting word:', { wordIndex, word });
  };

  const handlePlayStateChange = (isPlaying: boolean) => {
    setIsAudioPlaying(isPlaying);
    if (!isPlaying) {
      setCurrentWordIndex(-1);
    }
  };

  // Audio control functions for visually impaired students
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (currentNote?.audioUrl && audioRef.current) {
      audioRef.current.src = currentNote.audioUrl;
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch((error) => {
        console.error('Audio play failed:', error);
        toast({
          title: 'Audio Error',
          description: 'Unable to play audio. Please check your internet connection.',
          variant: 'destructive'
        });
      });
    } else {
      toast({
        title: 'No Audio',
        description: 'No audio available for this content.',
        variant: 'destructive'
      });
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setCurrentWordIndex(-1);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !user?.token || !user?.class || !selectedSubject || !selectedTopic || !user?.studentType) {
      toast({
        title: 'Error',
        description: 'Please enter a question and select a topic first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingQnA(true);
    try {
      const response = await generateQnA(
        'DemoSchool',
        user.class,
        selectedSubject,
        selectedTopic,
        user.studentType,
        question,
        user.token
      );
      setAnswer(response.answer);
      
      // Auto-read answer for visually impaired students
      if (user.studentType === 'visually_impaired' && ttsEnabled && response.answer) {
        speak(response.answer);
      }
    } catch (error) {
      console.error('Error generating Q&A:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingQnA(false);
    }
  };


  React.useEffect(() => {
    // Auto-read dashboard content for visually impaired students
    if (user?.studentType === 'visually_impaired' && ttsEnabled) {
      const timer = setTimeout(() => {
        speak(`Welcome to your dashboard, ${user.name}. You are logged in as a ${studentTypeConfig?.label || 'student'}.`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, ttsEnabled, speak, studentTypeConfig]);

  // Show visually impaired interface for visually impaired students
  if (user?.studentType === 'visually_impaired') {
    return (
      <>
        <VisuallyImpairedInterface
          subjects={subjects}
          topics={topics}
          currentNote={currentNote}
          selectedSubject={selectedSubject}
          selectedTopic={selectedTopic}
          onSubjectSelect={handleSubjectSelect}
          onTopicSelect={handleTopicSelect}
          onPlayAudio={handlePlayAudio}
          onPauseAudio={handlePauseAudio}
          onStopAudio={handleStopAudio}
          onLogout={logout}
          isPlaying={isAudioPlaying}
        />
        
        {/* Hidden audio element for visually impaired students */}
        <audio
          ref={audioRef}
          preload="metadata"
          className="hidden"
          onEnded={() => setIsAudioPlaying(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {studentTypeConfig?.description || 'Student Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className={`bg-${colorClass}-100 text-${colorClass}-800`}>
              {studentTypeConfig?.label || 'Student'}
            </Badge>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Subject Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Select Subject - Class {user?.class}
            </CardTitle>
            <CardDescription>
              Choose a subject to view available topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="ml-2">Loading subjects...</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No subjects available</p>
                <p className="text-sm">Contact your teacher to add content</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <Button
                    key={subject.subjectName}
                    variant={selectedSubject === subject.subjectName ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleSubjectSelect(subject.subjectName)}
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {subject.subjectName.charAt(0).toUpperCase() + subject.subjectName.slice(1)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Topics - {selectedSubject ? selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1) : 'Select Subject'}
              </CardTitle>
              <CardDescription>
                {selectedSubject ? 'Select a topic to view content' : 'Please select a subject first'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSubject ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Please select a subject first</p>
                  <p className="text-sm">Choose a subject above to view topics</p>
                </div>
              ) : isLoadingTopics ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading topics...</span>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No topics available</p>
                  <p className="text-sm">Contact your teacher to add content</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => {
                    console.log('Rendering topic button:', { topic, topicTopic: topic.topic });
                    return (
                      <Button
                        key={topic.topic}
                        variant={selectedTopic === topic.topic ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          console.log('Topic button clicked:', topic.topic);
                          handleTopicSelect(topic.topic);
                        }}
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        {topic.topic}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedTopic ? `${selectedTopic} Content` : 'Select a Topic'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSubject ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Please select a subject first</p>
                  <p className="text-sm">Choose a subject above to view topics and content</p>
                </div>
              ) : !selectedTopic ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Choose a topic to view content</p>
                </div>
              ) : isLoadingNote ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading content...</span>
                </div>
              ) : currentNote ? (
                <div className="space-y-4">
                  {/* Note Content - Different display based on student type */}
                  <div className="prose max-w-none">
                    {user?.studentType === 'hearing_impaired' ? (
                      <EnhancedTextDisplay
                        text={currentNote.content}
                        className="max-h-96 overflow-y-auto"
                      />
                    ) : (
                      <WordHighlightable
                        text={currentNote.content}
                        currentWordIndex={currentWordIndex}
                        isPlaying={isAudioPlaying}
                        className="max-h-96 overflow-y-auto"
                      />
                    )}
                  </div>

                  {/* Audio Player - Only show for non-hearing impaired students */}
                  {currentNote.audioUrl && user?.studentType !== 'hearing_impaired' && (
                    <AudioPlayer 
                      audioUrl={currentNote.audioUrl}
                      text={currentNote.content}
                      className="mt-4"
                      onWordHighlight={handleWordHighlight}
                      onPlayStateChange={handlePlayStateChange}
                    />
                  )}

                  {/* Special info for hearing impaired students */}
                  {user?.studentType === 'hearing_impaired' && currentNote.audioUrl && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mt-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="relative z-10 flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-green-800 mb-2">
                            🎨 Enhanced Visual Learning Experience
                          </h3>
                          <div className="text-green-700 leading-relaxed">
                            <p>
                              This content has been specially optimized for visual learning with beautiful formatting, 
                              clear structure, and enhanced readability. Audio content has been replaced with 
                              rich text formatting, gradients, and visual elements for better comprehension.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {currentNote.tips && (
                    <div className={`p-6 rounded-xl shadow-sm relative overflow-hidden ${
                      user?.studentType === 'hearing_impaired' 
                        ? 'bg-gradient-to-br from-yellow-50 via-amber-50/50 to-orange-50 border border-yellow-200' 
                        : 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 border border-blue-200'
                    }`}>
                      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 ${
                        user?.studentType === 'hearing_impaired' 
                          ? 'bg-gradient-to-br from-yellow-200/30 to-orange-200/30' 
                          : 'bg-gradient-to-br from-blue-200/30 to-indigo-200/30'
                      }`}></div>
                      <div className="relative z-10">
                        <h4 className={`text-xl font-bold mb-4 flex items-center ${
                          user?.studentType === 'hearing_impaired' 
                            ? 'text-yellow-800' 
                            : 'text-blue-800'
                        }`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold ${
                            user?.studentType === 'hearing_impaired' 
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}>
                            💡
                          </span>
                          {user?.studentType === 'hearing_impaired' ? 'Visual Learning Tips' : 'Learning Tips'}
                        </h4>
                        <div className={`${
                          user?.studentType === 'hearing_impaired' 
                            ? 'text-yellow-800' 
                            : 'text-blue-800'
                        }`}>
                          {user?.studentType === 'hearing_impaired' ? (
                            <EnhancedTextDisplay text={currentNote.tips} />
                          ) : (
                            <p className="text-base leading-relaxed">{currentNote.tips}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Q&A Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Ask a Question
                    </h3>
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Ask a question about this topic..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <Button
                        onClick={handleAskQuestion}
                        disabled={isLoadingQnA || !question.trim()}
                        className="w-full"
                      >
                        {isLoadingQnA ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Answer...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Ask Question
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Answer */}
                    {answer && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Answer</h4>
                        <div className="whitespace-pre-wrap text-green-800">
                          {answer}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Content not available for this topic</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Type Info */}
        {studentTypeConfig && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Your Learning Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{studentTypeConfig.label}</h4>
                  <p className="text-sm text-gray-600 mb-3">{studentTypeConfig.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {studentTypeConfig.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Available Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Adaptive content based on your needs</li>
                    <li>✓ Audio support for better learning</li>
                    <li>✓ Interactive Q&A system</li>
                    <li>✓ Personalized learning tips</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;