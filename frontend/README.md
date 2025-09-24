# Able-D Frontend

A modern, accessible React application built with TypeScript, Vite, and Tailwind CSS, designed to provide an inclusive learning experience for students with diverse accessibility needs.

## 🎯 Overview

The frontend is a single-page application (SPA) that provides:
- **Role-based authentication** (Student/Teacher)
- **Adaptive UI components** for accessibility
- **Real-time AI integration** for content generation
- **Multi-modal content consumption** (text, audio, visual)
- **Responsive design** with mobile support

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── audio/          # Audio-related components
│   │   ├── tts/            # Text-to-speech components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API service layers
│   ├── config/             # Configuration files
│   └── constants/          # Application constants
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:5173 in your browser

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Feature Flags
VITE_ENABLE_TTS=true
VITE_ENABLE_AI_FEATURES=true
```

### Vite Configuration

The project uses Vite with the following plugins:
- **@vitejs/plugin-react-swc** - Fast React refresh
- **TypeScript** - Type checking
- **Tailwind CSS** - CSS processing

## 🎨 UI Components

### Component Library

The project uses **shadcn/ui** components built on Radix UI primitives:

- **Accessible by default** - All components follow ARIA guidelines
- **Customizable** - Easy to theme and modify
- **Type-safe** - Full TypeScript support
- **Responsive** - Mobile-first design

### Key Components

- **Auth Components** - Login, registration, role selection
- **Audio Components** - Audio player, visual impaired interface
- **TTS Components** - Text-to-speech controls and welcome popup
- **UI Components** - Buttons, forms, dialogs, navigation

## 🔐 Authentication

### Firebase Integration

The app uses Firebase Authentication with:
- **Email/password authentication**
- **Role-based access control** (Student/Teacher)
- **Protected routes** with automatic redirects
- **Persistent sessions** across browser refreshes

### Auth Flow

1. **Role Selection** - Choose Student or Teacher
2. **Authentication** - Login with Firebase
3. **Dashboard Access** - Redirect to appropriate dashboard
4. **Protected Routes** - Automatic authentication checks

## 🎵 Audio Features

### Text-to-Speech (TTS)

- **Browser-native TTS** integration
- **Voice selection** and speed control
- **Text highlighting** during speech
- **Accessibility-focused** design

### Audio Player

- **Custom audio controls** for educational content
- **Visual feedback** for audio playback
- **Keyboard navigation** support

## 📱 Responsive Design

### Mobile-First Approach

- **Tailwind CSS** for responsive utilities
- **Touch-friendly** interface elements
- **Adaptive layouts** for different screen sizes
- **Accessibility features** on all devices

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🔄 State Management

### React Context

- **AuthContext** - User authentication state
- **TTSContext** - Text-to-speech settings
- **AdaptiveUIContext** - Accessibility preferences

### TanStack Query

- **Server state management** for API calls
- **Automatic caching** and background updates
- **Optimistic updates** for better UX
- **Error handling** and retry logic

## 🧪 Testing

### Testing Setup

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy

- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for user flows
- **Accessibility tests** with jest-axe

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, GitHub Pages)
2. **CDN Deployment** (AWS CloudFront, Cloudflare)
3. **Container Deployment** (Docker)

### Build Optimization

- **Code splitting** for faster loading
- **Tree shaking** to remove unused code
- **Asset optimization** for images and fonts
- **Gzip compression** for smaller bundles

## 🔧 Development Guidelines

### Code Style

- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **TypeScript strict mode** enabled
- **Conventional commits** for git messages

### Component Guidelines

- **Functional components** with hooks
- **TypeScript interfaces** for props
- **Accessibility attributes** (ARIA labels, roles)
- **Responsive design** principles

### File Naming

- **PascalCase** for components (`StudentDashboard.tsx`)
- **camelCase** for utilities (`useSubjects.ts`)
- **kebab-case** for CSS classes
- **Descriptive names** for clarity

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables
   - Clear node_modules and reinstall

2. **Runtime Errors**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check Firebase configuration

3. **Performance Issues**
   - Use React DevTools Profiler
   - Check bundle size with `npm run build`
   - Optimize images and assets

### Debug Mode

Enable debug logging:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include accessibility attributes
4. Test on multiple devices and browsers
5. Update documentation for new features

---

**Frontend Development** - Building accessible, modern web experiences. 🌟