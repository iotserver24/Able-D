export const STUDENT_TYPES = {
  VISUALLY_IMPAIRED: {
    value: "visually_impaired",
    label: "Visually Impaired",
    description: "Audio-first learning with descriptive content",
    features: ["Text-to-Speech", "Audio Descriptions", "Voice Input"],
    icon: "eye",
    primaryColor: "blue"
  },
  HEARING_IMPAIRED: {
    value: "hearing_impaired",
    label: "Hearing Impaired",
    description: "Visual learning with structured text content",
    features: ["Visual Descriptions", "Structured Text", "Sign Language Support"],
    icon: "ear",
    primaryColor: "green"
  },
  SPEECH_IMPAIRED: {
    value: "speech_impaired",
    label: "Speech Impaired",
    description: "Text-based interaction with clear written outputs",
    features: ["Text Input", "Alternative Communication", "Written Assessments"],
    icon: "mic",
    primaryColor: "purple"
  },
  SLOW_LEARNER: {
    value: "slow_learner",
    label: "Dyslexia Support",
    description: "Simplified explanations with examples",
    features: ["Simplified Content", "Step-by-Step Learning", "Visual Aids"],
    icon: "book",
    primaryColor: "orange"
  }
};