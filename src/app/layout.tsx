import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "COLLEGIA — Navigate Your Future",
    template: "%s | COLLEGIA",
  },
  description:
    "COLLEGIA helps international students discover colleges that fit their profile, understand where they stand, and build a clear path to get there.",
  keywords: [
    "college search",
    "international students",
    "college admissions",
    "US universities",
    "college match",
    "study abroad USA",
  ],
  openGraph: {
    type: "website",
    siteName: "COLLEGIA",
    title: "COLLEGIA — Navigate Your Future",
    description:
      "Find colleges that fit you, understand where you stand, and build your path to get there.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
