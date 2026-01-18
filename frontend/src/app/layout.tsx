import type { Metadata } from 'next';

import BackgroundHearts from '@/components/BackgroundHearts';

import './globals.css';

export const metadata: Metadata = {
  title: 'Cardiac MRI Classifier',
  description: 'Cardiac MRI classification with AI-assisted medical guidance.',
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
        <BackgroundHearts />
        <div className="appShell">{children}</div>
      </body>
    </html>
  );
}
