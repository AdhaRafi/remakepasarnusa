import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/frontend/context/ThemeContext";
import { CartProvider } from "@/frontend/context/CartContext";
import { AuthProvider } from "@/frontend/context/AuthContext";
import { WishlistProvider } from "@/frontend/context/WishlistContext";
import { ToastProvider } from "@/frontend/components/Toast";
import CartDrawer from "@/frontend/components/CartDrawer";
import BottomNav from "@/frontend/components/BottomNav";
import ChatWidget from "@/frontend/components/ChatWidget";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PasarNusa: Marketplace Kriya & Produk UMKM Nusantara",
  description: "Platform kurasi karya artisan dan pengrajin lokal Indonesia. Belanja aman, transparan, dan berdayakan ekonomi rakyat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pasarnusa_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans bg-[#F7F3EC] dark:bg-[#120F0D] text-[#1A1008] dark:text-[#F5EFEB] antialiased min-h-screen selection:bg-[#C94B1A] selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  {children}
                  <CartDrawer />
                  <BottomNav />
                  <ChatWidget />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
