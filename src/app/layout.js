import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Modify this to your liking
export const metadata = {
  title: "Hiranyamaya Dash (Hiru) | Bioinformatician",
  description:
    "I code to decode biology. If it's broken, I fix it. If it doesn't exist, I build it — and open source it.",
  metadataBase: new URL("https://www.hdash.dev"),
  alternates: {
    canonical: "/",
  },
};

// And this too
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HDash - Profile",
  alternateName: "HDash",
  url: "https://www.hdash.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
