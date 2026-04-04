# @workspace/graph-weaver-aco

A tiny, polite web graph weaver (crawler) inspired by **ant colony optimization**:

- multiple “ants” walk a growing hyperlink graph
- selection is novelty-biased, but allows revisits (staleness-aware)
- slow + steady dispatch cadence (designed to grow a graph forever)
- basic robots.txt respect + per-host pacing

This package is intentionally dependency-free and small.

## Concepts

- **Frontier**: discovered URLs with visit metadata.
- **Ants**: agents that choose the next URL from the current node’s out-links.
- **ACO-ish choice**: weight = pheromone^α × heuristic^β.
- **Heuristic**: novelty + staleness (prefer new, occasionally recheck old).

## API

```ts
import { GraphWeaverAco } from "@workspace/graph-weaver-aco";

const weaver = new GraphWeaverAco({
  ants: 4,
  dispatchIntervalMs: 15000,
});

weaver.onEvent((ev) => {
  if (ev.type === "page") {
    console.log(ev.url, ev.status, ev.outgoing.length);
  }
});

weaver.seed(["https://example.com/"]);
weaver.start();
```
