"use client";

import { useEffect } from 'react';

export default function WidgetLoader({ token }) {
  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    script.src = `${origin}/api/widget-script?token=${token}`;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [token]);

  return null;
}
