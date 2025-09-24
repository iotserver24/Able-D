import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface EnhancedTextDisplayProps {
  text: string;
  className?: string;
}

const EnhancedTextDisplay: React.FC<EnhancedTextDisplayProps> = ({
  text,
  className = ""
}) => {
  return (
    <div className={`enhanced-text-display bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/20 to-emerald-200/20 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Header badge */}
      <div className="relative z-10 mb-6">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm font-medium">Enhanced Visual Learning</span>
        </div>
      </div>
      
      <div className="relative z-10 max-w-none">
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Enhanced styling for different markdown elements
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 pb-3 border-b-4 border-gradient-to-r from-blue-200 to-purple-200 relative">
              <span className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              <span className="pl-4">{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold text-indigo-700 mb-4 pl-4 border-l-6 border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50 py-2 rounded-r-lg shadow-sm">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-medium text-emerald-700 mb-3 pl-3 border-l-4 border-emerald-400 bg-emerald-50 py-1 rounded-r">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-medium text-orange-600 mb-3 pl-2 border-l-3 border-orange-300 bg-orange-50 py-1 rounded-r">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-gray-800 mb-4 leading-relaxed text-lg tracking-wide">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-6 space-y-3 pl-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 space-y-3 pl-6">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 text-lg leading-relaxed relative">
              <span className="absolute -left-6 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full top-3"></span>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-6 border-gradient-to-b from-blue-400 to-purple-400 pl-6 italic text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 py-4 my-6 rounded-r-lg shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t"></div>
              <div className="text-lg leading-relaxed">{children}</div>
              <div className="absolute bottom-0 right-0 text-4xl text-blue-200 opacity-50">"</div>
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-2 py-1 rounded-md text-sm font-mono border border-red-200 shadow-sm">
                {children}
              </code>
            ) : (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-6 shadow-2xl border border-gray-700 relative">
              <div className="absolute top-3 left-3 flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="pt-6">{children}</div>
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-8 rounded-xl shadow-lg border border-gray-200">
              <table className="min-w-full bg-white">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 text-left font-semibold text-lg border-b-2 border-indigo-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-200 px-6 py-4 text-gray-700 text-base">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 bg-gradient-to-r from-yellow-200 to-orange-200 px-1 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700 bg-gradient-to-r from-green-100 to-emerald-100 px-1 rounded">
              {children}
            </em>
          ),
          hr: () => (
            <div className="my-8 flex items-center">
              <div className="flex-grow h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="mx-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <div className="flex-grow h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
          ),
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-400 transition-all duration-200 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      </div>
    </div>
  );
};

export default EnhancedTextDisplay;
