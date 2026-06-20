import './globals.css';

export const metadata = {
  title: 'شواهد · منصة توثيق الأداء الوظيفي',
  description: 'إدارة وتوثيق بنود الأداء الوظيفي الـ 11 للمعلمين',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
