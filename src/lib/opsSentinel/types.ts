export type ProbeStatus = "ok" | "down" | "skipped";
export type ProbeSeverity = "critical" | "important" | "secondary";
export type SentinelOverall = "ok" | "degraded" | "down";

export type SentinelProbe = {
  id: string;
  label: string;
  severity: ProbeSeverity;
  status: ProbeStatus;
  ms: number;
  detail?: string;
};

export type SentinelReport = {
  ok: boolean;
  overall: SentinelOverall;
  checkedAt: string;
  probes: SentinelProbe[];
  alerted: boolean;
  source: "vercel" | "merged";
};
