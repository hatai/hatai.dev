---
title: Building an Agent Team Development Flow for Pelway
description: How I run development of my personal project Pelway with a team of AI agents — the role split, canonical docs, merge queue, and the benefits and friction I have actually observed.
date: 2026-11-18
---

I am developing Pelway, a personal project, with a team of AI agents where each role is assigned to a different agent. A conductor, an implementer, a reviewer, and a merge queue handle the work, and I only look at the decision points. This post describes how the flow works, plus the benefits and friction I have observed while running it.

Pelway itself is a service designed to run jobs in a per-task Linux container sandbox. It is not in production yet, but the development flow is already running — and that seemed more worth writing about, so it comes first.

## The Flow

![How a task flows from Issue to merge, and who owns each stage](/img/agent-team-flow.en.svg)

The roles are split like this.

| Role | Owner | What it does |
| --- | --- | --- |
| Conductor | Grok Bot (substitute: a Claude background session) | Triage issues, dispatch instructions to implementation threads, consolidate review results |
| Implementation | GLM (threads on T3 Code) | Implement one issue at a time, leave a fixed-format implementer memo |
| Review | Codex (second review: Claude) | Review PRs; Claude is added on high-risk PRs and a sample of normal ones |
| Merge | Kodiak (hosted merge queue, [Issue #300](https://github.com/hatai/Pelway/issues/300)) | Take in PRs that pass |
| Judgment | Human (me) | Only three things: attach ready-for-agent, merge, decide direction |

While the conductor is stopped by its weekly session limit, Claude takes over; the handoff procedure is canonicalized in the spec and a runbook.

A task flows in this order. An issue is filed, and anything splittable is broken into sub-issues. Once I attach ready-for-agent, the conductor dispatches it to a GLM implementation thread, the resulting PR is reviewed by Codex, and whatever passes enters the merge queue and gets merged.

## Mechanisms That Make It Work

Four pieces that should transfer if you want to reproduce this.

**Canonicalization**: handoff procedures, role assignments, and operational rules live in the spec, runbooks, AGENTS.md, and shared skills. Agent memory does not carry across sessions, so anything not written down disappears. Even small rules are systematized — for example, human-facing messages must always render issue and PR numbers as full URL links ([Issue #303](https://github.com/hatai/Pelway/issues/303)). For development skills I adopted [mattpocock/skills](https://github.com/mattpocock/skills).

**Implementer memo**: a fixed-format memo that the GLM thread leaves after every task. The fields are: stuck points, ambiguities, assumptions, gaps, and proposals for skills or AGENTS.md. The skeleton looks like this.

```
## Implementer memo
- Stuck points:
- Ambiguities:
- Assumptions:
- Gaps:
- Proposals for skills / AGENTS.md:
```

With this memo, the conductor can issue the next instruction without holding the thread's context.

**Review attribution**: review results must state the assignee, model name, and effort in a fixed format. Which model and effort a PR goes to is decided by its contents — size, changed paths, labels, and the number of review round-trips.

**Separate merge queue**: to keep GLM implementation slots from clogging on merge waits, merge handling was split off into Kodiak.

## Benefits and Friction (Observed)

Only things that actually happened, not predictions.

| Aspect | Benefit | Downside / friction |
| --- | --- | --- |
| Parallelism | Implementation, review, and investigation run in parallel; nothing stalls on a single pending review | The rate limit does not disappear — it moves; once implementation sped up, review and the merge queue clogged |
| Canonical docs | Decisions persist in ADRs, the spec, and shared skills, so no long re-briefings between agents | Rules vanish unless written down, and the upkeep is constant |
| Division of labor | Work splits by model strength (GLM implements, Codex reviews, Claude gives second opinions) | Several subscription usage limits have to be managed at once |
| Human load | I only have to focus on the decision points | The conductor is a single point of failure and stops at its session limit |

As countermeasures, I wrote the substitute procedure into a runbook and made the merge queue independent of the GLM implementation slots. But a documented procedure does not guarantee mutual exclusion — the primary and the substitute actually reviewed the same PR ([#155](https://github.com/hatai/Pelway/pull/155)) at the same time. The congestion only relocated, the rate limit itself remains, and the constant effort of writing canonical docs is honestly heavy.

![The rate limit moving from implementation to review to the merge queue](/img/bottleneck-moves.en.svg)

## One Artifact from the Flow: ADR 0012

An example of what this flow produces. ADR 0012 fixes the production topology to a single host running Docker Compose, a Caddy reverse proxy, and systemd timers ([PR #429](https://github.com/hatai/Pelway/pull/429)).

The content splits the networks into edge, app, data, and sandbox, with Postgres unreachable from the sandbox. It went through this flow's exact path: filed as an issue, labeled ready-for-agent, implemented by GLM (the ADR text plus a structural test that checks existence and link resolution), then reviewed by Codex.

This flow itself will keep changing, and I will write about it again when it does. If you have questions, feel free to reach me at [me@hatai.dev](mailto:me@hatai.dev).
