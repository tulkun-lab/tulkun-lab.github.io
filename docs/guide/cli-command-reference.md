# CLI Command Reference

This page explains the Tulkun CLI as a product surface.

The goal is not to list every flag by rote. The goal is to help a user
understand which command family to reach for and why.

## Command Families

Tulkun's command surface falls into six practical groups.

| Group | Purpose |
| --- | --- |
| Interactive entry | Start or resume live sessions |
| Gateway and service | Run, inspect, and stop service-mode runtime |
| Configuration | Inspect and change runtime and model settings |
| Memory and skills | Manage retrieval, recall, summarization, and reusable skill assets |
| Run operations | Inspect or cancel active and recent work |
| Automation and advanced operations | Scheduled jobs, diagnostics, and integration-focused workflows |

## Interactive Entry

### `tulkun`

Starts the main interactive experience when launched in an interactive terminal.

Use this for normal day-to-day Tulkun work.

### `tulkun shell`

Explicitly opens the same interactive shell.

Use this when you want to be unambiguous in scripts, notes, or onboarding
instructions.

### `tulkun resume <session-id>`

Resumes a previously known session.

Use this when you want continuity with an existing thread instead of opening a
fresh session.

## Gateway And Service Commands

### `tulkun gateway start`

Starts Tulkun in gateway mode.

Use this when you want:

- service-backed usage
- shared runtime access
- gateway or web-oriented workflows

### `tulkun gateway status`

Checks whether the gateway is healthy.

### `tulkun gateway stop`

Requests a graceful shutdown.

### `tulkun status`

Shows key runtime state such as where Tulkun home and active configuration are
resolved.

### `tulkun doctor`

Checks whether Tulkun's local environment is healthy enough to operate.

This is the right starting point when configuration, database, or runtime state
looks broken.

## Configuration Commands

### `tulkun config ...`

Use this family when your question is:

- where is Tulkun reading configuration from?
- what is the active configuration?
- is the configuration valid?
- can I update a supported configuration key?

This is the broad configuration surface.

### `tulkun model ...`

Use this family when your question is specifically about:

- which model is active
- which provider the main or named agent uses
- adding or removing named agents
- changing the primary model endpoint for an agent

This is the agent/model-specific configuration surface.

## Memory And Skills

### `tulkun memory ...`

Use this family when you need to work with:

- memory indexing
- memory search
- transcript indexing
- consolidation and REM-style memory workflows

This command family exists because Tulkun's memory stack is operational, not
just conceptual.

### `tulkun skills ...`

Use this family when you need to:

- browse installed or discoverable skills
- search for relevant skills
- install new skills
- inspect or validate them
- update, remove, or publish skill packages

Skills are treated as lifecycle-managed assets, not loose prompt snippets.

## Run Operations

### `tulkun supervisor ...`

Use this family when the question is about work that has already been launched.

Typical use cases:

- list recent runs
- cancel a run
- inspect active operational state

This is distinct from interactive shell usage because it is about run control,
not conversation flow.

## Automation And Advanced Operations

### `tulkun cron ...`

Use this family to define scheduled work such as recurring prompts or timed
execution.

The built-in GitHub issue repair workflow is created as a normal cron skill:

```bash
tulkun cron create \
  --name github-issue-autofix \
  --schedule "0 * * * *" \
  --skill github-issue-autofix
```

Use it when Tulkun should periodically inspect labeled GitHub issues, repair
them in isolated worktrees, fork before pushing, create pull requests, and keep
following later issue or PR comments. See
[GitHub Issue Autofix](/guide/github-issue-autofix) for the full setup and
configuration reference. The workflow config lives under
`skills.github-issue-autofix` in `$TULKUN_HOME/tulkun.yaml`.

### Other advanced command families

Tulkun also exposes advanced surfaces for areas such as:

- authentication
- MCP and integration-oriented operations
- sessions and logs

These commands matter because they show Tulkun is designed for more than single
prompt-response usage.

## Global Flags

Important root-level flags include:

- `--home`
- `--dangerously-bypass-approvals-and-sandbox`
- `--yolo`

These flags affect core runtime behavior and should be used intentionally.

## How To Choose The Right Command

Use this quick decision model:

- if you want to work interactively, start with `tulkun`
- if you want service-mode operation, use `tulkun gateway ...`
- if you want to fix setup or inspect health, use `tulkun status` and
  `tulkun doctor`
- if you want to change runtime settings, use `tulkun config ...`
- if you want to change agent model selection, use `tulkun model ...`
- if you want to manage knowledge, use `tulkun memory ...`
- if you want to manage reusable capability packages, use `tulkun skills ...`
- if you want to inspect or cancel existing runs, use `tulkun supervisor ...`

## Related

- [Getting Started](/guide/getting-started)
- [CLI and Surfaces](/guide/cli-and-surfaces)
- [GitHub Issue Autofix](/guide/github-issue-autofix)
- [Configuration Overview](/config/overview)
