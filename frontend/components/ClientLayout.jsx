"use client";

import WidgetLoader from './WidgetLoader';
import { ThemeProvider } from '@context/ThemeContext';

export default function ClientLayout({ children }) {
  // Replace this token with your actual embed token
  // You can get this from your chatbot settings or make it dynamic
  const embedToken = process.env.NEXT_PUBLIC_WIDGET_TOKEN || "ayxzQcJAU7MeiLzokQcIDLFMXonng8uF3chRJ436RLjPY5w3cCQ7tB0Y-pXM7cdB";

  return (
    <ThemeProvider>
      {children}
      <WidgetLoader token={embedToken} />
    </ThemeProvider>
  );
}

