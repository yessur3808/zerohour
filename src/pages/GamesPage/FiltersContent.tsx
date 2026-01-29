import { useTranslation } from "react-i18next";
import { GamesFiltersState } from "./GamesToolbar";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { SortKey, StatusFilter } from "./gamesSorting";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SortIcon from "@mui/icons-material/Sort";

interface FiltersContentProps {
  value: GamesFiltersState;
  allTags: string[];
  set: (newValues: Partial<GamesFiltersState>) => void;
  clearAll: () => void;
}

export const FiltersContent = ({
  value,
  allTags,
  set,
  clearAll,
}: FiltersContentProps) => {
  const { t } = useTranslation();

  const isDefault = (v: GamesFiltersState) =>
    v.query === "" && v.status === "all" && v.tag === "all" && v.sort === "az";

  const selectSx = (theme: any) => {
    const isDark = theme.palette.mode === "dark";
    const accent = theme.palette.primary.main;

    return {
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },

      background: isDark
        ? "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))"
        : "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",

      boxShadow: isDark
        ? "inset 0 1px 0 rgba(255,255,255,0.08)"
        : "inset 0 1px 0 rgba(255,255,255,0.7)",

      outline: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.06)",

      "&:hover": {
        outline: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.10)",
      },

      "&.Mui-focused": {
        outline: `1px solid ${accent}55`,
        boxShadow: isDark
          ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 4px ${accent}22`
          : `0 0 0 4px ${accent}22`,
      },
    };
  };

  const menuProps = {
    PaperProps: {
      sx: (theme: any) => ({
        mt: 1,
        overflow: "hidden",

        bgcolor: theme.palette.background.paper,
        backgroundImage: "none",
        backdropFilter: "none",
        opacity: 1,

        boxShadow:
          theme.palette.mode === "dark"
            ? "0 18px 50px rgba(0,0,0,0.65)"
            : "0 18px 50px rgba(0,0,0,0.18)",

        outline:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(0,0,0,0.08)",
      }),
    },
  } as const;

  return (
    <Stack spacing={1.5} sx={{ pt: 0.25 }}>
      {/* Status */}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {(
          [
            ["all", t("common.all")],
            ["announced_date", t("game.filter_release_date")],
            ["recurring_daily", t("game.filter_daily_reset")],
            ["tba", t("game.filter_tba")],
          ] as Array<[StatusFilter, string]>
        ).map(([k, label]) => {
          const selected = value.status === k;

          return (
            <Chip
              key={k}
              label={label}
              clickable
              onClick={() => set({ status: k })}
              color={selected ? "primary" : "default"}
              variant="outlined"
              sx={(theme) => {
                const isDark = theme.palette.mode === "dark";
                const accent = theme.palette.primary.main;

                return {
                  fontWeight: 650,
                  letterSpacing: "-0.01em",
                  height: 34,
                  ...(selected
                    ? {
                        boxShadow: isDark
                          ? `0 12px 24px rgba(0,0,0,0.45), 0 10px 18px ${accent}22`
                          : `0 10px 18px rgba(0,0,0,0.10), 0 8px 14px ${accent}18`,
                      }
                    : {
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,0,0,0.10)",
                        "&:hover": {
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.04)",
                        },
                      }),
                  transition:
                    "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1), background-color 180ms cubic-bezier(0.16,1,0.3,1)",
                  "&:active": { transform: "scale(0.98)" },
                };
              }}
            />
          );
        })}
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        {/* Tag */}
        {allTags.length > 0 ? (
          <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
            <InputLabel>
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <LocalOfferOutlinedIcon fontSize="small" />
                {t("common.tag")}
              </Box>
            </InputLabel>
            <Select
              label={t("common.tag")}
              value={value.tag}
              onChange={(e) => set({ tag: String(e.target.value) })}
              MenuProps={menuProps}
              sx={selectSx}
            >
              <MenuItem value="all">{t("common.all_tags")}</MenuItem>
              {allTags.map((tg) => (
                <MenuItem key={tg} value={tg}>
                  {tg}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
          <InputLabel>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <SortIcon fontSize="small" />
              {t("common.sort_by")}
            </Box>
          </InputLabel>
          <Select
            label={t("common.sort_by")}
            value={value.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            MenuProps={menuProps}
            sx={selectSx}
          >
            <MenuItem value="az">{t("common.sort_az")}</MenuItem>
            <MenuItem value="soonest">{t("common.sort_soonest")}</MenuItem>
            <MenuItem value="latest">{t("common.sort_latest")}</MenuItem>
            <MenuItem value="daily_first">
              {t("common.sort_daily_first")}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={clearAll}
          disabled={isDefault(value)}
          sx={(theme) => ({
            height: 40,
            px: 2,
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.16)"
                : "rgba(0,0,0,0.12)",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
            },
          })}
        >
          {t("common.clear")}
        </Button>
      </Stack>
    </Stack>
  );
};
