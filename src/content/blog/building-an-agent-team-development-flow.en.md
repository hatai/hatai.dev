---
title: Building an Agent Team Development Flow for Pelway
description: How I run development of my personal project Pelway with a team of AI agents — the role split, canonical docs, merge queue, and the benefits and friction I have actually observed.
date: 2026-11-18
---

I am developing Pelway, a personal project, with a team of AI agents where each role is assigned to a different agent. A conductor, an implementer, a reviewer, and a merge queue handle the work, and I only look at the decision points. This post describes how the flow works, plus the benefits and friction I have observed while running it.

Pelway itself is a service designed to run jobs in a per-task Linux container sandbox. It is not in production yet, but the development flow is already running — and that seemed more worth writing about, so it comes first.

## The Flow

The roles are split like this.

- **Conductor**: Grok Bot is the primary. It triages issues, dispatches instructions to implementation threads, and consolidates review results. While it is stopped by its weekly session limit, a Claude background session takes over; the handoff procedure is canonicalized in the spec and a runbook.
- **Implementation**: GLM threads on T3 Code. One thread per issue implements the change and leaves a fixed-format implementer memo every time.
- **Review**: Codex is the primary reviewer. High-risk PRs and a sample of normal PRs also get a second review from Claude.
- **Merge**: hosted Kodiak as the merge queue (adopted via [Issue #300](https://github.com/hatai/Pelway/issues/300)).
- **Human (me)**: only three things — attaching the ready-for-agent label, merging, and making direction decisions.

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

## Benefits (Observed)

Only things that actually happened, not predictions.

- Implementation, review, and investigation run in parallel. The whole pipeline no longer stalls on a single pending review.
- Decisions persist as canonical documents — ADRs, the spec, shared skills — so agents never have to re-explain long backgrounds to each other.
- Division of labor by model strength works: GLM for implementation volume, Codex for review, Claude for second opinions.
- My work has narrowed down to just the decision points.

## Friction and Countermeasures

There is real friction too.

- **The conductor is a single point of failure**: it stops when it hits the session limit. I wrote the substitute procedure into a runbook, but a double-command incident actually happened — the primary and the substitute reviewed the same PR ([#155](https://github.com/hatai/Pelway/pull/155)) at the same time. A documented procedure does not guarantee mutual exclusion; that issue remains.
- **The bottleneck moves, it does not disappear**: once implementation sped up, review and the merge queue became the new rate limits. Splitting the queue out of the GLM slots helped, but the congestion just relocated — the rate limit itself is still there.
- **Canonical docs cost upkeep**: rules vanish unless they are written into the spec, skills, or AGENTS.md. The writing effort is constant, and it is honestly heavy.
- **Managing usage limits in parallel**: several subscription limits have to be watched at once, and the moment one runs dry the whole flow is throttled to that slot.

## One Artifact from the Flow: ADR 0012

An example of what this flow produces. ADR 0012 fixes the production topology to a single host running Docker Compose, a Caddy reverse proxy, and systemd timers ([PR #429](https://github.com/hatai/Pelway/pull/429)).

The content splits the networks into edge, app, data, and sandbox, with Postgres unreachable from the sandbox. It went through this flow's exact path: filed as an issue, labeled ready-for-agent, implemented by GLM (the ADR text plus a structural test that checks existence and link resolution), then reviewed by Codex.

## If You Want to Reproduce It

If I were building the same flow again, I would set things up in this order.

- [ ] Split roles to one agent per role, and always state the assignee, model, and effort
- [ ] Put canonical documents — handoffs, roles, operational rules — in repository files (spec, runbook, AGENTS.md)
- [ ] Split issues wherever possible, and funnel work to agents through a single label
- [ ] Fix the implementer-memo format and require it every time
- [ ] Assign review to a different agent than implementation, and define when a second review applies
- [ ] Make the merge queue independent of implementation slots
- [ ] List and narrow the human decision points
- [ ] Write the substitute procedure for when the conductor stops into a runbook

This flow itself will keep changing, and I will write about it again when it does. If you have questions, feel free to reach me at [me@hatai.dev](mailto:me@hatai.dev).
