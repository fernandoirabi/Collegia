// ============================================================
// COLLEGIA — PERF INSTRUMENTATION (optional, dev-friendly)
//
// Lightweight per-stage timing used to identify and verify the
// College Match pipeline bottlenecks. Logs are emitted ONLY when
// explicitly enabled (NODE_ENV !== "production" OR PERF_TRACE=1),
// so production requests never pay for console spam.
//
// This is safe, additive instrumentation — it never changes any
// match computation or its result.
// ============================================================

const enabled = (): boolean =>
  process.env.NODE_ENV !== "production" || process.env.PERF_TRACE === "1";

export class PerfTrace {
  private readonly label: string;
  private readonly startedAt: number;
  private readonly marks: { name: string; at: number }[];

  constructor(label: string) {
    this.label = label;
    this.startedAt = performance.now();
    this.marks = [];
  }

  mark(name: string): void {
    if (!enabled()) return;
    this.marks.push({ name, at: performance.now() });
  }

  done(): void {
    if (!enabled()) return;
    const total = performance.now() - this.startedAt;
    const parts = this.marks.map((m, i) => {
      const prev = i === 0 ? this.startedAt : this.marks[i - 1].at;
      return `${m.name}=${Math.round(m.at - prev)}ms`;
    });
    // eslint-disable-next-line no-console
    console.log(`[perf] ${this.label} total=${Math.round(total)}ms ${parts.join(" ")}`);
  }
}
