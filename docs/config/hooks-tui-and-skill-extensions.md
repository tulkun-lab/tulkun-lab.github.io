# Hooks, TUI, And Skill Extensions

This page documents:

- `hooks`
- `tui`
- skill-specific extension config under `skills:`

These are runtime-adjacent settings, but they are not the same thing.

- `hooks` changes lifecycle automation
- `tui` changes terminal-only integrations and shell behavior
- `skills` configures individual skills that expose their own external settings

## `hooks`

`hooks` is a map of event names to hook matcher chains.

Supported event names:

- `PreToolUse`
- `PostToolUse`
- `PostToolUseFailure`
- `Notification`
- `UserPromptSubmit`
- `SessionStart`
- `Stop`
- `SubagentStop`

### Hook Shape

Each event contains a list of matchers:

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `hooks.<event>[].matcher` | string | empty or `*` means match everything | Selects which queries or tool names this matcher applies to. |
| `hooks.<event>[].hooks` | object[] | required | Ordered hooks executed when the matcher applies. |

### Matcher Behavior

A matcher may be:

- empty or `*` to match everything
- a simple exact matcher
- a `|`-separated exact matcher list
- a regular expression

### Hook Command Reference

Every hook item can include the following fields.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `type` | string | required | Hook kind: `command`, `prompt`, `agent`, or `http`. |
| `command` | string | empty | Shell command for `command` hooks. |
| `prompt` | string | empty | Prompt text for `prompt` or `agent` hooks. |
| `url` | string | empty | Absolute URL for `http` hooks. |
| `if` | string | empty | Optional permission-style rule such as `shell(git *)`. |
| `shell` | string | `bash` when omitted at runtime | Shell interpreter for command hooks. |
| `timeout` | number | 10 minutes effective runtime fallback | Hook timeout in seconds. |
| `status_message` | string | empty | Status text exposed while the hook runs. |
| `once` | boolean | `false` | Runs once per matcher lifecycle when supported. |
| `async` | boolean | `false` | Runs asynchronously. |
| `async_rewake` | boolean | `false` | Requests rewake behavior after async completion. |
| `model` | string | empty | Model hint used by hosts that honor model selection for prompt-style hooks. |
| `headers` | object | empty | Additional HTTP-style headers for relevant hook runners. |
| `allowed_env_vars` | string[] | empty | Explicit allowlist of environment variables forwarded to the hook process. |

### How To Use Hooks Safely

Use `PreToolUse` when:

- you want to inspect or rewrite tool input before execution
- you want hook-driven approval decisions for particular tool patterns

Use `PostToolUse` when:

- you want summarization, logging, or follow-up actions after successful tool calls

Use `PostToolUseFailure` when:

- failed tool calls should trigger remediation, review, or incident-style handling

Use `Notification`, `SessionStart`, `Stop`, and `SubagentStop` when:

- Tulkun should notify external systems or produce structured operational side effects

Use `allowed_env_vars` aggressively:

- do not forward the full parent environment by default
- allow only the variables the hook truly needs

## `tui`

`tui` configures terminal-only LSP integrations and shell behavior.
It does not define MCP servers.

### TUI Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `tui.resume_history_turns` | integer | `50` | Number of turns the TUI keeps available for resume history behavior. |
| `tui.lsp` | object map | empty | TUI-only language server registry. |
| `tui.shell.path` | string | empty | Shell executable used by the TUI. |
| `tui.shell.args` | string[] | empty | Shell arguments. |
| `tui.context_paths` | string[] | empty | Extra context roots visible to the TUI. |

### `tui.lsp.<language>`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `false` | Enables the LSP server definition. |
| `command` | string | empty | Language server command. |
| `args` | string[] | empty | Command arguments. |
| `options` | object | empty | Server-specific option object. |

Use the `tui` block when:

- you want terminal-only LSP integrations that should not affect gateway behavior
- you want different LSP settings in the local terminal than in service mode

## `skills`

The `skills:` block is a skill-specific extension surface.

It is part of the public `tulkun.yaml` ecosystem, but it is not part of the
primary Tulkun root schema in the same way as `gateway`, `agents`, or `memory`.

Use it when:

- a skill explicitly documents configuration under `skills.<skill-name>`
- you want to supply external connection details or policy to a skill

## `skills.database-query`

The built-in `database-query` skill reads database connections from
`skills.database-query.databases`.

### `skills.database-query.databases[]`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `name` | string | empty | Logical connection name used when selecting the database. |
| `type` | string | empty | Database type: `postgresql`, `mysql`, or `sqlite`. |
| `host` | string | empty | Database host for networked databases. |
| `port` | integer | provider convention if omitted | Database port. |
| `database` | string | empty | Database or schema target. |
| `username` | string | empty | Database username. |
| `password` | string | empty | Database password; use `${ENV_NAME}` rather than plaintext. |
| `schema` | string | provider-specific | Optional PostgreSQL schema. |
| `path` | string | empty | SQLite file path. |

Usage guidance:

- use read-only credentials whenever possible
- use `${ENV_NAME}` for passwords
- use `path` only for `sqlite`
- use `host` / `port` / `database` for networked engines

## Related

- [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
- [Agents And Models](/config/agents-and-models)
- [Skills and Tools](/guide/skills-and-tools)
