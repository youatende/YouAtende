import { createContext, useContext, useState, ReactNode } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
  t: ThemeTokens;
}

export interface ThemeTokens {
  // Backgrounds
  bg: string;
  panel: React.CSSProperties;
  panelStrong: React.CSSProperties;
  panelSubtle: React.CSSProperties;
  panelInput: React.CSSProperties;
  header: React.CSSProperties;
  nav: React.CSSProperties;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

  // Borders
  border: string;
  borderStrong: string;

  // Active / selected
  activeItem: React.CSSProperties;
  activeText: string;
  navActive: React.CSSProperties;
  navInactiveText: string;

  // Scrollbar class suffix
  scrollbarClass: string;

  // Blobs
  blob1: string;
  blob2: string;
  blob3: string;
  blob4: string;

  // Pulse ring colors
  pulseColor1: string;
  pulseColor2: string;

  // Arrow button
  arrowBtn: React.CSSProperties;
  arrowBtnOpen: React.CSSProperties;
  arrowColor: string;

  // Misc
  divider: string;
  tagBg: string;
  tagColor: string;
  tagBorder: string;
  unreadBg: string;
  onlineDot: string;
  avatarBorder: string;
  msgAgent: React.CSSProperties;
  msgContact: React.CSSProperties;
  inputBg: React.CSSProperties;
  logoText: string;
  logoGradient: React.CSSProperties;
}

function buildTokens(mode: ThemeMode): ThemeTokens {
  const isDark = mode === "dark";

  if (isDark) {
    return {
      bg: "linear-gradient(135deg, #0d0221 0%, #1a0845 20%, #2d0e6e 40%, #4a1496 60%, #6b21c0 80%, #8b2fc9 100%)",
      panel: {
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
      },
      panelStrong: {
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 16,
      },
      panelSubtle: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
      },
      panelInput: {
        background: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
      },
      header: {
        background: "transparent",
      },
      nav: {
        background: "rgba(15,3,40,0.65)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 40px rgba(124,58,237,0.2)",
        borderRadius: 9999,
      },
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.6)",
      textMuted: "rgba(255,255,255,0.4)",
      textAccent: "rgba(196,100,255,0.9)",
      border: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.15)",
      activeItem: {
        background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(124,58,237,0.2))",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 2px 16px rgba(124,58,237,0.2)",
      },
      activeText: "#ffffff",
      navActive: {
        background: "linear-gradient(135deg, rgba(236,72,153,0.55), rgba(124,58,237,0.55))",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 2px 16px rgba(124,58,237,0.5), 0 0 8px rgba(236,72,153,0.3)",
      },
      navInactiveText: "rgba(255,255,255,0.6)",
      scrollbarClass: "scrollbar-glass-dark",
      blob1: "radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)",
      blob2: "radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 70%)",
      blob3: "radial-gradient(circle, rgba(219,39,119,0.2) 0%, transparent 70%)",
      blob4: "radial-gradient(circle, rgba(196,100,255,0.18) 0%, transparent 70%)",
      pulseColor1: "rgba(236,72,153,0.35)",
      pulseColor2: "rgba(124,58,237,0.2)",
      arrowBtn: {
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(16px)",
        border: "1.5px solid rgba(255,255,255,0.25)",
        boxShadow: "0 0 16px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.2)",
      },
      arrowBtnOpen: {
        background: "linear-gradient(135deg, rgba(236,72,153,0.7), rgba(124,58,237,0.7))",
        backdropFilter: "blur(16px)",
        border: "1.5px solid rgba(255,255,255,0.4)",
        boxShadow: "0 0 24px rgba(236,72,153,0.6), 0 4px 16px rgba(0,0,0,0.3)",
      },
      arrowColor: "#ffffff",
      divider: "1px solid rgba(255,255,255,0.08)",
      tagBg: "rgba(255,255,255,0.08)",
      tagColor: "rgba(255,255,255,0.5)",
      tagBorder: "rgba(255,255,255,0.1)",
      unreadBg: "linear-gradient(135deg, #ec4899, #7c3aed)",
      onlineDot: "#10b981",
      avatarBorder: "rgba(255,255,255,0.2)",
      msgAgent: {
        background: "linear-gradient(135deg, rgba(236,72,153,0.4), rgba(124,58,237,0.4))",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
      },
      msgContact: {
        background: "rgba(255,255,255,0.09)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      },
      inputBg: {
        background: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
      },
      logoText: "#ffffff",
      logoGradient: {
        background: "linear-gradient(90deg, #e879f9, #ec4899)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
    };
  }

  // ─── LIGHT MODE ───
  return {
    bg: "#f5f6f8",
    panel: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    panelStrong: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    },
    panelSubtle: {
      background: "#f9fafb",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
    },
    panelInput: {
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
    },
    header: {
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
    },
    nav: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      borderRadius: 9999,
    },
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    textAccent: "#7c3aed",
    border: "#e5e7eb",
    borderStrong: "#d1d5db",
    activeItem: {
      background: "#f5f3ff",
      border: "1px solid #ede9fe",
      boxShadow: "none",
    },
    activeText: "#7c3aed",
    navActive: {
      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
      color: "#ffffff",
      border: "1px solid transparent",
      boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
    },
    navInactiveText: "#6b7280",
    scrollbarClass: "scrollbar-glass-light",
    blob1: "transparent",
    blob2: "transparent",
    blob3: "transparent",
    blob4: "transparent",
    pulseColor1: "rgba(124,58,237,0.15)",
    pulseColor2: "rgba(124,58,237,0.07)",
    arrowBtn: {
      background: "#ffffff",
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    arrowBtnOpen: {
      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
      border: "1.5px solid transparent",
      boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
    },
    arrowColor: "#374151",
    divider: "1px solid #f0f0f0",
    tagBg: "#f3f4f6",
    tagColor: "#6b7280",
    tagBorder: "#e5e7eb",
    unreadBg: "linear-gradient(135deg, #7c3aed, #a855f7)",
    onlineDot: "#10b981",
    avatarBorder: "#e5e7eb",
    msgAgent: {
      background: "#f5f3ff",
      border: "1px solid #ede9fe",
      boxShadow: "none",
    },
    msgContact: {
      background: "#f9fafb",
      border: "1px solid #f0f0f0",
      boxShadow: "none",
    },
    inputBg: {
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      borderRadius: 20,
    },
    logoText: "#111827",
    logoGradient: {
      background: "linear-gradient(90deg, #7c3aed, #a855f7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  };
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggle: () => {},
  t: buildTokens("dark"),
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const t = buildTokens(mode);
  return (
    <ThemeContext.Provider value={{ mode, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}