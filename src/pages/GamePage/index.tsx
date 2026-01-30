import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import { Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { GameDoc } from "../../lib/types";
import { msLeftForGame } from "../../utils";
import { SuggestedCountdownsIsland } from "./components/SuggestedCountdownsIsland";
import { useTranslation } from "react-i18next";
import {
  pickCoverUrl,
  pickSourcesForDisplay,
  pickTopSources,
  pickTrailers,
} from "./helpers";
import {
  GameError,
  GameLoading,
  GameNotFound,
} from "./components/GameSubComponents";
import { CountdownHeader } from "./components/CountdownHeader";
import { GameHero } from "./components/GameHero";
import { GameLinks } from "./components/GameLinks";
import { FloatingCountdownHUD } from "../../components/FloatingCountdownHUD";

export const GamePage = () => {
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

  const countdownAnchorRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingCountdown, setShowFloatingCountdown] = useState(false);

  useEffect(() => {
    let obs: IntersectionObserver | null = null;
    let raf = 0;

    const tryAttach = () => {
      const el = countdownAnchorRef.current;
      if (!el) {
        raf = window.requestAnimationFrame(tryAttach);
        return;
      }

      obs = new IntersectionObserver(
        ([entry]) => setShowFloatingCountdown(!entry.isIntersecting),
        {
          root: null,
          threshold: 0,
        },
      );

      obs.observe(el);
    };

    tryAttach();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      obs?.disconnect();
    };
  }, []);

  const game = useMemo(() => {
    if (!doc) return null;
    return doc.games.find((g) => g.id === id) ?? null;
  }, [doc, id]);

  const sources = useMemo(() => {
    if (!doc || loading || error || !game) return [];
    return pickSourcesForDisplay(game);
  }, [doc, loading, error, game]);

  const topSources = useMemo(() => pickTopSources(sources, 4), [sources]);

  if (loading) return <GameLoading />;
  if (error || !doc)
    return <GameError message={error ?? t("pages.game.failed_load")} />;

  if (!game) {
    return (
      <GameNotFound
        onBack={() => navigate("/games")}
        labelBack={t("pages.game.all_games")}
        message={t("pages.game.game_not_found")}
      />
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

  const studioWebsite = game.studio?.website;
  const studioName = game.studio?.name ?? t("pages.game.unknown") ?? "Unknown";

  return (
    <Stack spacing={{ xs: 2.5, sm: 3.5 }} sx={{ pb: 4 }}>
      <CountdownHeader
        game={game}
        coverUrl={coverUrl}
        msLeft={msLeft}
        showCountdown={showCountdown}
        isMobile={isMobile}
        onBack={() => navigate("/games")}
        t={t}
        countdownAnchorRef={countdownAnchorRef}
      />

      <GameHero
        game={game}
        coverUrl={coverUrl}
        isMobile={isMobile}
        studioName={studioName}
        studioWebsite={studioWebsite}
        t={t}
      />

      <GameLinks
        trailers={trailers}
        coverUrl={coverUrl}
        sources={sources}
        topSources={topSources}
        isMobile={isMobile}
        t={t}
      />

      <SuggestedCountdownsIsland
        games={suggested}
        nowMs={nowMs}
        onOpen={(gameId) => navigate(`/game/${gameId}`)}
      />

      <Typography variant="caption" color="text.secondary">
        {t("pages.game.last_gen_date", { date: doc.generatedAt })}
      </Typography>

      <FloatingCountdownHUD
        minimal
        topOffset={12}
        visible={showFloatingCountdown && showCountdown}
        msLeft={msLeft}
        label={game.name ?? ""}
        onClick={() => {
          countdownAnchorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "start",
          });
        }}
      />
    </Stack>
  );
};
