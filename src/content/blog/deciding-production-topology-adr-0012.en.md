---
title: Deciding the Production Topology for Pelway (ADR 0012)
description: Fixing the production topology of my personal project Pelway on a single host — Docker Compose, a Caddy reverse proxy, and systemd timers.
date: 2026-11-18
---

I have decided on the production topology for Pelway, a service I am building on my own. It is a single host composed of Docker Compose, a Caddy reverse proxy, and systemd timers. The decision is recorded as ADR 0012, and the change is in [Pelway PR #429](https://github.com/hatai/Pelway/pull/429).

Pelway is designed to run jobs in a per-task Linux container sandbox, with all LLM traffic going through a gateway. Nothing is in production yet, but I fixed the placement assumptions first.

## Why Decide Now

Pelway is still in the design and prototype stage. Even so, placement assumptions constrain later design decisions. Where to split the networks, where to put backups, where to restrict outbound traffic. These correspond to boundaries in the specification, so leaving them vague means rewriting a lot later. Deciding while the scale is small is cheaper, so I recorded it as an ADR first.

## The Chosen Topology

Everything runs on a single host as a Docker Compose project. The components are:

- Reverse proxy (Caddy): the only public entry point on the host. It handles TLS termination, forwarding to the API, serving the browser UI's static assets, and masking access logs by dropping auth headers and tokens.
- API (axum): authentication and authorization, plus operations on state, audit, and the outbox.
- Worker: executes jobs from the DB queue, including lease acquisition and resuming procedures.
- Postgres: the source of truth for state, audit, the outbox, and the DB queue.
- Sandbox management: a controller that starts and manages a Linux container sandbox per task. The task sandbox itself holds no secrets, and its only outbound path is the integration gateway.
- Scheduled jobs: systemd timers. A daily backup at 02:00 JST (snapshots kept for 14 days), host health checks, and security updates.

Every container gets the same set of protections.

```yaml
restart: unless-stopped
no-new-privileges: true
cap_drop: ALL
```

Resource limits on pids and memory, plus log caps, go on top of this. The actual production compose file does not exist yet. What this ADR decides is the components, their placement, and the hardening policy; writing the files is split into a separate issue.

## Alternatives I Compared

I looked at three setups as templates.

- **Rakazo's self-hosted setup (adopted as the template)**: [elie222/rakazo](https://github.com/elie222/rakazo). The production Compose file, Caddy, host-hardening scripts (harden-host, firewall, apt-security), and systemd periodic checks are all managed in the repository, with everything on a single host. I am taking this "infrastructure as repository code" shape.
- **OpenBot's Kubernetes default (rejected)**: too much for the initial scale. While a single host is enough, I do not want to carry the operational burden of an orchestrator — managing, monitoring, and updating the cluster itself. If scale ever requires it, I will design the migration separately then.
- **CircleChat's minimal Compose (reference only)**: three services — Postgres, Redis, and MinIO. Pelway uses a DB queue instead of Redis (ADR 0006), and attachments and artifacts go on local host volumes rather than object storage, so I only used it as a lower-bound example.

## What Network Isolation Protects

The networks are split into four. `edge` sits between the reverse proxy and the API, `app` connects the API, workers, gateways, and the control plane, `data` connects the API and workers to Postgres, and `sandbox` connects the controller to task sandboxes.

Postgres lives only on `data` and exposes no `ports`. Task sandboxes live only on `sandbox` and never join `data`, so no path from a sandbox to Postgres exists at all. Since the task sandbox is an untrusted boundary created per task, this is what I wanted to protect most. Migrations run through a one-shot migrate service that holds the owner connection and exits when done.

## Managing the Host as Code

The ADR also records the policy of not hardening the host by hand. The targets are the firewall (nftables or ufw, exposing only SSH, HTTP, and HTTPS), unattended-upgrades, SSH hardening (no root login, key authentication only, a limited set of login users), fail2ban, apparmor, and auditd, plus the systemd unit files for backup and host-check. All of it lives in the repository.

The premise is domestic hosting in Japan (a domestic VPS or a domestic region; the actual selection is undecided), with no dependency on cloud-specific services like managed databases, managed messaging, or object storage. Outbound communication is limited to two paths: connections to the LLM provider that a tenant enables (BYOK, via the LLM gateway), and the transports of the integration gateway that the user has permitted.

## Keeping Decisions as ADRs

Decisions live as Markdown files under `docs/adr/`, linked from the technical specification. This time I also added a structural test (`production-topology-docs.test.sh`) that checks the ADR exists and that its links resolve. Humans review the decision itself, so the test only covers the mechanical checks of existence and link resolution.

Splitting "what was decided" from "what comes next" in the ADR's Consequences section makes it obvious later how far the decision went. The actual deployment work and compose file creation are separate issues.

I will write about Pelway itself once it takes shape. If you have questions, feel free to reach me at [me@hatai.dev](mailto:me@hatai.dev).
