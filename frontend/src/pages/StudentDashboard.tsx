import React, { useState, useEffect } from 'react';
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
import { getTopics, getNotes, generateQnA } from '@/services/studentService';
import { toast } from '@/hooks/use-toast';

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isLoadingQnA, setIsLoadingQnA] = useState(false);

  // Load topics on component mount
  useEffect(() => {
    if (user?.token && user?.class && user?.subject) {
      loadTopics();
    }
  }, [user]);

  const loadTopics = async () => {
    if (!user?.token || !user?.class || !user?.subject) return;
    
    setIsLoadingTopics(true);
    try {
      const response = await getTopics(
        'DemoSchool',
        user.class,
        user.subject,
        user.token
      );
      setTopics(response.items || []);
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
    if (!user?.token || !user?.class || !user?.subject || !user?.studentType) return;
    
    setIsLoadingNote(true);
    try {
      const response = await getNotes(
        'DemoSchool',
        user.class,
        user.subject,
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

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentNote(null);
    setAnswer('');
    loadNote(topic);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !user?.token || !user?.class || !user?.subject || !selectedTopic || !user?.studentType) {
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
        user.subject,
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

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio. Please try again.',
        variant: 'destructive',
      });
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Topics - {user?.subject}
              </CardTitle>
              <CardDescription>
                Select a topic to view content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTopics ? (
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
                  {topics.map((topic) => (
                    <Button
                      key={topic.topic}
                      variant={selectedTopic === topic.topic ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTopicSelect(topic.topic)}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      {topic.topic}
                    </Button>
                  ))}
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
              {!selectedTopic ? (
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
                  {/* Note Content */}
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {currentNote.content}
                    </div>
                  </div>

                  {/* Audio Player */}
                  {currentNote.audioUrl && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(currentNote.audioUrl!)}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Play Audio
                      </Button>
                      <span className="text-sm text-gray-500">Audio version available</span>
                    </div>
                  )}

                  {/* Tips */}
                  {currentNote.tips && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Learning Tips</h4>
                      <p className="text-blue-800 text-sm">{currentNote.tips}</p>
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