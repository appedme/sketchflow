export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          body { margin: 0; padding: 0; overflow: hidden; }
          * { box-sizing: border-box; }
        `}</style>
      </head>
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}