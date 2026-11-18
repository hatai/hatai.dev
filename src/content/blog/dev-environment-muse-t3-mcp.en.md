---
title: Connecting a Personal AI Agent to My Home Dev Machine over MCP
description: Wiring Muse, a personal AI agent on a Linux VM, to T3 Code on my home Windows/WSL machine via MCP. First post in a series on my dev environment.
date: 2026-11-18
---

> This article was drafted by an AI and reviewed and edited by the author (a human).

Over the next few posts, I'm going to write about my development environment itself. First up: how I wired my AI agents together.

There are two of them. Muse, a personal agent, runs all the time on a Linux VM. T3 Code, a coding agent platform, runs on the WSL (Ubuntu) of my home Windows machine. I connected the two over MCP (Model Context Protocol).

## Overview

![Architecture diagram connecting Muse, the T3 Connect relay, T3 Code on the home machine, and Grok Bot](/blog/dev-environment-muse-t3-mcp/architecture.svg)

I hand Muse a topic and direction. It connects to T3 on the home machine through the MCP endpoint exposed by the T3 Connect relay, launches a thread on the hatai.dev project, and sends it instructions. The thread writes code in a worktree and opens a PR on GitHub. The dashed Grok Bot route at the bottom of the diagram is still being set up; more on that below.

## Why I connected them

A coding agent's work stalls waiting on my approval. As long as I can't check, it just sits there. I wanted to fix that.

Having Muse summarize what needs deciding makes things a lot clearer. And being able to push things forward from a third-party point of view is nice.

I also wanted code and credentials to stay on my own machine. GitHub tokens, SSH keys, and the repositories themselves all live on the home WSL. Muse on the VM gets no direct access to the code; it only operates through the T3 API. Muse is the editor, and the T3 threads do the implementation.

## How the connection works

The connection goes through the MCP endpoint that the T3 Connect relay exposes. Authorization is OAuth, and the only scopes I issue are `orchestration:read` and `orchestration:operate`.

The connector on the Muse side is self-built. Instead of passing through every tool T3 exposes, it filters them through a per-tool allow-list.

| Group | Permitted operations |
| --- | --- |
| Read-only | Reading environments, projects, and threads |
| Operable | `t3_thread_launch` (start a thread), `t3_thread_send` (send instructions to a thread) |
| Off the list | `t3_project_create` (project creation) |

Thread launching and instruction sending are permitted for Muse, and this blog's drafting and revision runs on exactly those two tools. Only project creation stays off the list; I add projects myself in the T3 app. Extending the allow-list is a manual step, so permissions can't quietly grow.

## What changed

I give coding agents direct instructions far less often now.

The setup works like this: a conductor coding agent hands work down to worker coding agents, and it's doing well. The conductor talking with Muse and Grok Bot produces third-party opinions, decisions, and improvement proposals.

The improvement loop might be the biggest win. Without me giving detailed instructions, proposals, implementations, and applications just keep moving on their own.

Another post on this blog was written through this setup. Muse launched a thread on the hatai.dev project with `t3_thread_launch` and drove it through draft, revision, and PR creation with `t3_thread_send`. This article went through the same pipeline. Muse launched its writing thread too.

## Connecting Grok Bot

There's one more peer I want to connect: a Grok bot. The reason is insurance. When one side hits a rate limit and stalls, work can shift to the other. And decisions one side made while the other was down get easier to hand over.

The problem: Grok bots have no public API and no webhooks. There's no way to call one from the outside. The only open direction is the bot itself calling out to an MCP server.

So I built Agent Intercom, a shared MCP message board where agents can leave notes for each other.

```text
tools: post / read
auth:  Bearer token
deps:  standard library only
```

Connectivity is verified locally. The blocker is where to host it. The Tailscale client on Muse's VM is outbound-only, so the VM can't accept inbound connections. The board's public host ends up being the home machine, exposed through Tailscale Funnel. That's still in progress, and Grok Bot and Muse aren't connected end to end yet.

## Gripes and worries

Everything runs locally, so if the machine goes down, everything stops. It did go down. The day my home PC crashed, the T3 relay started returning HTTP 530 and the whole thing stopped. A reboot fixed it, but it made the single point of failure very real. SSH is a separate path from T3, but that crash happened right at a reboot and sshd wasn't up yet, so for a while I couldn't get in through either route.

That said, when T3 goes down it automatically sends a "resume" message to the in-progress threads. That part is nice.

One more thing: it's hard to tell whether the work is actually heading where I want it to. The same is true with humans, to be fair. I do think there's a way to visualize it that only exists because I'm running AI bots everywhere. I just haven't figured out what the best way is yet.

## Closing

The home machine is the hub now, with the agents connected over MCP. Still under construction. Next time I'll dig into the connector and where the board ends up living. Reach me at [me@hatai.dev](mailto:me@hatai.dev).
