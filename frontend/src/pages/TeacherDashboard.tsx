import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Users, BarChart3, LogOut, BookOpen, Mic, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadContent } from '@/services/teacherService';
import { toast } from '@/hooks/use-toast';

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
}

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  
  // Form state
  const [uploadType, setUploadType] = useState<'file' | 'audio' | 'text'>('file');
  const [classValue, setClassValue] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [directText, setDirectText] = useState('');
  const [language, setLanguage] = useState('en-US');
  
  // File refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Upload state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    message: ''
  });

  // Available subjects and classes
  // All classes have the same 3 subjects
  const subjects = ['english', 'science', 'social'];
  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const handleFileSelect = (type: 'file' | 'audio') => {
    if (type === 'file') {
      fileInputRef.current?.click();
    } else {
      audioInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!user?.token) {
      toast({
        title: 'Error',
        description: 'Authentication required. Please login again.',
        variant: 'destructive',
      });
      return;
    }

    // Validation
    if (!classValue || !subject || !topic) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Class, Subject, Topic).',
        variant: 'destructive',
      });
      return;
    }

    if (uploadType === 'file' && !fileInputRef.current?.files?.[0]) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (uploadType === 'audio' && !audioInputRef.current?.files?.[0]) {
      toast({
        title: 'Validation Error',
        description: 'Please select an audio file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (uploadType === 'text' && !directText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter text content.',
        variant: 'destructive',
      });
      return;
    }

    setUploadProgress({
      isUploading: true,
      progress: 0,
      status: 'uploading',
      message: 'Preparing upload...'
    });

    try {
      const selectedFile = uploadType === 'file' 
        ? fileInputRef.current?.files?.[0]
        : audioInputRef.current?.files?.[0];

      const response = await uploadContent(
        'DemoSchool', // Hardcoded as per backend
        classValue,
        subject,
        topic,
        {
          type: uploadType,
          file: selectedFile,
          text: uploadType === 'text' ? directText : undefined,
          language: uploadType === 'audio' ? language : undefined,
        },
        user.token
      );

      setUploadProgress({
        isUploading: false,
        progress: 100,
        status: 'success',
        message: 'Content uploaded successfully!'
      });

      toast({
        title: 'Success',
        description: 'Educational content uploaded and processed successfully.',
      });

      console.log('Upload response:', response);

      // Reset form
      setClassValue('');
      setSubject('');
      setTopic('');
      setDirectText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';

    } catch (error:any) {
      console.error('Upload error:', error);
      setUploadProgress({
        isUploading: false,
        progress: 0,
        status: 'error',
        message: error.message || 'Upload failed. Please try again.'
      });

      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetUploadProgress = () => {
    setUploadProgress({
      isUploading: false,
      progress: 0,
      status: 'idle',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}! Upload and manage educational content.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Teacher
            </Badge>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Educational Content
              </CardTitle>
              <CardDescription>
                Upload documents, audio files, or enter text directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Type Selection */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={uploadType} onValueChange={(value: 'file' | 'audio' | 'text') => setUploadType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Document (PDF, DOC, etc.)</SelectItem>
                    <SelectItem value="audio">Audio Recording</SelectItem>
                    <SelectItem value="text">Direct Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={classValue} onValueChange={setClassValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="Enter topic name (e.g., Photosynthesis, World War II)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* File Upload Section */}
              {uploadType === 'file' && (
                <div className="space-y-2">
                  <Label>Document File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload PDF, DOC, DOCX, or other document formats
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFileSelect('file')}
                    >
                      Select Document
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      aria-label="Select document file"
                      onChange={() => setUploadProgress(prev => ({ ...prev, status: 'idle' }))}
                    />
                  </div>
                </div>
              )}

              {/* Audio Upload Section */}
              {uploadType === 'audio' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Audio File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload audio recordings (MP3, WAV, M4A, etc.)
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleFileSelect('audio')}
                      >
                        Select Audio File
                      </Button>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        aria-label="Select audio file"
                        onChange={() => setUploadProgress(prev => ({ ...prev, status: 'idle' }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Audio Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Text Input Section */}
              {uploadType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="text">Content Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter your educational content here..."
                    value={directText}
                    onChange={(e) => setDirectText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress.status !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {uploadProgress.status === 'uploading' && 'Uploading...'}
                      {uploadProgress.status === 'success' && 'Upload Complete'}
                      {uploadProgress.status === 'error' && 'Upload Failed'}
                    </span>
                    {uploadProgress.status === 'uploading' && (
                      <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
                    )}
                  </div>
                  
                  {uploadProgress.status === 'uploading' && (
                    <Progress value={uploadProgress.progress} className="w-full" />
                  )}
                  
                  {uploadProgress.status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{uploadProgress.message}</span>
                    </div>
                  )}
                  
                  {uploadProgress.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{uploadProgress.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploadProgress.isUploading}
                className="w-full"
                size="lg"
              >
                {uploadProgress.isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Content
                  </>
                )}
              </Button>

              {uploadProgress.status !== 'idle' && (
                <Button
                  variant="outline"
                  onClick={resetUploadProgress}
                  className="w-full"
                >
                  Reset
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Upload Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What happens after upload?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Content is automatically processed</li>
                  <li>• AI creates dyslexia-friendly variants</li>
                  <li>• Audio versions are generated</li>
                  <li>• Content becomes available to students</li>
                </ul>
              </div>

                <div>
                <h4 className="font-semibold mb-2">Supported Formats</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Documents:</strong> PDF, DOC, DOCX, TXT</p>
                  <p><strong>Audio:</strong> MP3, WAV, M4A, AAC</p>
                  <p><strong>Text:</strong> Direct input with formatting</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Student Access</h4>
                <p className="text-sm text-gray-600">
                  Students can access content based on their class, subject, and learning needs. 
                  Content is automatically adapted for different student types.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">School</p>
                  <p className="text-2xl font-bold text-gray-900">DemoSchool</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;