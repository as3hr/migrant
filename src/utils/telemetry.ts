import { appContext } from "@src/exports.ts";

/**
 * Lightweight performance telemetry helper for measuring step-by-step execution metrics.
 */
export class PerfTimer {
    private label: string;
    private startTime: number;
    private lastLapTime: number;

    constructor(label: string) {
        this.label = label;
        this.startTime = performance.now();
        this.lastLapTime = this.startTime;
    }

    /** Log a completed step with step duration and cumulative total time. */
    lap(stepName: string): number {
        const now = performance.now();
        const stepMs = Math.round(now - this.lastLapTime);
        const totalMs = Math.round(now - this.startTime);
        appContext.commandCtx?.log(`⏱️ [Perf] ${this.label} ➔ ${stepName}: ${stepMs}ms (Total: ${totalMs}ms)`);
        this.lastLapTime = now;
        return stepMs;
    }

    /** Log total execution time upon completion. */
    stop(summaryName?: string): number {
        const totalMs = Math.round(performance.now() - this.startTime);
        appContext.commandCtx?.log(`⏱️ [Perf] ${this.label} ➔ ${summaryName ?? 'Completed'}: ${totalMs}ms total`);
        return totalMs;
    }
}
