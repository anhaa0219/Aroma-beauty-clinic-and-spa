import { Montserrat } from 'next/font/google';
import './globals.css'; // Make sure this path matches where your globals.css is!

// Load Montserrat and explicitly tell it to support Mongolian Cyrillic
const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'], 
  variable: '--font-sans', // This hooks into Tailwind's font-sans
  display: 'swap',
});

export const metadata = {
  title: 'Aroma Spa',
  description: 'Book your appointment online.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      {/* Apply the font variable and smooth antialiasing to the whole app */}
      <body className={`${montserrat.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}