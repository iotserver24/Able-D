import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Able-D
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            An adaptive learning platform designed for students with special needs. 
            Choose your role to get started with personalized learning experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-strong hover:shadow-xl transition-all duration-normal hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-visually-impaired/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-visually-impaired" />
              </div>
              <CardTitle className="text-2xl">I'm a Student</CardTitle>
              <CardDescription className="text-base">
                Access personalized learning content adapted to your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-visually-impaired rounded-full mr-3"></div>
                  Adaptive content for different learning styles
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-hearing-impaired rounded-full mr-3"></div>
                  Text-to-Speech and accessibility features
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-speech-impaired rounded-full mr-3"></div>
                  Interactive learning with AI support
                </div>
              </div>
              <Button 
                onClick={() => navigate('/auth/student')}
                className="w-full bg-visually-impaired hover:bg-visually-impaired-dark text-white"
                size="lg"
              >
                Continue as Student
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-strong hover:shadow-xl transition-all duration-normal hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-hearing-impaired/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-hearing-impaired" />
              </div>
              <CardTitle className="text-2xl">I'm a Teacher</CardTitle>
              <CardDescription className="text-base">
                Upload and manage educational content for your students
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-hearing-impaired rounded-full mr-3"></div>
                  Upload documents and audio content
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-speech-impaired rounded-full mr-3"></div>
                  AI-powered content adaptation
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-slow-learner rounded-full mr-3"></div>
                  Manage students and track progress
                </div>
              </div>
              <Button 
                onClick={() => navigate('/auth/teacher')}
                className="w-full bg-hearing-impaired hover:bg-hearing-impaired-dark text-white"
                size="lg"
              >
                Continue as Teacher
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="text-white/70 text-sm">
            Powered by AI • Designed for Accessibility • Built with ❤️
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;