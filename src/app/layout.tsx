import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: { default: "Press Play", template: "%s — Press Play" },
  description:
    "Press Play turns news articles and tech announcements into short talking-head videos you'll actually watch. News for the masses — articles in, vibes out.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
