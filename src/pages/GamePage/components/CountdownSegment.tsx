import { Paper, Stack, Typography } from "@mui/material";

interface CountdownSegmentProps {
  label: string;
  value: string;
  compact?: boolean;
  minimal?: boolean;
}

export const CountdownSegment = ({
  label,
  value,
  compact,
  minimal = false,
}: CountdownSegmentProps) => {
  const labelMappings: Record<string, string> = {
    Days: "DAYS",
    Hours: "HRS",
    Minutes: "MINS",
    Seconds: "SECS",
  };

  return (
    <Stack
      spacing={compact ? 0.2 : 0.75}
      alignItems="center"
      sx={{ minWidth: compact ? 32 : 76 }}
    >
      {minimal ? (
        <Typography
          variant={compact ? "body1" : "h3"}
          fontWeight={compact ? 700 : 950}
          sx={{
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: 1,
          }}
        >
          {value}
        </Typography>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            px: compact ? 1.25 : 2,
            py: compact ? 0.75 : 1.1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant={compact ? "body1" : "h3"}
            fontWeight={compact ? 700 : 950}
            sx={{
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 1,
            }}
          >
            {value}
          </Typography>
        </Paper>
      )}
      <Typography
        variant={compact ? "subtitle2" : "caption"}
        color="text.secondary"
        sx={{
          letterSpacing: compact ? 0.1 : 0.9,
          fontSize: compact ? 10 : 12,
        }}
      >
        {compact
          ? labelMappings[label] || label.toUpperCase()
          : label.toUpperCase()}
      </Typography>
    </Stack>
  );
};
