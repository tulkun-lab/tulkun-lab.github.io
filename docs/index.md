---
layout: home

hero:
  name: "Tulkun"
  text: "A local AI coding agent for interactive work and controlled automation"
  tagline: "Terminal-first workflow, gateway service, memory systems, tool execution, reusable skills, subagent coordination, workboards, and layered safety controls."
  image:
    src: /mark.svg
    alt: Tulkun mark
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started

features:
  - title: Built For Real Work
    details: Tulkun combines interactive coding workflows with operational features such as permissions, sandboxing, memory, subagents, and task coordination.
  - title: Clear User Paths
    details: The documentation is organized for newcomers, operators, and advanced users who need deeper understanding instead of shallow feature summaries.
  - title: Honest Capability Boundaries
    details: When a feature is stronger in one surface than another, or when a mechanism is still evolving, the docs explain that directly.
  - title: Practical Systems Explanations
    details: Context budgets, session memory, active memory, skills, tools, workboards, and safety controls are described as concrete product behavior with diagrams and operational guidance.
---

## What Tulkun Is

Tulkun is a local AI coding agent designed for hands-on technical work. It is
not just a chat window and not just a CLI wrapper. In practice, Tulkun combines:

- an interactive terminal experience for day-to-day work
- a service surface for gateway and web-backed use cases
- configurable agent, model, and memory behavior
- structured task coordination through workboards and subagents
- layered safety controls around permissions and execution

## Who This Documentation Is For

This site is written for three kinds of readers.

### New Users

You want to install Tulkun, start a session, understand what the main commands
do, and get useful work done without guessing how the system is shaped.

### Operators And Power Users

You want to configure runtime behavior, manage models, understand permission and
sandbox settings, and know which surface to use for which task.

### Advanced Users And Contributors

You want a strong mental model for how Tulkun handles context, memory, tool
execution, long-running work, and agent coordination.

## Reading Paths

### Start Here

1. [Getting Started](/guide/getting-started)
2. [CLI and Surfaces](/guide/cli-and-surfaces)
3. [Architecture](/guide/architecture)
4. [Memory Systems](/guide/memory-systems)

This path answers:

- How do I start Tulkun?
- What should I expect on first run?
- Which surface should I use?
- Which core feature area should I read next?

### Configure Tulkun

1. [Configuration Reference](/config/overview)
2. [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
3. [Agents and Models](/config/agents-and-models)
4. [Sandbox and Permissions](/config/sandbox-and-permissions)
5. [Memory, Compaction, And Runtime Features](/config/memory-and-runtime-features)

This path answers:

- Where do the main runtime settings live?
- How do I configure the main agent and its model providers?
- How are safety decisions made and enforced?

### Understand The System

1. [Architecture](/guide/architecture)
2. [Context and Compaction](/guide/context-and-compaction)
3. [Memory Systems](/guide/memory-systems)
4. [Skills and Tools](/guide/skills-and-tools)
5. [Subagents and Workboards](/guide/subagents-and-workboards)
6. [Safety Model](/guide/safety-model)

This path answers:

- How does Tulkun assemble context?
- What kinds of memory does it maintain?
- How do tools, skills, subagents, and workboards fit together?
- What prevents unsafe execution?

## Product Areas At A Glance

### Interactive Work

Tulkun is terminal-first. A large part of the day-to-day experience is centered
on interactive sessions, slash commands, approvals, session switching, and
visible run progress.

### Service And Integration

Tulkun also runs as a service-oriented system, which matters for gateway-driven
workflows, shared clients, automation, and operational APIs.

### Knowledge And Coordination

Tulkun's memory stack, skill system, subagent model, and workboards exist to
support longer-running, more structured technical work instead of isolated chat
answers.

### Safety And Control

Tulkun separates policy, approval, and execution boundaries. Permissions,
sandboxing, path protection, and guardrails are part of the product story, not
an afterthought.

## System Overview

```mermaid
flowchart TB
    subgraph Surfaces
      A["Interactive terminal"]
      B["CLI commands"]
      C["Gateway and web clients"]
    end

    subgraph Runtime
      D["Agent runtime"]
      E["Tool execution"]
      F["Session and run state"]
    end

    subgraph Core Systems
      G["Context and compaction"]
      H["Memory systems"]
      I["Skills and subagents"]
      J["Permissions and sandboxing"]
      K["Workboards"]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    E --> J
    F --> K
```

## Continue Reading

- [Getting Started](/guide/getting-started)
- [CLI Command Reference](/guide/cli-command-reference)
- [Architecture](/guide/architecture)
