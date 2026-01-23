/* =========================================================
   Updated types to support:
   - release classification (full game / DLC / season / etc.)
   - official vs rumor + sources
   - platforms per item
   - trailers (urls)
   - studio metadata
   - cover as URL or base64 (optional)
   - popularity sorting fields
   - (NEW) deterministic "remove released items" support:
     - explicit released date (required)
     - optional asOf in the doc
     - optional region/platform qualifiers per release record
     - optional cancelled/delayed statuses
   ========================================================= */

/* -------------------------
   Shared primitives
   ------------------------- */

export type ISODate = string; // e.g. "2026-03-27" (YYYY-MM-DD)
export type ISODateTime = string; // e.g. "2026-01-20T00:00:00Z"

export type DatePrecision = "day" | "month" | "quarter" | "year";
export type ReleaseConfidence = "confirmed" | "likely" | "rumor" | "unknown";

/** Optional: release geography granularity */
export type Region = "global" | "us" | "eu" | "jp" | "au" | "other";

/** When you need "as-of" time for filtering */
export type AsOf = ISODateTime;

/* -------------------------
   Platforms
   ------------------------- */

export type Platform =
  | "pc"
  | "ps5"
  | "ps4"
  | "xbox_series"
  | "xbox_one"
  | "switch"
  | "switch_2"
  | "ios"
  | "android"
  | "vr"
  | "other";

/* -------------------------
   Sources (official/rumor attribution)
   ------------------------- */

export type SourceType =
  | "official_website"
  | "publisher_site"
  | "developer_site"
  | "platform_store"
  | "press_release"
  | "twitter_x"
  | "youtube"
  | "discord"
  | "gaming_news"
  | "gaming_blog"
  | "forum"
  | "reddit"
  | "leak_aggregator"
  | "other";

export type Source = {
  type: SourceType;
  /** True if controlled by developer/publisher/platform owner */
  isOfficial: boolean;
  /** Human-readable name: "Rockstar Games", "Steam", "PlayStation Blog", "Reddit r/..." */
  name: string;
  /** Optional link to the source */
  url?: string;
  /** When you recorded/fetched it */
  retrievedAt?: ISODateTime;
  /** Short description of what this source claims */
  claim?: string;

  /** Optional social metadata */
  authorHandle?: string; // e.g. "@FortniteGame"
  excerpt?: string;
  reliability?: "high" | "medium" | "low" | "unknown";
};

/* -------------------------
   Media (cover + trailers)
   ------------------------- */

export type ImageAsset =
  | {
      kind: "url";
      url: string;
      mime?: string;
      width?: number;
      height?: number;
    }
  | {
      kind: "base64";
      mime: string; // required for base64
      /** Base64 bytes (no data: prefix) */
      data: string;
      width?: number;
      height?: number;
    };

export type TrailerPlatform =
  | "youtube"
  | "twitter_x"
  | "twitch"
  | "official_site"
  | "other";

export type TrailerLink = {
  url: string;
  label?: string; // "Reveal Trailer", "Gameplay Trailer", etc.
  platform?: TrailerPlatform;
};

export type Media = {
  cover?: ImageAsset;
  trailers?: TrailerLink[];
  /** Keep this if you still want a simple compatibility field */
  coverUrl?: string; // deprecated (prefer media.cover)
};

/* -------------------------
   Studio
   ------------------------- */

export type StudioLocation = {
  city?: string;
  region?: string; // state/province
  country?: string;
  hq?: boolean;
};

export type StudioType =
  | "developer"
  | "publisher"
  | "developer_publisher"
  | "unknown";

export type Studio = {
  name: string | null;
  type: StudioType;
  location?: StudioLocation | null;
  website?: string;
  description?: string;
  parentCompany?: string;
};

/* -------------------------
   Category (full game / dlc / season / etc.)
   ------------------------- */

export type CategoryType =
  | "full_game"
  | "dlc"
  | "season"
  | "event"
  | "update"
  | "store_reset"
  | "other";

export type Category = {
  type: CategoryType;
  subtype?: string;
  franchise?: string;
  label?: string;
};

/* Optional details for DLC/season. Include only when relevant. */
export type DLCDetails = {
  name: string;
  kind?:
    | "expansion"
    | "story_pack"
    | "season_pass"
    | "cosmetic_pack"
    | "bundle"
    | "other";
  requiresBaseGame?: boolean;
  platforms?: Platform[];
  includedWith?: string[];
  description?: string;
};

export type SeasonDetails = {
  name?: string;
  number?: number;
  chapter?: number;
  battlePass?: boolean;
  theme?: string;
};

/* -------------------------
   Release (expanded)
   ------------------------- */

export type ReleaseBase = {
  /**
   * Whether the *release info* is official.
   * You can compute this from sources[] in your pipeline,
   * but storing it makes filtering fast.
   */
  isOfficial: boolean;
  confidence: ReleaseConfidence;

  /** Optional: last update timestamp for this release object */
  updatedAt?: ISODateTime;

  /**
   * Optional: sources that specifically support THIS release record.
   * (Useful if Game.sources includes lots of unrelated refs like trailers, studio pages, etc.)
   */
  sources?: Source[];

  /**
   * Optional qualifiers:
   * - region: if the date/window applies only to a geography
   * - platforms: if this date/window applies only to certain platforms
   */
  region?: Region;
  platforms?: Platform[];
};

export type ReleaseTBA = ReleaseBase & {
  status: "tba";
};

export type ReleaseAnnouncedDate = ReleaseBase & {
  status: "announced_date";
  dateISO: ISODate; // "YYYY-MM-DD"
  /**
   * If omitted, consumers can treat it as "day" for strict dates.
   * Keep it optional to reduce data entry burden.
   */
  datePrecision?: DatePrecision;
};

export type ReleaseAnnouncedWindow = ReleaseBase & {
  status: "announced_window";
  window: {
    year?: number;
    quarter?: 1 | 2 | 3 | 4;
    month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    label?: string; // e.g. "2026", "2026-Q4", "Spring 2026"
  };
};

export type ReleaseRecurringDaily = ReleaseBase & {
  status: "recurring_daily";
  timeUTC: string; // "HH:MM" (UTC)
};

export type ReleaseRecurringWeekly = ReleaseBase & {
  status: "recurring_weekly";
  /** 0 (Sunday) - 6 (Saturday) */
  dayOfWeekUTC: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeUTC: string; // "HH:MM" (UTC)
};

/**
 * KEY CHANGE:
 * If status is "released", require a dateISO so you can reliably filter released items.
 */
export type ReleaseReleased = ReleaseBase & {
  status: "released";
  /** Actual release date (required for deterministic filtering) */
  dateISO: ISODate;
  /** Optional: exact timestamp if known */
  releasedAt?: ISODateTime;
};

/** Optional but useful in real-world datasets */
export type ReleaseCancelled = ReleaseBase & {
  status: "cancelled";
  /** Optional: when it was cancelled (YYYY-MM-DD) */
  dateISO?: ISODate;
  reason?: string;
};

export type ReleaseDelayed = ReleaseBase & {
  status: "delayed";
  previous?: {
    dateISO?: ISODate;
    windowLabel?: string;
  };
  note?: string;
};

export type GameRelease =
  | ReleaseTBA
  | ReleaseAnnouncedDate
  | ReleaseAnnouncedWindow
  | ReleaseRecurringDaily
  | ReleaseRecurringWeekly
  | ReleaseReleased
  | ReleaseCancelled
  | ReleaseDelayed;

export type ReleaseStatus = GameRelease["status"];

/* -------------------------
   Popularity (for sorting)
   ------------------------- */

export type PopularityTier =
  | "blockbuster"
  | "very_popular_live_service"
  | "popular"
  | "niche"
  | "unknown_or_rumor";

/**
 * Optional: single-field classification to simplify filtering in clients.
 * You can compute this from release.status in your pipeline.
 */
export type Availability = "upcoming" | "released" | "cancelled" | "unknown";

/* -------------------------
   Main Game item
   ------------------------- */

export type Game = {
  id: string;

  /**
   * Display name for the entry (can be "Fortnite — Season X", "GTA VI", etc.)
   */
  name: string;

  /**
   * Canonical title (optional). Useful if name is a specific release item.
   * Example: name="Fortnite — Chapter 6 Season 3", title="Fortnite"
   */
  title?: string;

  tags?: string[];

  /** New: structured category */
  category: Category;

  /** New: platform list (for filtering) */
  platforms: Platform[];

  /** New: richer media model (cover + trailers) */
  media?: Media;

  /**
   * Kept for backward compatibility with your earlier data.
   * Prefer media.cover.kind==="url" instead.
   */
  coverUrl?: string;

  /** Release details */
  release: GameRelease;

  /**
   * Optional: computed helper for clients.
   * If present, should match release.status semantics.
   */
  availability?: Availability;

  /** Attribution (general) */
  sources: Source[];

  /** Studio metadata */
  studio?: Studio;

  /** Optional: DLC/season specifics when relevant */
  dlc?: DLCDetails;
  season?: SeasonDetails;

  /** New: sorting helpers */
  popularityTier?: PopularityTier;
  popularityRank?: number;
};

export type GamesDoc = {
  /** When this document was generated */
  generatedAt: ISODateTime;

  /**
   * Optional: moment you consider "released vs upcoming" for filtering.
   * Usually same as generatedAt, but explicitly storing it makes behavior deterministic.
   */
  asOf?: AsOf;

  schemaVersion: string;
  games: Game[];
};

export type GameDoc = GamesDoc;
