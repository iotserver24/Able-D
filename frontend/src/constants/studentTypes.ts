export const STUDENT_TYPES = {
  VISUALLY_IMPAIRED: {
    value: "visually_impaired",
    label: "Visually Impaired",
    description: "Audio-first learning with Text-to-Speech support",
    features: ["Text-to-Speech", "Audio Descriptions", "Voice Input"],
    primaryColor: "visually-impaired",
    icon: "👁️",
    longDescription: "Optimized for students with visual impairments through comprehensive audio support, screen reader compatibility, and voice navigation."
  },
  HEARING_IMPAIRED: {
    value: "hearing_impaired", 
    label: "Hearing Impaired",
    description: "Visual learning with structured text and descriptions",
    features: ["Visual Descriptions", "Structured Text", "Sign Language Support"],
    primaryColor: "hearing-impaired",
    icon: "👂",
    longDescription: "Designed for students with hearing impairments using enhanced visual cues, structured content, and visual communication aids."
  },
  SPEECH_IMPAIRED: {
    value: "speech_impaired",
    label: "Speech Impaired", 
    description: "Text-based interaction and alternative communication",
    features: ["Text Input", "Alternative Communication", "Written Assessments"],
    primaryColor: "speech-impaired",
    icon: "💬",
    longDescription: "Tailored for students with speech impairments through text-based interactions, written assessments, and alternative communication methods."
  },
  SLOW_LEARNER: {
    value: "slow_learner",
    label: "Dyslexia Support",
    description: "Simplified content with step-by-step learning",
    features: ["Simplified Content", "Step-by-Step Learning", "Visual Aids"],
    primaryColor: "slow-learner",
    icon: "🧠",
    longDescription: "Specially adapted for students with dyslexia and learning differences using simplified text, visual aids, and paced learning approaches."
  }
} as const;

export type StudentType = keyof typeof STUDENT_TYPES;
export type StudentTypeValue = typeof STUDENT_TYPES[StudentType]['value'];

export const getStudentTypeByValue = (value: string) => {
  return Object.values(STUDENT_TYPES).find(type => type.value === value);
};

export const getStudentTypeColor = (studentType: StudentTypeValue) => {
  const type = getStudentTypeByValue(studentType);
  return type?.primaryColor || 'primary';
};