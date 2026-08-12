# Sandbox And Permissions

This page is the configuration reference for Tulkun's sandbox controls.

This page does not explain the full safety model. It documents the config
surface that shapes execution isolation and dangerous fallback behavior.

## `sandbox_mode`

`sandbox_mode` defaults to `read-only` and accepts exactly:

- `read-only`: files are readable and writes are denied.
- `workspace-write`: the workspace and configured writable roots are writable.
- `danger-full-access`: commands run without an operating-system sandbox.

When a selected sandbox backend is unavailable, execution fails closed. A
single command can request host execution with
`sandbox_permissions: require_escalated`; whether an approval prompt may be
shown is controlled by `approval_policy`.

`--yolo` sets `approval_policy` to `never` and `sandbox_mode` to
`danger-full-access` for the process.

## `sandbox`

The `sandbox` object contains detailed filesystem, network, violation, and
platform-backend settings. It does not select whether commands are sandboxed;
that selection belongs to `sandbox_mode`.

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
