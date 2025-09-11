import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/components/auth-provider";

const defaultUrl = process.env.WEBSITE_URL
  ? `https://${process.env.WEBSITE_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Participant Scheduler",
  description: "Schedule experiments with ease",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        {/* Load Google APIs globally */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <Script
          src="https://apis.google.com/js/api.js"
          strategy="beforeInteractive"
        />
        <AuthProvider>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          >
          {children}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
