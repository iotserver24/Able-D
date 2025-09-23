import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STUDENT_TYPES, StudentTypeValue } from '@/constants/studentTypes';
import { Check } from 'lucide-react';

interface StudentTypeSelectorProps {
  selectedType: StudentTypeValue | null;
  onSelectType: (type: StudentTypeValue) => void;
  onContinue: () => void;
}

const StudentTypeSelector: React.FC<StudentTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Learning Profile</h2>
        <p className="text-muted-foreground text-lg">
          Select the profile that best matches your learning needs. This helps us customize your experience.
        </p>
      </div>

      <div className="grid gap-4">
        {Object.values(STUDENT_TYPES).map((type) => {
          const isSelected = selectedType === type.value;
          const colorClass = `${type.primaryColor}` as const;
          
          return (
            <Card 
              key={type.value}
              className={`cursor-pointer transition-all duration-normal hover:shadow-medium ${
                isSelected 
                  ? `border-${colorClass} bg-${colorClass}/5 shadow-medium` 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectType(type.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-${colorClass}/10 rounded-full flex items-center justify-center text-2xl`}>
                      {type.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{type.label}</CardTitle>
                      <CardDescription className="text-base">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <div className={`w-8 h-8 bg-${colorClass} rounded-full flex items-center justify-center`}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {type.longDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 bg-${colorClass}/10 text-${colorClass} text-xs rounded-full font-medium`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Button 
          onClick={onContinue}
          disabled={!selectedType}
          size="lg"
          className={selectedType ? `bg-${STUDENT_TYPES[selectedType.toUpperCase() as keyof typeof STUDENT_TYPES]?.primaryColor} hover:bg-${STUDENT_TYPES[selectedType.toUpperCase() as keyof typeof STUDENT_TYPES]?.primaryColor}-dark` : ''}
        >
          Continue with Selected Profile
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          You can change this later in your settings
        </p>
      </div>
    </div>
  );
};

export default StudentTypeSelector;