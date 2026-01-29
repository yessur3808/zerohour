import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { StatusFilter, SortKey } from "./gamesSorting";

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import { FiltersContent } from "./FiltersContent";

export type GamesFiltersState = {
  query: string;
  status: StatusFilter;
  tag: string;
  sort: SortKey;
};

type Props = {
  value: GamesFiltersState;
  onChange: (next: GamesFiltersState) => void;

  allTags: string[];
  resultsText: string;

  onSubmitSearch?: () => void;
};

function isDefault(v: GamesFiltersState) {
  return (
    v.query === "" && v.status === "all" && v.tag === "all" && v.sort === "az"
  );
}

export function GamesToolbar({
  value,
  onChange,
  allTags,
  resultsText,
  onSubmitSearch,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const set = (patch: Partial<GamesFiltersState>) =>
    onChange({ ...value, ...patch });

  const clearAll = () =>
    onChange({ query: "", status: "all", tag: "all", sort: "az" });

  const activeChips: Array<{
    key: string;
    label: string;
    onDelete: () => void;
  }> = [];

  if (value.status !== "all") {
    activeChips.push({
      key: "status",
      label:
        value.status === "announced_date"
          ? t("game.filter_release_date")
          : value.status === "recurring_daily"
            ? t("game.filter_daily_reset")
            : t("game.filter_tba"),
      onDelete: () => set({ status: "all" }),
    });
  }

  if (value.tag !== "all") {
    activeChips.push({
      key: "tag",
      label: `${t("common.tag")}: ${value.tag}`,
      onDelete: () => set({ tag: "all" }),
    });
  }

  if (value.sort !== "az") {
    activeChips.push({
      key: "sort",
      label:
        value.sort === "soonest"
          ? t("common.sort_soonest")
          : value.sort === "latest"
            ? t("common.sort_latest")
            : t("common.sort_daily_first"),
      onDelete: () => set({ sort: "az" }),
    });
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          top: 100,
          zIndex: 10,
          borderRadius: 1,
          px: 1.5,
          py: 1.25,
          backdropFilter: "blur(10px)",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                value={value.query}
                onChange={(e) => set({ query: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmitSearch?.();
                }}
                size="small"
                placeholder={t("common.search_placeholder")}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: value.query ? (
                    <InputAdornment position="end">
                      <Tooltip title={t("common.clear")}>
                        <IconButton
                          size="small"
                          onClick={() => set({ query: "" })}
                          aria-label={t("common.clear")}
                          edge="end"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            "&:hover": { color: theme.palette.text.primary },
                          })}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={(theme) => {
                  const accent = theme.palette.primary.main;
                  const isDark = theme.palette.mode === "dark";

                  return {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      height: 52,
                      px: 0.5,

                      "& fieldset": { border: "none" },

                      background: isDark
                        ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
                        : "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",

                      boxShadow: isDark
                        ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 30px rgba(0,0,0,0.35)"
                        : "inset 0 1px 0 rgba(255,255,255,0.7), 0 12px 22px rgba(0,0,0,0.10)",

                      outline: isDark
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(0,0,0,0.06)",

                      transition:
                        "box-shadow 220ms cubic-bezier(0.16,1,0.3,1), outline-color 220ms cubic-bezier(0.16,1,0.3,1)",

                      "&:hover": {
                        boxShadow: isDark
                          ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 40px rgba(0,0,0,0.45)"
                          : "inset 0 1px 0 rgba(255,255,255,0.75), 0 16px 30px rgba(0,0,0,0.14)",
                      },

                      "&.Mui-focused": {
                        outline: `1px solid ${accent}55`,
                        boxShadow: isDark
                          ? `inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 44px rgba(0,0,0,0.55), 0 0 0 4px ${accent}22`
                          : `0 0 0 4px ${accent}22`,
                      },
                    },

                    "& .MuiInputBase-input": {
                      fontWeight: 650,
                      letterSpacing: "-0.01em",
                      paddingLeft: 0,
                    },

                    "& .MuiInputAdornment-positionStart": {
                      marginLeft: 2,
                      marginRight: 3,
                    },

                    "& .MuiInputAdornment-positionEnd": {
                      marginLeft: 2,
                      marginRight: 3,
                    },

                    "& .MuiInputAdornment-root": {
                      color: theme.palette.text.secondary,
                    },
                  };
                }}
              />
            </Box>

            <Tooltip title="Filters">
              <IconButton
                onClick={() => {
                  if (isMobile) setDrawerOpen(true);
                  else setExpanded((v) => !v);
                }}
                aria-label="Filters"
                sx={(theme) => {
                  const accent = theme.palette.primary.main;
                  const isDark = theme.palette.mode === "dark";

                  return {
                    width: 52,
                    height: 52,
                    borderRadius: 999,

                    background: isDark
                      ? `linear-gradient(180deg, ${accent}cc, ${accent}99)`
                      : `linear-gradient(180deg, ${accent}, ${accent}cc)`,

                    color: theme.palette.getContrastText(accent),

                    boxShadow: isDark
                      ? `0 16px 30px rgba(0,0,0,0.45), 0 10px 22px ${accent}33`
                      : `0 14px 22px rgba(0,0,0,0.12), 0 10px 18px ${accent}22`,

                    transition:
                      "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1)",

                    "&:hover": {
                      transform: "translate3d(0,-1px,0)",
                      boxShadow: isDark
                        ? `0 20px 36px rgba(0,0,0,0.55), 0 12px 26px ${accent}44`
                        : `0 18px 26px rgba(0,0,0,0.16), 0 12px 22px ${accent}33`,
                    },

                    "&:active": {
                      transform: "translate3d(0,0,0) scale(0.98)",
                    },

                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: isDark
                        ? `0 16px 30px rgba(0,0,0,0.45), 0 10px 22px ${accent}33, 0 0 0 4px ${accent}22`
                        : `0 14px 22px rgba(0,0,0,0.12), 0 10px 18px ${accent}22, 0 0 0 4px ${accent}22`,
                    },
                  };
                }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {activeChips.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  onDelete={c.onDelete}
                  variant="outlined"
                  sx={(theme) => ({
                    borderRadius: 999,
                    height: 32,
                    fontWeight: 650,
                    letterSpacing: "-0.01em",
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.12)",
                    "& .MuiChip-deleteIcon": {
                      opacity: 0.75,
                      "&:hover": { opacity: 1 },
                    },
                  })}
                />
              ))}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {resultsText}
            </Typography>
          </Stack>

          {!isMobile ? (
            <Collapse in={expanded} timeout={220} unmountOnExit>
              <Divider sx={{ my: 1 }} />
              <FiltersContent
                value={value}
                allTags={allTags}
                set={set}
                clearAll={clearAll}
              />
            </Collapse>
          ) : null}
        </Stack>
      </Paper>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            p: 2,
          },
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={800}>
              Filters
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {resultsText}
          </Typography>

          <Divider />
          <FiltersContent
            value={value}
            allTags={allTags}
            set={set}
            clearAll={clearAll}
          />
        </Stack>
      </Drawer>
    </>
  );
}
