import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Apartment Finder — SLC Decision Dashboard",
  description: "Compare, rank, and decide on apartments in Salt Lake City.",
  applicationName: "Apartment Finder",
  appleWebApp: {
    capable: true,
    title: "Apartments",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <NavBar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 safe-x">
            {children}
          </main>
          <footer className="no-print hidden md:block border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
            Apartment Finder — local-first, data persists in your browser
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
