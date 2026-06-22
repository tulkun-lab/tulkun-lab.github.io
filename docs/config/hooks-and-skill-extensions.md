# Hooks And Skill Extensions

This page documents:

- `hooks`
- skill-specific extension config under `skills:`

These are runtime-adjacent settings, but they are not the same thing.

- `hooks` changes lifecycle automation
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

## `skills.github-issue-autofix`

The built-in `github-issue-autofix` skill reads its scheduled repository repair
configuration from `skills.github-issue-autofix`.

### `skills.github-issue-autofix`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `max_parallel_repositories` | integer | `4` | Maximum repositories processed concurrently in one cron run. |
| `branch_prefix` | string | `autofix/issue-` | Prefix for generated autofix branch names. |
| `repositories` | list | empty | Repository-specific issue repair targets. |

### `skills.github-issue-autofix.repositories[]`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `repo` | string | empty | Target GitHub repository in `owner/repo` form. |
| `label` | string | `auto-fix` | Required issue label for selection. |
| `base` | string | `main` | Base branch for worktrees and pull requests. |
| `max_issues` | integer | `1` | Maximum new issues selected for this repository per run. |
| `worktree_root` | string | `$TULKUN_HOME/workspace/github-issue-autofix/<repo-slug>` | Repository workspace root for source checkout, worktrees, and artifacts. |
| `tracking_state_dir` | string | `<worktree_root>/state` | State directory for follow-up high-water marks. |
| `source_dir` | string | empty | Optional existing source checkout used for worktree creation. |
| `fork_before_pr` | boolean | `true` | Fork before pushing repair branches. |
| `fork_remote` | string | `tulkun-autofix-fork` | Local git remote name for the fork. |
| `fork_owner` | string | authenticated account | Optional explicit fork owner. |
| `track_followups` | boolean | `true` | Process existing issue and PR follow-ups before selecting new issues. |
| `reply_to_issue_comments` | boolean | `true` | Reply to issue comments when Tulkun is expected to respond. |
| `reply_to_pr_comments` | boolean | `true` | Reply to PR comments when Tulkun is expected to respond. |
| `reply_to_review_threads` | boolean | `true` | Reply to unresolved review threads when Tulkun is expected to respond. |

## Related

- [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
- [Agents And Models](/config/agents-and-models)
- [Skills and Tools](/guide/skills-and-tools)
