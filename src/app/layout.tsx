import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AnalysisProvider } from "@/contexts/analysis-context";
import { LanguageProvider } from "@/contexts/language-context";
import { LoginModal } from "@/components/login-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#000000] text-[#FAF9F6] antialiased" style={{ fontFamily: "'Inter', sans-serif" }} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <LoginModal />
            <AnalysisProvider>
              {children}
            </AnalysisProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

