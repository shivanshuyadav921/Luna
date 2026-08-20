import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luna - Anonymous Cat Social Network',
  description: 'People meet through their cats, not through their identities. Share your cat, discover theirs, and make genuine connections with controlled mutual identity reveal.',
  keywords: ['cat social network', 'anonymous social media', 'cats', 'cat photos', 'privacy social app'],
  openGraph: {
    title: 'Luna - Anonymous Cat Social Network',
    description: 'People meet through their cats, not through their identities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
