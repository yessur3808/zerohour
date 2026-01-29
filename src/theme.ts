import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      // very dark, slightly warm charcoal
      default: "#07080900",
      paper: "#0D0F11",
    },

    // Primary accent in the screenshot (green/emerald)
    primary: {
      main: "#35E07A",
      light: "#6AF0A2",
      dark: "#1BBE61",
      contrastText: "#06100A",
    },

    // Keep secondary very muted (UI doesn’t use a loud secondary hue)
    secondary: {
      main: "#9AA3AD",
    },

    error: { main: "#FF5A7A" },

    text: {
      primary: "rgba(255,255,255,0.92)",
      secondary: "rgba(255,255,255,0.62)",
      disabled: "rgba(255,255,255,0.42)",
    },

    divider: "rgba(255,255,255,0.08)",

    // Nice defaults for icons/borders
    action: {
      active: "rgba(255,255,255,0.70)",
      hover: "rgba(255,255,255,0.06)",
      selected: "rgba(255,255,255,0.08)",
      disabled: "rgba(255,255,255,0.35)",
      disabledBackground: "rgba(255,255,255,0.06)",
      focus: "rgba(53,224,122,0.18)",
    },
  },

  shape: { borderRadius: 18 },

  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',

    h4: { fontWeight: 850, letterSpacing: -0.6 },
    h6: { fontWeight: 800, letterSpacing: -0.2 },
    subtitle1: { fontWeight: 650 },

    button: { fontWeight: 700, textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Matches the screenshot: dark vignette + faint green cast on left
          background:
            "radial-gradient(1200px 800px at 20% 35%, rgba(53,224,122,0.10), transparent 55%)," +
            "radial-gradient(900px 700px at 75% 10%, rgba(255,255,255,0.05), transparent 55%)," +
            "radial-gradient(1400px 900px at 50% 120%, rgba(0,0,0,0.90), rgba(0,0,0,0.98) 60%)," +
            "linear-gradient(180deg, #070809 0%, #040506 100%)",
          backgroundAttachment: "fixed",
          color: "rgba(255,255,255,0.92)",
        },
      },
    },

    // Surfaces: “borderless” soft edge, very subtle lift
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: alpha(theme.palette.common.black, 0.35),
          border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
          boxShadow: `0 14px 40px rgba(0,0,0,0.55)`,
          // soften border feel
          outline: `1px solid ${alpha(theme.palette.common.black, 0.35)}`,
          outlineOffset: -1,
        }),
      },
    },

    // Dialogs / cards: slightly more “panel” feel like the screenshot
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 28,
          backgroundColor: "#0C0E10",
          border: `1px solid ${alpha(theme.palette.common.white, 0.07)}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
        }),
      },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 28,
          backgroundColor: "#0C0E10",
          border: `1px solid ${alpha(theme.palette.common.white, 0.07)}`,
        }),
      },
    },

    // Buttons: pill, quiet borders like the bottom actions in the image
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          paddingLeft: theme.spacing(2.2),
          paddingRight: theme.spacing(2.2),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
        }),

        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.common.white, 0.1),
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          "&:hover": {
            borderColor: alpha(theme.palette.common.white, 0.16),
            backgroundColor: alpha(theme.palette.common.white, 0.05),
          },
        }),

        contained: ({ theme }) => ({
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          // subtle green glow for primary contained
          ...(theme.palette.primary.main && {
            "&.MuiButton-containedPrimary": {
              boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
            },
          }),
        }),
      },
    },

    // Icon buttons: small, soft, like the arrow buttons
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.06),
            borderColor: alpha(theme.palette.common.white, 0.12),
          },
        }),
      },
    },

    // List items: to match the rows (“Collaboration / Paid Plan / Unpaid Plan”)
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          paddingTop: theme.spacing(1.2),
          paddingBottom: theme.spacing(1.2),
          "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.04),
          },
        }),
      },
    },

    // Inputs: barely-there borders, dark fill
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
          },
          "&.Mui-focused": {
            backgroundColor: alpha(theme.palette.common.white, 0.04),
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: alpha(theme.palette.common.white, 0.1),
        }),
      },
    },

    // Chips: minimal, quiet
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          backgroundColor: alpha(theme.palette.common.white, 0.04),
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        }),
      },
    },

    // Typography defaults for headings in dark UI
    MuiTypography: {
      styleOverrides: {
        h4: { color: "rgba(255,255,255,0.94)" },
        h5: { color: "rgba(255,255,255,0.94)" },
        h6: { color: "rgba(255,255,255,0.92)" },
      },
    },
  },
});
