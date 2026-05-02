import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OrisTrade Courses — Master Trading From Scratch',
  description: 'Learn trading with structured courses from basics to advanced strategies. From confluence analysis to options management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
