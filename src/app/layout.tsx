import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { ModalsProvider } from "@/providers/ModalsProvider";
import { Toaster } from "@/components/ui/sonner";
import { JotaiProvider } from "@/providers/JotaiProvider";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backchannel",
  description:
    "Team chat with workspaces, channels, threads and direct messages, built on Next.js and Convex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body className="antialiased">
          <NuqsAdapter>
            <ConvexClientProvider>
              <JotaiProvider>
                <Toaster />
                <ModalsProvider />

                {children}
              </JotaiProvider>
            </ConvexClientProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
