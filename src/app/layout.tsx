import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Strawberry Dip - Premium Chocolate Covered Strawberries",
  description: "Fresh strawberries dipped in premium chocolate. Perfect for gifts, celebrations, and special moments. Order online with same-day delivery.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon-official.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon-official.svg', sizes: '180x180', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CustomerAuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
