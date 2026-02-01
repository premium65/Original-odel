import { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Branding {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  logoIconUrl: string;
  faviconUrl: string;
  footerText: string;
  copyrightText: string;
}

interface ThemeColors {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  cardBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
}

interface SettingsContextType {
  branding: Branding;
  theme: ThemeColors;
  isLoading: boolean;
}

const defaultBranding: Branding = {
  siteName: "ODEL ADS",
  siteTagline: "Watch & Earn",
  logoUrl: "",
  logoIconUrl: "",
  faviconUrl: "",
  footerText: "",
  copyrightText: "2024 ODEL ADS. All rights reserved.",
};

const defaultTheme: ThemeColors = {
  primaryColor: "#f59e0b",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  backgroundColor: "#0f1419",
  cardBackground: "#1a2332",
  textColor: "#ffffff",
  mutedTextColor: "#9ca3af",
  borderColor: "#374151",
  successColor: "#10b981",
  errorColor: "#ef4444",
  warningColor: "#f59e0b",
};

const SettingsContext = createContext<SettingsContextType>({
  branding: defaultBranding,
  theme: defaultTheme,
  isLoading: true,
});

async function fetchBranding(): Promise<Branding> {
  const res = await fetch("/api/branding");
  if (!res.ok) return defaultBranding;
  return res.json();
}

async function fetchTheme(): Promise<ThemeColors> {
  const res = await fetch("/api/theme");
  if (!res.ok) return defaultTheme;
  const data = await res.json();
  // Convert from { key: { value } } format to flat object
  const theme: ThemeColors = { ...defaultTheme };
  Object.entries(data).forEach(([key, val]: [string, any]) => {
    if (val?.value) {
      (theme as any)[key] = val.value;
    }
  });
  return theme;
}

function applyThemeColors(theme: ThemeColors) {
  const root = document.documentElement;

  if (theme.primaryColor) root.style.setProperty("--color-primary", theme.primaryColor);
  if (theme.secondaryColor) root.style.setProperty("--color-secondary", theme.secondaryColor);
  if (theme.accentColor) root.style.setProperty("--color-accent", theme.accentColor);
  if (theme.backgroundColor) root.style.setProperty("--color-background", theme.backgroundColor);
  if (theme.cardBackground) root.style.setProperty("--color-card", theme.cardBackground);
  if (theme.textColor) root.style.setProperty("--color-text", theme.textColor);
  if (theme.mutedTextColor) root.style.setProperty("--color-muted", theme.mutedTextColor);
  if (theme.borderColor) root.style.setProperty("--color-border", theme.borderColor);
  if (theme.successColor) root.style.setProperty("--color-success", theme.successColor);
  if (theme.errorColor) root.style.setProperty("--color-error", theme.errorColor);
  if (theme.warningColor) root.style.setProperty("--color-warning", theme.warningColor);
}

function applyFavicon(faviconUrl: string) {
  if (!faviconUrl) return;
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

function applyTitle(siteName: string) {
  if (siteName) {
    document.title = siteName;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: branding, isLoading: brandingLoading } = useQuery({
    queryKey: ["public-branding"],
    queryFn: fetchBranding,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ["public-theme"],
    queryFn: fetchTheme,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = brandingLoading || themeLoading;

  // Apply theme colors when they change
  useEffect(() => {
    if (theme) {
      applyThemeColors(theme);
    }
  }, [theme]);

  // Apply branding when it changes
  useEffect(() => {
    if (branding) {
      applyFavicon(branding.faviconUrl);
      applyTitle(branding.siteName);
    }
  }, [branding]);

  return (
    <SettingsContext.Provider
      value={{
        branding: branding || defaultBranding,
        theme: theme || defaultTheme,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
