import { Stack, Typography } from "@mui/material";
import { CountdownSegment } from "./CountdownSegment";
import { pad2, splitMs } from "../../../utils";

interface NiceCountdownProps {
  msLeft: number | null;
  compact?: boolean;
  minimal?: boolean;
}

export const NiceCountdown = ({
  msLeft,
  compact,
  minimal,
}: NiceCountdownProps) => {
  if (msLeft === null) {
    return (
      <Stack spacing={0.5}>
        <Typography variant={compact ? "h6" : "h4"} fontWeight={950}>
          TBA
        </Typography>
        {!compact && (
          <Typography variant="body2" color="text.secondary">
            No release window yet.
          </Typography>
        )}
      </Stack>
    );
  }

  if (msLeft <= 0) {
    return (
      <Stack spacing={0.5}>
        <Typography variant={compact ? "h6" : "h4"} fontWeight={950}>
          Released
        </Typography>
        {!compact && (
          <Typography variant="body2" color="text.secondary">
            This countdown reached zero.
          </Typography>
        )}
      </Stack>
    );
  }

  const { d, h, m, s } = splitMs(msLeft);

  return (
    <Stack
      direction="row"
      spacing={compact ? 1 : 1.5}
      alignItems="flex-start"
      flexWrap="wrap"
    >
      <CountdownSegment
        label="Days"
        value={String(d)}
        compact={compact}
        minimal={minimal}
      />
      <Typography
        aria-hidden
        sx={{
          mt: compact ? 1.15 : 1.45,
          color: "text.secondary",
          fontWeight: 400,
        }}
      >
        :
      </Typography>
      <CountdownSegment
        label="Hours"
        value={pad2(h)}
        compact={compact}
        minimal={minimal}
      />
      <Typography
        aria-hidden
        sx={{
          mt: compact ? 1.15 : 1.45,
          color: "text.secondary",
          fontWeight: 800,
        }}
      >
        :
      </Typography>
      <CountdownSegment
        label="Minutes"
        value={pad2(m)}
        compact={compact}
        minimal={minimal}
      />
      <Typography
        aria-hidden
        sx={{
          mt: compact ? 1.15 : 1.45,
          color: "text.secondary",
          fontWeight: 800,
        }}
      >
        :
      </Typography>
      <CountdownSegment
        label="Seconds"
        value={pad2(s)}
        compact={compact}
        minimal={minimal}
      />
    </Stack>
  );
};
