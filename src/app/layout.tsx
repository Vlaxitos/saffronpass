import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SaffronPass — Luxury Animated Invites & Smart Multi-Event RSVP",
    template: "%s · SaffronPass",
  },
  description:
    "Interactive 3D wax-seal and royal palace door web invitations with private guest-circle links and exact per-function RSVP headcounts for Indian weddings and global celebrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jakarta.variable} ${jetbrains.variable} h-full overflow-x-hidden antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-ivory text-ink selection:bg-saffron-soft selection:text-maroon-dark">
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            className:
              "!rounded-2xl !border !border-[#C88A2E]/35 !font-sans !text-sm !shadow-xl",
          }}
        />
      </body>
    </html>
  );
}
