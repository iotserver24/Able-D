import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTTS } from '@/contexts/TTSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStudentTypeByValue } from '@/constants/studentTypes';
import { BookOpen, Volume2, Settings, LogOut, FileText, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { isEnabled: ttsEnabled, readPageContent } = useTTS();
  
  const studentTypeConfig = user?.studentType ? getStudentTypeByValue(user.studentType) : null;
  const colorClass = studentTypeConfig?.primaryColor || 'primary';

  React.useEffect(() => {
    // Auto-read dashboard content for visually impaired students
    if (user?.studentType === 'visually_impaired' && ttsEnabled) {
      const timer = setTimeout(() => {
        readPageContent();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, ttsEnabled, readPageContent]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-xl text-muted-foreground">
              Ready to continue your personalized learning journey?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {ttsEnabled && (
              <Badge variant="outline" className="text-visually-impaired border-visually-impaired">
                <Volume2 className="w-3 h-3 mr-1" />
                TTS Active
              </Badge>
            )}
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Student Profile Card */}
        {studentTypeConfig && (
          <Card className={`mb-8 border-${colorClass}/20 bg-${colorClass}/5`}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-${colorClass}/10 rounded-full flex items-center justify-center text-3xl`}>
                  {studentTypeConfig.icon}
                </div>
                <div>
                  <CardTitle className="text-2xl">{studentTypeConfig.label}</CardTitle>
                  <CardDescription className="text-lg">
                    {studentTypeConfig.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {studentTypeConfig.features.map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className={`bg-${colorClass}/10 text-${colorClass} border-${colorClass}/20`}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {studentTypeConfig.longDescription}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                My Courses
              </CardTitle>
              <CardDescription>
                Access your personalized learning materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className={`w-full bg-${colorClass} hover:bg-${colorClass}-dark text-white`}>
                View Courses
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Study Notes
              </CardTitle>
              <CardDescription>
                Review your adaptive study materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Notes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-all duration-normal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Ask Questions
              </CardTitle>
              <CardDescription>
                Get AI-powered help with your studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Start Q&A
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 bg-${colorClass}/10 rounded-full flex items-center justify-center mr-4`}>
                  <BookOpen className={`w-5 h-5 text-${colorClass}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Welcome to Able-D!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your adaptive learning journey starts here. Explore courses tailored to your learning style.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Just now
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features Info */}
        {user?.studentType === 'visually_impaired' && (
          <Card className="mt-8 border-visually-impaired/20 bg-visually-impaired/5">
            <CardHeader>
              <CardTitle className="flex items-center text-visually-impaired">
                <Volume2 className="w-5 h-5 mr-2" />
                Accessibility Features Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Alt + R: Read page content</li>
                    <li>• Alt + S: Stop reading</li>
                    <li>• Alt + P: Pause/Resume</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Automatic text-to-speech</li>
                    <li>• Enhanced keyboard navigation</li>
                    <li>• Screen reader optimization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default StudentDashboard;