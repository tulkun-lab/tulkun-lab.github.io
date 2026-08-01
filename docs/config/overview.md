# Configuration Reference

Tulkun uses one primary runtime configuration file, usually `~/.tulkun/tulkun.yaml`.
This section is the reference manual for that file.

This is intentionally narrower than the guide pages:

- `/config/*` explains what each setting controls, how to use it, and what its default is.
- `/guide/*` explains product workflows and system behavior.

## How Configuration Is Resolved

Tulkun resolves configuration in this order:

1. Tulkun home directory:
   `TULKUN_HOME` if set, otherwise `~/.tulkun`
2. Config file:
   `tulkun.yaml`, `tulkun.yml`, or `tulkun.json` inside Tulkun home
3. Environment file:
   `~/.tulkun/.env` or `$TULKUN_HOME/.env`
4. Runtime normalization:
   omitted fields are filled with effective defaults where the product defines them

## Secret Handling

Secret-like values must not be stored in plaintext in `tulkun.yaml`.

Use one of these forms instead:

- empty value
- `${ENV_NAME}` placeholder
- matching value in `~/.tulkun/.env`

Typical examples:

```yaml
gateway:
  auth:
    token: "${TULKUN_GATEWAY_TOKEN}"

agents:
  definitions:
    main:
      llm_providers:
        - provider: openai
          model: gpt-5.4
          config:
            api_key: "${OPENAI_API_KEY}"
```

## Two Kinds Of Defaults

Tulkun has two different kinds of defaults, and the distinction matters.

### Example Defaults In `tulkun.yaml`

The shipped example file shows common values and many comments. These are useful
as starting points, but some are examples rather than runtime guarantees.

### Effective Runtime Defaults

Some fields are populated automatically when omitted. For example:

- `gateway.http_addr` defaults to `127.0.0.1:6060`
- `gateway.auth.mode` defaults to `token`
- `compact.model_auto_compact_token_limit_scope` defaults to `total`
- `compact.remote_compaction_v2` defaults to `true`

Every reference page below calls out effective runtime defaults explicitly.

## Scope Map

Use the following split when editing the config.

- [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
  Covers service runtime, HTTP/gRPC gateway, messaging channels, webhook paths,
  integration credentials, and delivery policies.
- [Agents And Models](/config/agents-and-models)
  Covers named agents, provider chains, agent defaults, loop guard, heartbeat,
  MCP servers, web search, sourcegraph, planning, and runtime policy defaults.
- [Sandbox And Permissions](/config/sandbox-and-permissions)
  Covers sandbox execution policy, filesystem and network restrictions, and
  dangerous fallback controls.
- [Memory, Compaction, And Runtime Features](/config/memory-and-runtime-features)
  Covers Active Memory, Core Memory, dreaming flags, compaction, and
  personality selection.
- [Hooks And Skill Extensions](/config/hooks-and-skill-extensions)
  Covers lifecycle hooks and skill-specific extension configuration such as
  `skills.database-query` and `skills.github-issue-autofix`.

## What This Reference Covers

This manual covers:

- every top-level field in the primary Tulkun config schema
- the runtime behavior each field controls
- accepted shapes and values
- effective defaults when Tulkun defines them
- practical guidance on when a setting matters

## What This Reference Does Not Do

This section does not explain the deeper system design for:

- context assembly
- session compaction strategy
- memory consolidation
- subagent coordination
- safety layering

Those topics are documented under `/guide`.

## Quick Start Reading Order

If you are configuring Tulkun for the first time, read in this order:

1. [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
2. [Agents And Models](/config/agents-and-models)
3. [Sandbox And Permissions](/config/sandbox-and-permissions)
4. [Memory, Compaction, And Runtime Features](/config/memory-and-runtime-features)
5. [Hooks And Skill Extensions](/config/hooks-and-skill-extensions)

## Related

- [Architecture](/guide/architecture)
- [Context and Compaction](/guide/context-and-compaction)
- [Memory Systems](/guide/memory-systems)
