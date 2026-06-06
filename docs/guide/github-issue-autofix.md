# GitHub Issue Autofix

`github-issue-autofix` is Tulkun's built-in scheduled workflow for repairing
GitHub issues and opening pull requests.

It is designed for this operating mode:

- the Tulkun gateway is already running
- cron scheduling is enabled by the gateway runtime
- the host has a GitHub account authenticated through `gh`
- target issues are explicitly labeled for automation
- Tulkun fixes at most a small number of issues per run
- Tulkun always forks before pushing and creating a pull request
- Tulkun keeps following issue and PR conversations after the first PR

The workflow is implemented as a built-in skill named
`github-issue-autofix`. The cron job stores the schedule and run-specific
arguments. The repair logic, GitHub workflow, fork-first behavior, verification
rules, and follow-up conversation handling live in the skill.

## What It Does

On each scheduled run, Tulkun:

1. loads the `github-issue-autofix` skill
2. reads the cron job's `skill_args`
3. checks or bootstraps required host dependencies
4. verifies `gh auth status`
5. processes follow-up comments on Tulkun-created issues and PRs
6. selects a labeled open issue only when there is no follow-up work
7. creates or reuses an isolated worktree for that issue
8. forks the target repository before pushing any branch
9. implements the fix, verifies it, commits it, and pushes to the fork
10. opens a pull request against the target repository
11. ends with a machine-readable `GITHUB_ISSUE_AUTOFIX_RESULT_JSON` line

Tulkun does not merge the pull request. A maintainer still reviews and merges.

## Prerequisites

### Tulkun Runtime

Start Tulkun in gateway mode first:

```bash
tulkun gateway start
```

The gateway runtime starts the cron scheduler. The scheduled job will not run
on its interval unless the gateway is running.

You can also trigger a created job manually with:

```bash
tulkun cron run <job-id>
```

### GitHub Authentication

Run GitHub CLI login manually on the same host:

```bash
gh auth login
```

This is intentionally manual. Tulkun checks `gh auth status`, but it does not
perform interactive GitHub login for you because login requires an explicit
GitHub identity, browser or device-code authorization, and token scope approval.

The account authenticated in `gh` is the account Tulkun uses to:

- read issues and comments
- fork the target repository
- push autofix branches to the fork
- create pull requests
- comment on issues and pull requests
- reply to review follow-ups when needed

For private repositories, that GitHub account must already have access to the
target repository.

### GitHub Label

Only open issues carrying the configured label are eligible.

The default label is:

```text
auto-fix
```

This label is the main safety gate. Do not label broad design requests,
security-sensitive reports, or ambiguous issues unless they are appropriate for
automated repair.

## Create The Default Job

For Tulkun's own repository, create the hourly job with:

```bash
tulkun cron github-issue-autofix
```

This creates a cron job with these defaults:

| Setting | Default |
| --- | --- |
| Job name | `github-issue-autofix` |
| Schedule | `@every 1h` |
| Target repository | `tulkun-lab/tulkun` |
| Issue label gate | `auto-fix` |
| Base branch | `main` |
| Maximum new issues per run | `1` |
| Worktree root | `$TULKUN_HOME/workspace/github-issue-autofix` |
| Follow-up tracking | enabled |
| Tracking state directory | `<worktree root>/state` |
| Fork before PR | enabled |
| Fork remote name | `tulkun-autofix-fork` |

## Configure A Different Repository

Use `--repo` to select the target repository:

```bash
tulkun cron github-issue-autofix \
  --repo owner/repo \
  --label auto-fix \
  --base main \
  --schedule "@every 1h"
```

The target repository must use the `owner/repo` form.

Tulkun does not assume the authenticated account has write permission to that
repository. It forks first, pushes the repair branch to the fork, then creates a
pull request back to the target repository.

## Recommended Setup For Tulkun Itself

When running the workflow against `github.com/tulkun-lab/tulkun`, use the local
Tulkun checkout as the source directory:

```bash
tulkun cron github-issue-autofix \
  --repo tulkun-lab/tulkun \
  --label auto-fix \
  --base main \
  --schedule "@every 1h" \
  --source-dir /path/to/tulkun
```

`--source-dir` should point at a clean local checkout of the target repository.
Tulkun uses that checkout only as the source for `git worktree` creation. Code
changes happen inside isolated issue worktrees under `--worktree-root`, not in
the source checkout.

## Complete CLI Configuration

| Flag | Default | Meaning |
| --- | --- | --- |
| `--name` | `github-issue-autofix` | Cron job name. |
| `--schedule` | `@every 1h` | Run interval or 5-field cron expression. |
| `--repo` | `tulkun-lab/tulkun` | Target GitHub repository in `owner/repo` form. |
| `--label` | `auto-fix` | Required issue label for selecting new issues. |
| `--base` | `main` | Target repository base branch for worktrees and PRs. |
| `--max-issues` | `1` | Maximum new issues to repair in one run. |
| `--worktree-root` | `$TULKUN_HOME/workspace/github-issue-autofix` | Directory for isolated issue worktrees and tracking state. |
| `--source-dir` | empty | Existing local checkout used for `git worktree` creation. |
| `--prompt` | empty | Extra instruction appended to the scheduled skill run. |
| `--channel` | empty | Optional delivery channel ID for job output. |
| `--session` | empty | Optional delivery session ID for job output. |

`--schedule` accepts `@every <duration>` values such as `@every 1h` and 5-field
cron expressions. The built-in default is hourly.

## Generated Skill Arguments

The specialized command creates a normal cron job whose `skill` is:

```text
github-issue-autofix
```

It also writes `skill_args` similar to this:

```text
repo: tulkun-lab/tulkun
label: auto-fix
base: main
max_issues: 1
worktree_root: /path/to/.tulkun/workspace/github-issue-autofix
fork_before_pr: true
fork_remote: tulkun-autofix-fork
track_followups: true
tracking_state_dir: /path/to/.tulkun/workspace/github-issue-autofix/state
reply_to_issue_comments: true
reply_to_pr_comments: true
reply_to_review_threads: true
source_dir: /path/to/tulkun
```

These arguments are passed into the skill as run-specific configuration. The
skill body remains the source of truth for the workflow.

## Fork-First PR Semantics

The workflow must not assume Tulkun has direct write access to the target
repository.

For every repair, Tulkun follows this model:

1. create or reuse a fork with `gh repo fork <repo> --clone=false --remote=false`
2. fetch the base branch from the target repository
3. create an isolated worktree from `origin/<base>`
4. add or update the fork remote named `tulkun-autofix-fork`
5. push the autofix branch to the fork remote
6. create the PR with `--head <fork-owner>:<branch>`

Branches use the built-in prefix:

```text
autofix/issue-
```

The source checkout is never edited directly. The base branch is never pushed.

## Follow-Up Conversation

The workflow is not a one-shot fixer. It continues conversations for issues and
PRs where Tulkun already participated.

Before selecting a new issue, each run checks:

- issue comments after Tulkun's last action
- PR comments after Tulkun's last action
- review comments
- unresolved review threads
- maintainer requests for changes
- failed verification reports that require a response

If a follow-up only asks a question, Tulkun replies directly and updates its
tracking state.

If a follow-up requests a code change, Tulkun reuses the same issue worktree and
branch, applies the change, reruns verification, pushes to the fork remote, and
comments with the result.

The tracking state lives under:

```text
<worktree root>/state
```

The workflow does not post empty acknowledgement comments. It replies only when
there is an actionable question, requested clarification, review comment,
requested change, or verification issue.

## Dependency Bootstrap

The built-in skill has a bundled dependency bootstrap script:

```text
<cron_skill_dir>/scripts/bootstrap-deps.sh
```

During preflight the skill runs that script before using GitHub or Git tooling.
The script checks for:

- `git`
- `gh`

If a dependency is missing, the script detects the host operating system and CPU
architecture with `uname -s` and `uname -m`.

For `gh`, it tries a supported package manager first. If that is not available,
it downloads a matching GitHub CLI release for the detected OS and architecture.

For `git`, it uses a supported package manager when possible. If no supported
installer is available, it fails clearly and points the operator to Git's
official install path.

The default local install directory is:

```text
$HOME/.tulkun/bin
```

Override it with:

```bash
export TULKUN_GITHUB_ISSUE_AUTOFIX_DEPS=/custom/bin
```

Make sure that directory is on `PATH` for future gateway runs if the bootstrap
script installs binaries there.

## Skill Priority And Override Behavior

The cron job references the normal skill name:

```text
github-issue-autofix
```

Tulkun resolves it through the normal skill root priority order. Built-in system
skills are installed under:

```text
$TULKUN_HOME/skills/.system
```

That `.system` root is always the lowest-priority fallback. A same-name skill in
a project, workspace, or user skill root shadows the built-in system skill.

This is intentional. The built-in workflow provides the product default, while
operators can override it by installing a higher-priority
`github-issue-autofix` skill.

## Inspect And Operate The Job

List cron jobs:

```bash
tulkun cron jobs
```

Inspect a job:

```bash
tulkun cron inspect <job-id>
```

Trigger a job immediately:

```bash
tulkun cron run <job-id>
```

Pause or resume a job:

```bash
tulkun cron pause <job-id>
tulkun cron resume <job-id>
```

Delete a job:

```bash
tulkun cron delete <job-id>
```

The gateway API also exposes cron job routes under `/api/cron/jobs` for service
integrations that need to create, inspect, update, pause, resume, run, or delete
jobs programmatically.

## Safety Model

The built-in workflow enforces these rules:

- only open issues with the configured label are eligible
- follow-up work is processed before new issue selection
- one new issue per run by default
- ambiguous, security-sensitive, design-heavy, or under-specified issues are
  skipped
- all code changes happen in isolated worktrees
- the target repository is forked before branch push
- autofix branches are pushed to the fork remote
- PRs are opened from the fork into the target repository
- the base branch is never committed to or pushed
- the source checkout is never edited directly
- tests, secret validation, permission checks, and tool safety must not be
  weakened to make an issue pass
- no empty acknowledgement-only comments are posted
- maintainers still review and merge PRs

## Troubleshooting

### The job does not run every hour

Confirm the gateway is running:

```bash
tulkun gateway status
```

Then inspect the job:

```bash
tulkun cron jobs
tulkun cron inspect <job-id>
```

The scheduler is part of the gateway runtime, so a stopped gateway means no
scheduled execution.

### GitHub authentication fails

Run:

```bash
gh auth status
```

If it fails, run:

```bash
gh auth login
```

Use the GitHub account that should own the fork, push branches, create PRs, and
reply to comments.

### Tulkun cannot create a PR

Check these conditions:

- the authenticated `gh` account can read the target repository
- the account can fork the repository
- the fork exists or can be created
- the worktree branch was pushed to the fork remote
- the PR head uses `<fork-owner>:<branch>`

The workflow does not require direct write access to the target repository.

### Dependency bootstrap installs `gh` but later runs cannot find it

If the script installed `gh` into `$HOME/.tulkun/bin`, add that directory to the
environment used by the Tulkun gateway:

```bash
export PATH="$HOME/.tulkun/bin:$PATH"
```

If you use a custom install directory, also set:

```bash
export TULKUN_GITHUB_ISSUE_AUTOFIX_DEPS=/custom/bin
export PATH="/custom/bin:$PATH"
```

### A labeled issue is skipped

Tulkun may skip an issue if it is ambiguous, security-sensitive, mostly design
discussion, too broad, under-specified, already has an open autofix PR, or cannot
be repaired reliably in the current run.

### A PR review comment did not receive a reply

The workflow replies only when Tulkun is expected to respond. It avoids empty
acknowledgements and repetitive status comments. If a review comment requests a
specific change or asks a question, the next run should process it before
selecting a new issue.

## Related

- [CLI Command Reference](/guide/cli-command-reference)
- [Skills and Tools](/mechanics/skills-and-tools)
- [Runtime, Gateway, And Channels](/config/runtime-gateway-and-channels)
