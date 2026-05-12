'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}

      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 72 }}
        toastOptions={{
          duration: 4000,

          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow:
              '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            maxWidth: '380px',
          },

          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },

            style: {
              borderLeft: '4px solid #10B981',
            },
          },

          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },

            style: {
              borderLeft: '4px solid #EF4444',
            },
          },

          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#ffffff',
            },

            style: {
              borderLeft: '4px solid #3B82F6',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}