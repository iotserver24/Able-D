// Comprehensive Icon Library for the Application
import React from 'react';

// Base Icon Component
const Icon = ({ children, className = "", size = "w-6 h-6", ...props }) => (
  <svg 
    className={`${size} ${className}`} 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

// Student Type Icons
export const EyeIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </Icon>
);

export const EarIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2z"/>
  </Icon>
);

export const MicIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
  </Icon>
);

export const BookIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </Icon>
);

// Navigation Icons
export const HomeIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </Icon>
);

export const MenuIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </Icon>
);

export const CloseIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </Icon>
);

export const BackIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </Icon>
);

// Action Icons
export const UploadIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
  </Icon>
);

export const DownloadIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </Icon>
);

export const SaveIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </Icon>
);

export const DeleteIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </Icon>
);

export const EditIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </Icon>
);

export const AddIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </Icon>
);

// Audio/Voice Icons
export const PlayIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M8 5v14l11-7z"/>
  </Icon>
);

export const PauseIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </Icon>
);

export const StopIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M6 6h12v12H6z"/>
  </Icon>
);

export const VolumeIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </Icon>
);

export const RecordIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <circle cx="12" cy="12" r="8"/>
  </Icon>
);

// Status Icons
export const CheckIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </Icon>
);

export const ErrorIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </Icon>
);

export const WarningIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </Icon>
);

export const InfoIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </Icon>
);

// Accessibility Icons
export const AccessibilityIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
  </Icon>
);

export const SettingsIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </Icon>
);

export const FontSizeIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>
  </Icon>
);

export const ContrastIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14v12c3.31 0 6-2.69 6-6s-2.69-6-6-6z"/>
  </Icon>
);

// Learning Icons
export const QuestionIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
  </Icon>
);

export const NotesIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/>
  </Icon>
);

export const DocumentIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </Icon>
);

export const LightbulbIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
  </Icon>
);

// User Icons
export const UserIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </Icon>
);

export const LogoutIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </Icon>
);

export const LoginIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
  </Icon>
);

// Mobile-specific Icons
export const MobileIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>
  </Icon>
);

export const TouchIcon = ({ className, size }) => (
  <Icon className={className} size={size}>
    <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>
  </Icon>
);

// Export all icons as a collection
export const Icons = {
  Eye: EyeIcon,
  Ear: EarIcon,
  Mic: MicIcon,
  Book: BookIcon,
  Home: HomeIcon,
  Menu: MenuIcon,
  Close: CloseIcon,
  Back: BackIcon,
  Upload: UploadIcon,
  Download: DownloadIcon,
  Save: SaveIcon,
  Delete: DeleteIcon,
  Edit: EditIcon,
  Add: AddIcon,
  Play: PlayIcon,
  Pause: PauseIcon,
  Stop: StopIcon,
  Volume: VolumeIcon,
  Record: RecordIcon,
  Check: CheckIcon,
  Error: ErrorIcon,
  Warning: WarningIcon,
  Info: InfoIcon,
  Accessibility: AccessibilityIcon,
  Settings: SettingsIcon,
  FontSize: FontSizeIcon,
  Contrast: ContrastIcon,
  Question: QuestionIcon,
  Notes: NotesIcon,
  Document: DocumentIcon,
  Lightbulb: LightbulbIcon,
  User: UserIcon,
  Logout: LogoutIcon,
  Login: LoginIcon,
  Mobile: MobileIcon,
  Touch: TouchIcon,
};

export default Icons;
