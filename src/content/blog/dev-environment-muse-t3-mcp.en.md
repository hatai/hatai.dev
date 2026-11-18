---
title: Connecting a Personal AI Agent to My Home Dev Machine over MCP
description: Wiring Muse, a personal AI agent on a Linux VM, to T3 Code on my home Windows/WSL machine via MCP. First post in a series on my dev environment.
date: 2026-11-18
---

> This article was drafted by an AI and reviewed and edited by the author (a human).

Over the next few posts, I will write about my development environment itself. This first installment covers how I connect AI agents to each other: the overall picture and where things stand today.

I run two agent setups. One is Muse, a personal agent that lives on a Linux VM. The other is T3 Code, a coding agent platform that runs on WSL (Ubuntu) on my Windows machine at home. I connected the two over MCP (Model Context Protocol) so that Muse can hand work to T3 on the home machine.

## Overview

![Architecture diagram connecting Muse, the T3 Connect relay, T3 Code on the home machine, and Grok Bot](/blog/dev-environment-muse-t3-mcp/architecture.svg)

The flow works like this. I give Muse a topic and direction. Muse connects through the MCP endpoint exposed by the T3 Connect relay to T3 on the home machine, launches a thread on the hatai.dev project, and sends it instructions. The thread writes code in a worktree and opens a PR on GitHub. The dashed Grok Bot route at the bottom of the diagram is still being set up; more on that later.

## Why This Setup

The main reason is that I want code and credentials to stay on my own machine. GitHub tokens, SSH keys, and the repositories themselves all live on the home WSL and never leave for the VM. Muse gets no direct access to code; it only performs operations through the T3 API. The division of labor: Muse acts as an editor, gathering material and writing briefs, while the actual implementation is left to T3 threads.

## How the Connection Works

The connection uses the MCP endpoint provided by the T3 Connect relay. Authorization is OAuth, and the only scopes I issue are `orchestration:read` and `orchestration:operate`.

The connector on the Muse side is self-built. Rather than passing through every tool T3 exposes, it filters them through an allow-list split into "read-only" and "operable" groups.

| Group | Permitted operations |
| --- | --- |
| Read-only | Reading environments, projects, and threads |
| Operable | `t3_thread_launch` (start a thread), `t3_thread_send` (send instructions to a thread) |
| Off the list | `t3_project_create` (project creation) |

Muse is allowed to launch threads and send instructions, and the drafting and revision of blog posts runs on exactly those two tools. Project creation stays off the list; adding a project is something I do myself in the T3 app. Extending the allow-list is a manual step on my side, so permissions cannot quietly grow.

## What Actually Ran on It

This connection has already done real work. For another post on this blog, Muse launched a thread on the hatai.dev project with `t3_thread_launch` and drove it through draft, revision, and PR creation with `t3_thread_send`. Muse played the editor, collecting material and writing the brief; the T3 thread was the writer. This very article was produced through the same pipeline. Muse started its writing thread via `t3_thread_launch` too.

## Connecting Grok Bot

There is one more peer I want to connect: a Grok bot. This one is not connected yet. Grok bots have no public API and no webhooks, so there is no way to call them from the outside. The only open direction is the bot itself calling out to an MCP server.

So I built Agent Intercom, a shared MCP server that works as a message board for agents.

```text
tools: post / read
auth:  Bearer token
deps:  standard library only
```

Connectivity is verified locally. The blocker is where to host it. The Tailscale client on Muse's VM is outbound-only, so the VM cannot accept inbound connections. That makes the home machine the natural public host for the board, exposed to the outside through Tailscale Funnel. This deployment is still in progress, and Grok Bot and Muse are not yet connected end to end.

## Known Limitations

The weakness is obvious: the home machine is a single point of failure. When my home PC crashed the other day, the T3 relay started returning HTTP 530 and everything stopped. A reboot fixed it, but the incident made the character of this setup very clear: the relay's health depends on the PC's state.

SSH is a separate path from T3, so I can usually still get in while T3 is down. This time, though, sshd had not come up yet right after the reboot, and for a while I had no way in through either route.

Other parts remain unfinished. The board for Grok Bot is still being deployed, and maintaining the connector is on me. The setup is convenient, but it is not a redundant one.

## Closing

The home machine now sits at the hub, with AI agents connected to each other over MCP. It is still a work in progress. In later posts I plan to dig into individual pieces, like the custom connector and where the message board ends up living. You can reach me at [me@hatai.dev](mailto:me@hatai.dev).
