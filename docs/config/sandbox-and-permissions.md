# Sandbox And Permissions

This page is the configuration reference for Tulkun's sandbox controls.

This page does not explain the full safety model. It documents the config
surface that shapes execution isolation and dangerous fallback behavior.

## `sandbox`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `sandbox.enabled` | boolean | `false` unless set | Enables Tulkun sandboxing. |
| `sandbox.fail_if_unavailable` | boolean | `false` unless set | Fails startup if the sandbox backend is unavailable. |
| `sandbox.auto_allow_bash_if_sandboxed` | boolean | config value defaults to `false`; runtime nil-sandbox fallback differs | Auto-allows Bash when sandbox mode is active. |
| `sandbox.allow_unsandboxed_commands` | boolean | effective `true` when omitted | Allows dangerous fallback to unsandboxed execution. |
| `sandbox.enabled_platforms` | string[] | empty means all supported platforms | Restricts sandbox enablement by platform. |
| `sandbox.excluded_commands` | string[] | empty | Command patterns that bypass sandboxing. |
| `sandbox.filesystem` | object | empty | Filesystem allow and deny policy. |
| `sandbox.network` | object | empty | Network allow and deny policy. |
| `sandbox.ignore_violations` | object map | empty | Ignores selected violation types for selected tools. |
| `sandbox.enable_weaker_nested_sandbox` | boolean | `false` | Relaxes nested sandboxing. |
| `sandbox.enable_weaker_network_isolation` | boolean | `false` | Relaxes network isolation. |
| `sandbox.ripgrep` | object | empty | Ripgrep command configuration used inside the sandbox. |

## How To Think About The Main Switches

### `sandbox.enabled`

Turns the sandbox system on.

Use it when:

- Tulkun should isolate tool execution rather than running directly on the host

### `sandbox.fail_if_unavailable`

Controls whether startup should continue when the selected sandbox backend is
missing or unusable.

Use it when:

- sandboxing is a hard requirement in your environment
- falling back to non-sandboxed execution is unacceptable

### `sandbox.auto_allow_bash_if_sandboxed`

Controls whether Bash is auto-allowed when sandboxing is active.

Important note:

- this field is a plain boolean in the config structure
- the explicit config value defaults to `false` unless you set it
- a nil sandbox object is treated differently by helper logic

Practical rule:

- if you want this behavior, set it explicitly
- do not rely on omission here

### `sandbox.allow_unsandboxed_commands`

Controls whether Tulkun may fall back to unsandboxed command execution.

Important note:

- if omitted, the effective runtime default is `true`
- set it explicitly to `false` if you want to block unsandboxed fallback

Use it when:

- you need a hard guarantee that Tulkun should not escape sandbox execution

## `sandbox.enabled_platforms`

Restricts sandboxing to specific platforms.

Accepted values:

- `darwin`
- `linux`
- `wsl`
- `wsl2`

If empty, Tulkun treats all supported platforms as eligible.

## `sandbox.excluded_commands`

Command patterns that always bypass sandboxing.

Use it carefully. This is effectively an escape hatch for command classes that
must not be routed through sandbox execution.

Examples:

- `git commit`
- `npm *`

## `sandbox.filesystem`

Controls filesystem policy inside the sandbox.

### Filesystem Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `allow_write` | string[] | empty | Explicit writable paths. |
| `deny_write` | string[] | empty | Explicit write-deny paths. |
| `allow_read` | string[] | empty | Explicit readable paths. |
| `deny_read` | string[] | empty | Explicit read-deny paths. |
| `allow_managed_read_paths_only` | boolean | `false` | Restricts reads to managed paths only. |

Use `allow_write` when:

- a worktree, temp directory, or generated-output path must remain writable

Use `deny_write` when:

- you want strong protection around system or secret-sensitive directories

Use `allow_managed_read_paths_only` when:

- Tulkun should not read arbitrary host paths even if the sandbox exists

## `sandbox.network`

Controls network policy inside the sandbox.

### Network Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `allowed_domains` | string[] | empty | Allowed outbound domains. |
| `denied_domains` | string[] | empty | Explicitly denied outbound domains. |
| `allow_unix_sockets` | string[] | empty | Explicitly allowed Unix sockets. |
| `allow_all_unix_sockets` | boolean | `false` | Allows all Unix sockets. |
| `allow_local_binding` | boolean | `false` | Allows local listener binding. |
| `http_proxy_port` | integer | `0` | Local HTTP proxy helper port. |
| `socks_proxy_port` | integer | `0` | Local SOCKS proxy helper port. |
| `allow_managed_domains_only` | boolean | `false` | Restricts network access to managed domains only. |

Validation rules worth knowing:

- domains must not include scheme, path, whitespace, or credentials
- ports must be between `0` and `65535`

Use `allowed_domains` and `allow_managed_domains_only` when:

- Tulkun should be able to reach only a strict external allowlist

Use `denied_domains` when:

- specific destinations must always be blocked even if other network access is allowed

Use proxy ports when:

- the sandbox should route traffic through a local helper proxy

## `sandbox.ignore_violations`

Maps tool names to a list of violation kinds Tulkun should tolerate.

Example shape:

```yaml
ignore_violations:
  shell:
    - "network"
  read_file:
    - "path_escape"
```

Use this only when:

- a specific tool is known to need a narrow exception
- you can describe exactly which violation kind is acceptable

## `sandbox.enable_weaker_nested_sandbox`

Relaxes sandbox behavior when Tulkun itself is already running inside another
sandboxed environment.

Default:

- `false`

Use it when:

- a stricter nested sandbox is unreliable in your host environment

## `sandbox.enable_weaker_network_isolation`

Relaxes network isolation for constrained environments.

Default:

- `false`

Use it when:

- the environment cannot support the normal network-isolation path

## `sandbox.ripgrep`

Controls the `rg` binary selection inside the sandbox.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `command` | string | empty | Ripgrep binary to execute. |
| `args` | string[] | empty | Extra arguments. |
| `argv0` | string | empty | Optional `argv0` override. |

Use it when:

- the sandbox must invoke a specific ripgrep binary
- the sandbox wrapper requires a custom `argv0`

## Related

- [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
- [Safety Model](/guide/safety-model)
- [CLI Command Reference](/guide/cli-command-reference)
