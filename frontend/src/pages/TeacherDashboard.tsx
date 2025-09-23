import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, BarChart3, LogOut, BookOpen } from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, Professor {user?.name}!</h1>
            <p className="text-xl text-muted-foreground">
              Manage your educational content and support students with special needs
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Upload className="w-8 h-8 text-hearing-impaired mr-3" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Content Uploads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-visually-impaired mr-3" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-speech-impaired mr-3" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-slow-learner mr-3" />
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">Accessibility</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-hearing-impaired" />
                Upload Content
              </CardTitle>
              <CardDescription>
                Upload documents or audio files for adaptive processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-hearing-impaired hover:bg-hearing-impaired-dark text-white">
                Start Upload
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Manage Content
              </CardTitle>
              <CardDescription>
                View and organize your uploaded educational materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Content
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Student Progress
              </CardTitle>
              <CardDescription>
                Monitor student engagement and learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started with Able-D</CardTitle>
            <CardDescription>
              Follow these steps to create inclusive learning experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">How It Works:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-hearing-impaired/10 rounded-full flex items-center justify-center text-xs font-bold text-hearing-impaired">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium">Upload Your Content</h5>
                      <p className="text-sm text-muted-foreground">
                        Upload PDF documents, PowerPoint presentations, or audio recordings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-hearing-impaired/10 rounded-full flex items-center justify-center text-xs font-bold text-hearing-impaired">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium">AI Processing</h5>
                      <p className="text-sm text-muted-foreground">
                        Our AI automatically adapts content for different learning needs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-hearing-impaired/10 rounded-full flex items-center justify-center text-xs font-bold text-hearing-impaired">
                      3
                    </div>
                    <div>
                      <h5 className="font-medium">Students Access</h5>
                      <p className="text-sm text-muted-foreground">
                        Students receive personalized content based on their accessibility needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Supported Student Types:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-visually-impaired/5 rounded-lg">
                    <div className="text-xl">👁️</div>
                    <div>
                      <div className="font-medium text-visually-impaired">Visually Impaired</div>
                      <div className="text-xs text-muted-foreground">TTS, audio content, screen reader support</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-hearing-impaired/5 rounded-lg">
                    <div className="text-xl">👂</div>
                    <div>
                      <div className="font-medium text-hearing-impaired">Hearing Impaired</div>
                      <div className="text-xs text-muted-foreground">Visual cues, structured text, captions</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-speech-impaired/5 rounded-lg">
                    <div className="text-xl">💬</div>
                    <div>
                      <div className="font-medium text-speech-impaired">Speech Impaired</div>
                      <div className="text-xs text-muted-foreground">Text-based interaction, written assessments</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slow-learner/5 rounded-lg">
                    <div className="text-xl">🧠</div>
                    <div>
                      <div className="font-medium text-slow-learner">Dyslexia Support</div>
                      <div className="text-xs text-muted-foreground">Simplified text, visual aids, paced learning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest uploads and content management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity yet.</p>
              <p className="text-sm">Start by uploading your first educational content!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default TeacherDashboard;