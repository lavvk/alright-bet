import type { Metadata } from "next";
import { Inter, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { themeInitScript } from "@/components/ThemeToggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alright, Bet — predictions with friends",
  description:
    "Make predictions with friends. Lock the terms. Pull the receipt. A personalized Kalshi for small groups, on Base.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-fg-faint sm:flex-row">
        <p>
          <span className="font-semibold text-fg-muted">Alright</span>
          <span className="text-accent">,</span>{" "}
          <span className="font-semibold text-fg-muted">Bet</span> — predictions
          with friends.
        </p>
        <p>Base Sepolia testnet · play money only · not financial advice.</p>
      </div>
    </footer>
  );
}
