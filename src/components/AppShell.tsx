import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  useMediaQuery,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/GridLegacy";
import { FloatingNav } from "./FloatingNav";

type NavKey = "home" | "games" | "about";

function keyFromPath(pathname: string): NavKey {
  if (pathname === "/" || pathname.startsWith("/game/")) return "home";
  if (pathname.startsWith("/games")) return "games";
  return "about";
}

function AdUnit({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <Stack spacing={0.25} alignItems="center">
        <Typography variant="caption" sx={{ letterSpacing: 1 }}>
          AD
        </Typography>
        {!compact && <Typography variant="body2">Your ad goes here</Typography>}
      </Stack>
    </div>
  );
}

export function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();

  const value: NavKey = keyFromPath(location.pathname);

  const go = (k: NavKey) => {
    if (k === "home") navigate("/");
    if (k === "games") navigate("/games");
    if (k === "about") navigate("/about");
  };

  const mobileNavHeight = 60;
  const mobileAdHeight = 72;
  const dockGap = 12;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        backgroundImage:
          "radial-gradient(1100px 550px at 12% -10%, rgba(255,255,255,0.06), transparent 60%)," +
          "radial-gradient(900px 500px at 100% 0%, rgba(255,255,255,0.04), transparent 55%)",
        backgroundRepeat: "no-repeat",
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            position: "sticky",
            top: 16,
            zIndex: theme.zIndex.appBar,
            pt: 2,
          }}
        >
          <Container maxWidth="lg">
            <FloatingNav
              value={value}
              onChange={go}
              // logo={
              //   <Stack direction="row" spacing={1} alignItems="center">
              //     <Box
              //       sx={() => ({
              //         width: 28,
              //         height: 28,
              //         borderRadius: 2,
              //         background:
              //           "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              //         border: "1px solid rgba(255,255,255,0.14)",
              //         boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
              //       })}
              //     />
              //     <Typography sx={{ fontWeight: 950, letterSpacing: -0.4 }}>
              //       MyGame
              //     </Typography>
              //   </Stack>
              // }
              logoWidth={190}
            />
          </Container>
        </Box>
      )}

      <Container
        maxWidth="lg"
        sx={{
          pt: !isMobile ? 3 : 2,
          pb: isMobile
            ? `${mobileNavHeight + mobileAdHeight + dockGap * 2 + 16}px`
            : 5,
        }}
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Main content */}
          <Grid item xs={12} md={8} lg={9}>
            <div>
              <Outlet />
            </div>
          </Grid>

          {/* Desktop ad rail */}
          {!isMobile && (
            <Grid item xs={12} md={4} lg={3}>
              <Stack spacing={2} sx={{ position: "sticky", top: 120 }}>
                <AdUnit />
                {/* <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    color: "text.secondary",
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800}>
                    Quick links
                  </Typography>
                  <Typography variant="body2">
                    Add favorites / pinned countdowns here later.
                  </Typography>
                </Paper> */}
              </Stack>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Mobile: ad strip above the bottom nav */}
      {isMobile && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: dockGap + mobileNavHeight + 10,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ height: mobileAdHeight, p: 1 }}>
            <AdUnit compact />
          </Box>
        </Paper>
      )}

      {/* Mobile bottom nav (reuse FloatingTopNav) */}
      {isMobile && (
        <FloatingNav value={value} onChange={go} dock="bottom" offsetPx={12} />
      )}
    </Box>
  );
}
