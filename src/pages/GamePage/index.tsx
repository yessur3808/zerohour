import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LaunchIcon from "@mui/icons-material/Launch";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ComputerIcon from "@mui/icons-material/Computer";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import PublicIcon from "@mui/icons-material/Public";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import {
  GameDoc,
  Platform,
  Source,
  Game,
  TrailerLink,
  ImageAsset,
} from "../../lib/types";
import { msLeftForGame, releaseMetaLabel } from "../../utils";
import { NiceCountdown } from "./NiceCountdown";
import { SuggestedCountdownsIsland } from "./SuggestedCountdownsIsland";
import { Cover } from "./Cover";
import { Trans, useTranslation } from "react-i18next";

/* -------------------------
   Small helpers (typed)
   ------------------------- */

function platformLabel(p: Platform): string {
  switch (p) {
    case "pc":
      return "PC";
    case "ps5":
      return "PS5";
    case "ps4":
      return "PS4";
    case "xbox_series":
      return "Xbox Series";
    case "xbox_one":
      return "Xbox One";
    case "switch":
      return "Switch";
    case "switch_2":
      return "Switch 2";
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "vr":
      return "VR";
    default:
      return "Other";
  }
}

function platformIcon(p: Platform) {
  switch (p) {
    case "pc":
      return <ComputerIcon fontSize="small" />;
    case "ios":
    case "android":
      return <SmartphoneIcon fontSize="small" />;
    case "ps5":
    case "ps4":
    case "xbox_series":
    case "xbox_one":
    case "switch":
    case "switch_2":
      return <VideogameAssetIcon fontSize="small" />;
    default:
      return <SportsEsportsIcon fontSize="small" />;
  }
}

function sourceIcon(s: Source) {
  return s.isOfficial ? (
    <PublicIcon fontSize="small" />
  ) : (
    <NewspaperIcon fontSize="small" />
  );
}

function categoryText(game: Game): string {
  const { category } = game;
  const base =
    category.label ??
    (category.type === "full_game"
      ? "Full game"
      : category.type === "dlc"
        ? "DLC"
        : category.type === "season"
          ? "Season"
          : category.type === "event"
            ? "Event"
            : category.type === "update"
              ? "Update"
              : category.type === "store_reset"
                ? "Store reset"
                : "Other");

  return category.subtype ? `${base} · ${category.subtype}` : base;
}

function releasePrimaryChipLabel(
  game: Game,
  t: (k: string, opts?: Record<string, unknown>) => string,
): string {
  const st = game.release.status;
  if (st === "announced_date" || st === "announced_window")
    return t("pages.game.release");
  if (st === "recurring_daily" || st === "recurring_weekly")
    return t("pages.game.resets_daily");
  if (st === "released") return t("pages.game.released") ?? "Released";
  if (st === "cancelled") return t("pages.game.cancelled") ?? "Cancelled";
  if (st === "delayed") return t("pages.game.delayed") ?? "Delayed";
  return t("pages.game.tba");
}

function releaseSecondaryLine(game: Game): string | null {
  const r = game.release;
  switch (r.status) {
    case "announced_date":
      return r.dateISO;
    case "released":
      return `Released: ${r.dateISO}`;
    case "announced_window":
      return r.window.label ?? "Release window";
    case "recurring_daily":
      return `Daily · ${r.timeUTC} UTC`;
    case "recurring_weekly":
      return `Weekly · ${r.dayOfWeekUTC} @ ${r.timeUTC} UTC`;
    case "cancelled":
      return r.dateISO ? `Cancelled: ${r.dateISO}` : "Cancelled";
    case "delayed":
      return r.note ?? "Delayed";
    default:
      return null;
  }
}

function coverAssetToUrl(asset: ImageAsset): string {
  if (asset.kind === "url") return asset.url;
  // base64
  return `data:${asset.mime};base64,${asset.data}`;
}

function pickCoverUrl(game: Game): string | null {
  if (game.media?.cover) return coverAssetToUrl(game.media.cover);
  // legacy fallback
  return game.coverUrl ?? game.media?.coverUrl ?? null;
}

function pickTrailers(game: Game): TrailerLink[] {
  return game.media?.trailers ?? [];
}

function pickSourcesForDisplay(game: Game): Source[] {
  // Prefer release-specific sources if provided; fall back to general sources
  const releaseSources = game.release.sources ?? [];
  const all = [...releaseSources, ...game.sources];

  // De-dupe by url+name+type
  const seen = new Set<string>();
  const deduped: Source[] = [];
  for (const s of all) {
    const key = `${s.url ?? ""}::${s.name}::${s.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }
  return deduped;
}

function pickTopSources(sources: Source[], max: number): Source[] {
  const copy = [...sources];
  copy.sort((a, b) => {
    // official first
    const ao = a.isOfficial ? 0 : 1;
    const bo = b.isOfficial ? 0 : 1;
    if (ao !== bo) return ao - bo;

    // with url first
    const au = a.url ? 0 : 1;
    const bu = b.url ? 0 : 1;
    if (au !== bu) return au - bu;

    return a.name.localeCompare(b.name);
  });
  return copy.slice(0, max);
}

/* -------------------------
   Page
   ------------------------- */

export function GamePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { doc, loading, error } = useGames() as {
    doc: GameDoc | null;
    loading: boolean;
    error: string | null;
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const it = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(it);
  }, []);

  const sources = useMemo(() => {
    if (!doc || loading || error) return [];
    const gameObj = doc.games.find((g) => g.id === id);
    if (!gameObj) return [];
    return pickSourcesForDisplay(gameObj);
  }, [doc, loading, error, id]);
  const topSources = useMemo(() => pickTopSources(sources, 4), [sources]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !doc) {
    return (
      <Alert severity="error">{error ?? t("pages.game.failed_load")}</Alert>
    );
  }

  const game = doc.games.find((g) => g.id === id);

  if (!game) {
    return (
      <Alert
        severity="warning"
        action={
          <Button onClick={() => navigate("/games")}>
            {t("pages.game.all_games")}
          </Button>
        }
      >
        {t("pages.game.game_not_found")}
      </Alert>
    );
  }

  const msLeft = msLeftForGame(game, nowMs) ?? null;
  const suggested = doc.games.filter((g) => g.id !== game.id).slice(0, 6);

  const coverUrl = pickCoverUrl(game);
  const trailers = pickTrailers(game);

  const showCountdown =
    game.release.status === "announced_date" ||
    game.release.status === "recurring_daily" ||
    game.release.status === "recurring_weekly";

  // const hasStudioWebsite = Boolean(game.studio?.website);
  const studioWebsite = game.studio?.website;
  const studioName = game.studio?.name ?? t("pages.game.unknown") ?? "Unknown";

  return (
    <Stack spacing={{ xs: 2.5, sm: 3.5 }} sx={{ pb: 4 }}>
      {/* HERO (modern, minimal; no Paper) */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
              : "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))",
        }}
      >
        {/* Cover */}
        {coverUrl ? (
          <Box sx={{ position: "relative" }}>
            <Cover
              src={coverUrl}
              alt={game.name}
              height={isMobile ? 220 : 340}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.25) 100%)",
                pointerEvents: "none",
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: isMobile ? 80 : 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
                  : "linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.01))",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("pages.game.no_cover") ?? "No cover available"}
            </Typography>
          </Box>
        )}

        {/* Header content */}
        <Stack spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight={950}
                sx={{ lineHeight: 1.1, wordBreak: "break-word" }}
              >
                {game.name}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ rowGap: 1 }}
              >
                <Chip
                  label={releasePrimaryChipLabel(game, t)}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  label={categoryText(game)}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  label={
                    game.release.isOfficial
                      ? (t("pages.game.official") ?? "Official")
                      : (t("pages.game.unofficial") ?? "Unofficial")
                  }
                  size="small"
                  color={game.release.isOfficial ? "success" : "warning"}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  label={`${t("pages.game.confidence") ?? "Confidence"}: ${game.release.confidence}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Stack>

              {game.title &&
              game.title.trim().toLowerCase() !==
                game.name.trim().toLowerCase() ? (
                <Typography variant="body2" color="text.secondary">
                  {t("pages.game.title") ?? "Title"}: {game.title}
                </Typography>
              ) : null}

              <Typography variant="body2" color="text.secondary">
                {releaseMetaLabel(game)}
                {releaseSecondaryLine(game)
                  ? ` · ${releaseSecondaryLine(game)}`
                  : ""}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                onClick={() => navigate("/games")}
                sx={{ borderRadius: 2 }}
              >
                {t("pages.game.all_games")}
              </Button>
            </Stack>
          </Stack>

          {/* Info row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            {/* Platforms */}
            <Stack spacing={0.75} sx={{ width: "100%" }}>
              <Typography variant="overline" color="text.secondary">
                {t("pages.game.platforms") ?? "Platforms"}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {game.platforms?.length && game.platforms?.length > 0 ? (
                  game.platforms
                    .slice(0, 10)
                    .map((p) => (
                      <Chip
                        key={p}
                        icon={platformIcon(p)}
                        label={platformLabel(p)}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))
                ) : (
                  <Chip
                    label={t("pages.game.platforms_unknown") ?? "Unknown"}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                )}
              </Stack>
            </Stack>

            {/* Studio */}
            <Stack spacing={0.75} sx={{ width: "100%" }}>
              <Typography variant="overline" color="text.secondary">
                {t("pages.game.studio") ?? "Studio"}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  label={studioName}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />

                {studioWebsite ? (
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<LaunchIcon fontSize="small" />}
                    href={studioWebsite}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ borderRadius: 2 }}
                  >
                    {t("pages.game.website") ?? "Website"}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* COUNTDOWN */}
      <Box
        sx={{
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              {game.release.status === "announced_date"
                ? t("pages.game.time_until_release")
                : game.release.status === "recurring_daily" ||
                    game.release.status === "recurring_weekly"
                  ? t("pages.game.next_reset")
                  : t("pages.game.release_date")}
            </Typography>

            {game.release.status === "announced_date" ? (
              <Typography variant="body2" color="text.secondary">
                {t("pages.game.day_precision_date", {
                  date: game.release.dateISO,
                })}
              </Typography>
            ) : null}

            {game.release.status === "released" ? (
              <Typography variant="body2" color="text.secondary">
                {t("pages.game.released_on", { date: game.release.dateISO }) ??
                  `Released on ${game.release.dateISO}`}
              </Typography>
            ) : null}
          </Stack>

          {showCountdown ? (
            <NiceCountdown msLeft={msLeft} compact={false} />
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {t("pages.game.no_countdown") ??
                "No countdown available for this item."}
            </Typography>
          )}

          <Divider />

          <Trans
            i18nKey="pages.game.tip"
            values={{ coverUrl: "" }}
            components={{
              code: (
                <code>
                  <img src={coverUrl ?? "./placeholder.png"} alt="" />
                </code>
              ),
            }}
          />
        </Stack>
      </Box>

      {/* LINKS: trailers + sources */}
      {(trailers.length > 0 || topSources.length > 0) && (
        <Box
          sx={{
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Stack spacing={2.25}>
            {trailers.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  {t("pages.game.trailers") ?? "Trailers"}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {trailers.slice(0, 4).map((tr, idx) => (
                    <Button
                      key={`${tr.url}-${idx}`}
                      variant="outlined"
                      size="small"
                      href={tr.url}
                      target="_blank"
                      rel="noreferrer"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ borderRadius: 2 }}
                    >
                      {tr.label ??
                        `${t("pages.game.trailer") ?? "Trailer"} ${idx + 1}`}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}

            {topSources.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  {t("pages.game.sources") ?? "Sources"}
                </Typography>

                <Stack spacing={1}>
                  {topSources.map((s, idx) => (
                    <Stack
                      key={`${s.url ?? s.name}-${idx}`}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        borderRadius: 3,
                        px: 1.25,
                        py: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "text.secondary",
                        }}
                      >
                        {sourceIcon(s)}
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                          noWrap
                        >
                          {s.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {(s.isOfficial ? "Official" : "Community/press") +
                            (s.type ? ` · ${s.type}` : "")}
                        </Typography>
                      </Box>

                      {s.url ? (
                        <Link
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          underline="none"
                          sx={{ display: "inline-flex", alignItems: "center" }}
                        >
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<OpenInNewIcon fontSize="small" />}
                            sx={{ borderRadius: 2 }}
                          >
                            {t("pages.game.open") ?? "Open"}
                          </Button>
                        </Link>
                      ) : null}
                    </Stack>
                  ))}
                </Stack>

                {sources.length > topSources.length ? (
                  <Typography variant="caption" color="text.secondary">
                    {t("pages.game.more_sources", {
                      count: sources.length - topSources.length,
                    }) ?? `+${sources.length - topSources.length} more`}
                  </Typography>
                ) : null}
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      <SuggestedCountdownsIsland
        games={suggested}
        nowMs={nowMs}
        onOpen={(gameId) => navigate(`/game/${gameId}`)}
      />

      <Typography variant="caption" color="text.secondary">
        {t("pages.game.last_gen_date", { date: doc.generatedAt })}
      </Typography>
    </Stack>
  );
}
