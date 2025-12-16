import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "./theme/ThemeProvider";
import { DataModeProvider } from "./dataMode";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthToastConnector } from "@/components/AuthToastConnector";

// Optimize Roboto font loading
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--mui-font-family",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Job Search Platform - Знайдіть роботу мрії",
  description:
    "Платформа для пошуку роботи та аналізу ринку праці. Створюйте вакансії, шукайте роботу, аналізуйте дані ринку.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <DataModeProvider>
              <AuthProvider>
                <ToastProvider>
                  <AuthToastConnector />
                  {children}
                </ToastProvider>
              </AuthProvider>
            </DataModeProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
