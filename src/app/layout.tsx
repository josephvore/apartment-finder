import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Apartment Finder — SLC Decision Dashboard",
  description: "Compare, rank, and decide on apartments in Salt Lake City.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <NavBar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <footer className="no-print border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
            Apartment Finder — local-first, data persists in your browser
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
