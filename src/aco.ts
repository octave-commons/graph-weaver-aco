import type { WeaverUrl } from "./types.js";
import type { Frontier, UrlState } from "./frontier.js";
import { clamp, weightedChoiceIndex } from "./utils.js";

export type AcoChoiceParams = {
  now: number;
  alpha: number;
  beta: number;
  revisitAfterMs: number;
};

function heuristic(state: UrlState, now: number, revisitAfterMs: number): number {
  const novelty = 1 / (1 + state.visits);
  const staleness = state.lastVisitedAt === 0 ? 1 : clamp((now - state.lastVisitedAt) / revisitAfterMs, 0, 1);
  // Mostly novelty; staleness slowly increases revisits.
  return novelty * 0.85 + staleness * 0.25;
}

export function chooseNextUrl(params: {
  frontier: Frontier;
  candidates: WeaverUrl[];
  rng: () => number;
  aco: AcoChoiceParams;
}): WeaverUrl | null {
  const { frontier, candidates, rng, aco } = params;
  if (candidates.length === 0) return null;
  const now = aco.now;

  const alpha = clamp(aco.alpha, 0, 4);
  const beta = clamp(aco.beta, 0, 6);
  const revisitAfterMs = Math.max(1000, aco.revisitAfterMs);

  const weights = candidates.map((url) => {
    const st = frontier.get(url) ?? frontier.ensure(url);
    const tau = Math.max(0.01, st.pheromone);
    const eta = Math.max(0.001, heuristic(st, now, revisitAfterMs));
    return Math.pow(tau, alpha) * Math.pow(eta, beta);
  });

  const idx = weightedChoiceIndex(weights, rng);
  return candidates[idx] ?? candidates[0] ?? null;
}
