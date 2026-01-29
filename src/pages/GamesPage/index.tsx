import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import {
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTranslation } from "react-i18next";

import { useDebouncedValue } from "./useDebouncedValue";
import { releaseSortValue } from "./gamesSorting";
import { GamesToolbar, type GamesFiltersState } from "./GamesToolbar";

export function GamesPage() {
  const { t } = useTranslation();
  const { doc, loading, error } = useGames();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GamesFiltersState>({
    query: "",
    status: "all",
    tag: "all",
    sort: "az",
  });

  const debouncedQuery = useDebouncedValue(filters.query, 250);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const g of doc?.games ?? []) {
      for (const tg of g.tags ?? []) set.add(tg);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [doc]);

  const collator = useMemo(
    () => new Intl.Collator(undefined, { sensitivity: "base" }),
    [],
  );

  const sortGames = useMemo(() => {
    return (a: any, b: any) => {
      if (filters.sort === "az") return collator.compare(a.name, b.name);

      if (filters.sort === "daily_first") {
        const aDaily = a.release.status === "recurring_daily" ? 0 : 1;
        const bDaily = b.release.status === "recurring_daily" ? 0 : 1;
        if (aDaily !== bDaily) return aDaily - bDaily;

        const av = releaseSortValue(a, nowMs) ?? 0;
        const bv = releaseSortValue(b, nowMs) ?? 0;
        if (av !== bv) return av - bv;

        return collator.compare(a.name, b.name);
      }

      const av = releaseSortValue(a, nowMs) ?? 0;
      const bv = releaseSortValue(b, nowMs) ?? 0;

      if (filters.sort === "soonest") {
        if (av !== bv) return av - bv;
        return collator.compare(a.name, b.name);
      }

      // latest
      if (av !== bv) return bv - av;
      return collator.compare(a.name, b.name);
    };
  }, [collator, filters.sort, nowMs]);

  const allSortedGames = useMemo(() => {
    const games = doc?.games ?? [];
    return [...games].sort(sortGames);
  }, [doc, sortGames]);

  const filteredAndSortedGames = useMemo(() => {
    const games = doc?.games ?? [];
    const q = debouncedQuery.trim().toLowerCase();

    const filtered = games.filter((g) => {
      if (filters.status !== "all" && g.release.status !== filters.status)
        return false;

      if (filters.tag !== "all" && !(g.tags ?? []).includes(filters.tag))
        return false;

      if (!q) return true;

      const haystack =
        `${g.name ?? ""} ${(g.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort(sortGames);
  }, [doc, debouncedQuery, filters.status, filters.tag, sortGames]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Stack>
    );
  }

  if (error || !doc) {
    return <Alert severity="error">{error ?? t("common.failed_load")}</Alert>;
  }

  const resultsText = t("common.results_count", {
    shown: filteredAndSortedGames.length,
    total: doc.games.length,
  });

  const noMatches = filteredAndSortedGames.length === 0;

  const gamesToRender = noMatches ? allSortedGames : filteredAndSortedGames;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>
        {t("game.all_games")}
      </Typography>

      <GamesToolbar
        value={filters}
        onChange={setFilters}
        allTags={allTags}
        resultsText={resultsText}
      />

      {noMatches ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {t("common.no_results")}
          </Typography>
          <Divider
            sx={(theme) => ({
              my: 1.5,
              backgroundColor: `${theme.palette.primary.main}44`,
            })}
          />
        </Paper>
      ) : null}

      {/* Results */}
      <Grid container spacing={2}>
        {gamesToRender.map((g) => (
          <Grid item xs={12} sm={6} key={g.id}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={700}>
                  {g.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {g.release.status === "tba" && t("game.release_tba")}
                  {g.release.status === "announced_date" &&
                    t("game.release_date", { date: g.release.dateISO })}
                  {g.release.status === "recurring_daily" &&
                    t("game.resets_daily", { time: g.release.timeUTC })}
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => navigate(`/game/${g.id}`)}
                  sx={{ borderRadius: 2, alignSelf: "flex-start" }}
                >
                  {t("game.view_countdown")}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
