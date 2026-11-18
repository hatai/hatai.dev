---
title: Building a Development Flow Run by an AI Agent Team
description: How I run development of my personal project Pelway with a team of AI agents — the role split, canonical docs, merge queue, and the benefits and friction I have actually observed.
date: 2026-11-18
---

> This article was drafted by AI using the agent-team development flow described below, and reviewed and edited by the author.

I am developing Pelway, a personal project, with a team of AI agents where each role is assigned to a different agent. A conductor, an implementer, a reviewer, and a merge queue handle the work, and I only look at the decision points. This post describes how the flow works, plus the benefits and friction I have observed while running it.

Pelway itself is a service designed to run jobs in a per-task Linux container sandbox. It is not in production yet, but the development flow is already running — and that seemed more worth writing about, so it comes first.

## The Flow

![How a task flows from Issue to merge, and who owns each stage](/img/agent-team-flow.en.svg)

Terminology note: "OK to start" is the `ready-for-agent` label a human attaches to an issue. A sub-issue is a child task under a parent issue, a worktree is a way to give Git work its own directory, and Kodiak is a tool that manages a queue of pull requests waiting to merge.

The roles are split like this.

| Role | Owner | What it does |
| --- | --- | --- |
| Conductor | Grok Bot (substitute: a Claude background session) | Triage issues, dispatch instructions to implementation threads, consolidate review results |
| Implementation | GLM (threads on T3 Code) | Implement one issue at a time, leave a fixed-format implementer memo |
| Review | Codex (second review: Claude) | Review PRs; Claude is added on high-risk PRs and a sample of normal ones |
| Merge | Kodiak (a hosted merge-queue tool) | Take in PRs that pass |
| Judgment | Human (me) | Only three things: attach ready-for-agent, merge, decide direction |

This table is a simplification of the main roles, and the roster has already changed: a few days in, Devin CLI was added to implementation and review.

While the conductor is stopped by its weekly session limit, Claude takes over; the handoff procedure is canonicalized in the spec and a runbook.

![The exception path when the conductor stops: Claude takes over per the runbook](/img/conductor-failover.en.svg)

A task flows in this order. An issue is filed, and anything splittable is broken into sub-issues. Once I attach the ready-for-agent label — the go-ahead signal — the conductor dispatches it to a GLM implementation thread, the resulting PR is reviewed by Codex, and whatever passes enters the merge queue and gets merged.

## Mechanisms That Make It Work

Four pieces that should transfer if you want to reproduce this.

**Canonicalization**: handoff procedures, role assignments, and operational rules live in the spec, runbooks, AGENTS.md, and shared skills. Agent memory does not carry across sessions, so anything not written down disappears. Even small rules are systematized — for example, human-facing messages must always render issue and PR numbers as full URL links. For development skills I adopted [mattpocock/skills](https://github.com/mattpocock/skills).

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

Only things that actually happened, not predictions. In raw numbers: from the repository's start to the writing of this post — about ten days — 256 issues were filed and 195 PRs were merged (counted on GitHub on 2026-11-18). Since the flow itself was being assembled during the same period, not all 195 went through the flow in its current form.

| Aspect | Benefit | Downside / friction |
| --- | --- | --- |
| Parallelism | Implementation, review, and investigation run in parallel; nothing stalls on a single pending review | The rate limit does not disappear — it moves; once implementation sped up, review and the merge queue clogged |
| Canonical docs | Decisions persist in ADRs, the spec, and shared skills, so no long re-briefings between agents | Rules vanish unless written down, and the upkeep is constant |
| Division of labor | Work splits by model strength (GLM implements, Codex reviews, Claude gives second opinions) | Several subscription usage limits have to be managed at once |
| Human load | I only have to focus on the decision points | The conductor is a single point of failure and stops at its session limit |

As countermeasures, I wrote the substitute procedure into a runbook and made the merge queue independent of the GLM implementation slots. Failures still happen.

One concrete case: a pull request received two approval reviews five minutes apart — a double command. The instruction the primary issued right before stopping, and the one the substitute issued right after taking over, pointed at the same target. It doubled the review effort and left it ambiguous which verdict counted. In response, the runbook now spells out the takeover triggers (the primary has reported no activity for a set period, or has recorded itself as blocked) and the handoff order (reconcile the actual GitHub state against the auxiliary records before acting), plus the principle that the substitute must not create state only it knows about. When the primary returns, it reads the substitute's worklog and continues from the GitHub state.

Delegation is not a rare exception: the worklogs record six substitute runs over five days of this period, so the conductor stops somewhere almost every day. The congestion only relocated, the rate limit itself remains, and the constant effort of writing canonical docs is honestly heavy. A misreading of a usage limit also once caused the implementation slot count to be lowered and reverted on the same day.

![The rate limit moving from implementation to review to the merge queue](/img/bottleneck-moves.en.svg)

## Case Study: One Task's Path Through the Flow

As a concrete example, here is the timeline of the task that fixed the production topology in an ADR (issue and PR numbers omitted, but the order and content follow the actual records).

1. An issue was filed to decide the production placement template as an ADR, and a human attached `ready-for-agent`. Several days passed between filing and the implementation thread opening a draft PR.
2. A GLM implementation thread wrote the ADR text and a structural test that checks its existence and link resolution in a worktree, then opened a draft PR.
3. The reviewer (Devin CLI, in this case) sent it back twice. First: the sandbox controller's placement contradicted the canonical technical spec that defines how the runner sends launch requests. Second: the placement had no path from a task sandbox to the integration gateway at all. Both were design inconsistencies in the document, not style issues. Review results state the assignee, model, and effort — across the rounds, effort was raised medium → high → max.
4. The implementation thread fixed the findings and re-delegated; the third review approved, and once required checks passed the merge queue merged it. About 90 minutes from draft PR to merge.

The rule is that this loop stays closed between the implementation thread and the reviewer, so neither the conductor nor I intervened during those 90 minutes.

Below is an excerpt of that ADR edited for this post (the original lives at `docs/adr/0012-production-topology-single-host.md` in the public Pelway repository).

> **Background**: an ADR to fix the production placement policy up front. It explicitly scopes out the actual hosting contract, deployment work, and writing the compose files. The reason for this choice was to keep operations simple, and to use a topology where I can see and understand every part myself when something stops.
>
> **The decision**: production is a single host. Components are declared with Docker Compose, the only public entry point is a Caddy reverse proxy, and host-level scheduled jobs (backups, health checks, security updates) run on systemd timers. Networks are split into edge, app, data, and sandbox; Postgres sits only on `data` with no `ports`, so no path from a sandbox to the DB exists. Hosting is assumed to be domestic in Japan, with no dependency on cloud-specific services like managed databases or object storage. Host hardening — firewall, SSH lockdown, automatic updates — is managed as scripts and configuration in the repository. Rakazo's self-hosted setup was adopted as the template.
>
> **Rejected options and the cost**: Kubernetes was rejected as excessive for the initial scale; migration design will be a separate effort if scale ever demands it. The cost of dropping cloud-specific services is that operational pieces around backups, updates, and monitoring have to be written as compose files and scripts — that work is filed as separate issues.

This flow itself will keep changing, and I will write about it again when it does. If you have questions, feel free to reach me at [me@hatai.dev](mailto:me@hatai.dev).
