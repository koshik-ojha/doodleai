"use client";

import WidgetLoader from './WidgetLoader';
import { ThemeProvider } from '@context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }) {
  // Replace this token with your actual embed token
  // You can get this from your chatbot settings or make it dynamic
  const embedToken = process.env.NEXT_PUBLIC_WIDGET_TOKEN || "ayxzQcJAU7MeiLzokQcIDLFMXonng8uF3chRJ436RLjPY5w3cCQ7tB0Y-pXM7cdB";

  return (
    <ThemeProvider>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e99',
            border: '1px solid #a855f733',
            color: '#fff',
            fontSize: '12px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
      <WidgetLoader token={embedToken} />
    </ThemeProvider>
  );
}

