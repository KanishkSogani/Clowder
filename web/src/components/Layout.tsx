import "@rainbow-me/rainbowkit/styles.css";
// import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../hooks/ThemeProvider";
// import MetamaskProvider from '@/providers'
import Navbar from "./Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "../hooks/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HodlCoin",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`min-h-screen flex flex-col bg-cover bg-center bg-white text-black bg-[url('../images/background-light.png')] dark:text-white dark:bg-black dark:bg-[url('../images/background-dark.png')]`}
    >
      <WalletProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 flex-col items-center justify-start py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </WalletProvider>
    </div>
  );
}
