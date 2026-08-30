export const theme = {
    // Pure Black Canvas Background
    bgCanvas: "#18181b",

    // Brand & Primary Accents (Emerald Green)
    brand: "#10b981",          // Vibrant Emerald Green (Migrant Primary)
    brandLight: "#34d399",     // Bright Glowing Emerald (Active Selection / Focus)
    brandDark: "#059669",      // Darker Emerald (Card Headers / Borders)
    accent: "#38bdf8",         // Sky Cyan (Model Badges & Active Links)
    purple: "#c084fc",         // Soft Purple (SQL Keywords & Types)

    // Dynamic Thinking & Stream Badges
    thinkingAccents: [
        "#38bdf8", // Cyan
        "#c084fc", // Violet
        "#f59e0b", // Amber
        "#34d399", // Emerald
        "#f472b6", // Pink/Magenta
    ],

    // Status & Telemetry Indicators
    success: "#10b981",        // Connected Green ✓ [●]
    warning: "#f59e0b",        // Amber Alert ⚡
    error: "#ef4444",          // Crimson Error ✗
    info: "#3b82f6",           // Sapphire Blue ℹ

    // Text Hierarchy
    textPrimary: "#f9fafb",    // High Contrast Crisp White Text
    textSecondary: "#9ca3af",  // Muted Subtitle Text (Gray 400)
    textDim: "#6b7280",        // Dimmed Structural Hints (Gray 500)
    textSubtle: "#374151",     // Background Track Details (Gray 700)

    // Box Borders & Structure
    borderPrimary: "#27272a",  // Dark Structural Border (Zinc 800)
    borderFocused: "#10b981",  // Active Input / Window Focus Border (Emerald)
    borderSubtle: "#18181b",   // Background Subcard Divider (Zinc 900)

    // UI Badges & Status Indicators
    badgeDb: "#10b981",        // Connected Database Indicator Dot [●]
    badgeModel: "#38bdf8",     // Active Model Badge [DeepSeek V3]
    badgeCost: "#f59e0b",      // Telemetry Cost Badge [$0.0003]
} as const;

export type Theme = typeof theme;
