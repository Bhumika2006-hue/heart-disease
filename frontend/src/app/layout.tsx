import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Heart Health AI Assistant',
  description: 'Get educational insights from your cardiac MRI scans with our AI-powered assistant.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="appShell">{children}</div>
      </body>
    </html>
  );
}
