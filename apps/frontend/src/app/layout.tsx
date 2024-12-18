import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider as ColorThemeProvider } from "@/providers/theme-provider";
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { ThemeErrorBoundary } from '@/components/themes/theme-error-boundary';
import { PluginProviderWrapper } from '@/components/providers/plugin-provider-wrapper';
import SupabaseProvider from "@/lib/supabase/supabase-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Loomity",
  description: "Your AI-powered development companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <AuthProvider>
            <ColorThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ThemeErrorBoundary>
                <CustomThemeProvider>
                  <PluginProviderWrapper>
                    {children}
                  </PluginProviderWrapper>
                </CustomThemeProvider>
              </ThemeErrorBoundary>
            </ColorThemeProvider>
            <Toaster />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
