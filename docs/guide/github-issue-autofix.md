# GitHub Issue Autofix

`github-issue-autofix` is Tulkun's built-in scheduled skill for repairing
GitHub issues, following issue and PR conversations, and opening pull requests.

The skill enters and exits coordinator mode itself. At runtime it first calls
`enter_coordinator_mode`, performs the workflow, records the result, and then
calls `exit_coordinator_mode`.

While coordinator mode is active:

- the main coordinator reads GitHub work and tracking state
- one repository-scoped subagent handles implementation work for one repository
- multiple repository subagents can run in parallel
- the main coordinator reviews diffs and verification evidence
- if review fails, the coordinator asks the same subagent to fix the issue
- after acceptance, the coordinator commits, pushes, opens or updates PRs, and
  creates or replies to GitHub comments

Coordinator mode has the same tool access as a normal Tulkun main agent. The
boundary is enforced by the skill prompt: the coordinator must not directly
implement repository source-code changes; repository subagents do that work.

Tulkun does not merge pull requests. A maintainer still reviews and merges.

## Configuration File

`github-issue-autofix` is configured only through a YAML file at this
conventional path:

```text
$TULKUN_HOME/cron/github-issue-autofix.yaml
```

If `TULKUN_HOME` is not set, the path is:

```text
$HOME/.tulkun/cron/github-issue-autofix.yaml
```

The skill reads this file at runtime on every scheduled run. There is no config
path argument and no `tulkun cron github-issue-autofix` command. Put the YAML
file at the conventional path for the workflow to take effect.

## Example Config

Each repository is configured separately under `repositories`:

```yaml
max_parallel_repositories: 2
branch_prefix: autofix/issue-

repositories:
  - repo: tulkun-lab/tulkun
    label: auto-fix
    base: main
    max_issues: 1
    worktree_root: $TULKUN_HOME/workspace/github-issue-autofix/tulkun-lab-tulkun
    tracking_state_dir: $TULKUN_HOME/workspace/github-issue-autofix/tulkun-lab-tulkun/state
    fork_before_pr: true
    fork_remote: tulkun-autofix-fork
    track_followups: true
    reply_to_issue_comments: true
    reply_to_pr_comments: true
    reply_to_review_threads: true

  - repo: example/api
    label: auto-fix
    base: main
    max_issues: 1
    worktree_root: $TULKUN_HOME/workspace/github-issue-autofix/example-api
    tracking_state_dir: $TULKUN_HOME/workspace/github-issue-autofix/example-api/state
    fork_before_pr: true
    fork_remote: tulkun-autofix-fork
    track_followups: true
    reply_to_issue_comments: true
    reply_to_pr_comments: true
    reply_to_review_threads: true
```

Unknown YAML keys are ignored.

Defaults are applied when a repository field is omitted:

| Field | Default |
| --- | --- |
| `max_parallel_repositories` | `4` |
| `branch_prefix` | `autofix/issue-` |
| `repositories[*].label` | `auto-fix` |
| `repositories[*].base` | `main` |
| `repositories[*].max_issues` | `1` |
| `repositories[*].worktree_root` | `$TULKUN_HOME/workspace/github-issue-autofix/<repo-slug>` |
| `repositories[*].tracking_state_dir` | `<worktree_root>/state` |
| `repositories[*].fork_before_pr` | `true` |
| `repositories[*].fork_remote` | `tulkun-autofix-fork` |
| `repositories[*].track_followups` | `true` |
| reply flags | `true` |

## Create The Scheduled Job

Create the job with the generic cron command:

```bash
tulkun cron create \
  --name github-issue-autofix \
  --schedule "0 * * * *" \
  --skill github-issue-autofix
```

`--schedule` accepts standard 5-field Linux cron expressions:

```text
0 * * * *        # hourly
*/30 * * * *     # every 30 minutes
30 9 * * 1-5     # weekdays at 09:30
```

Descriptors such as `@hourly`, `@daily`, and `@every 1h` are also supported.

Start Tulkun in gateway mode so the scheduler runs:

```bash
tulkun gateway start
```

You can trigger a created job manually:

```bash
tulkun cron run <job-id>
```

## Update Or Delete

Update the YAML file directly to change repositories or repository parameters.
The next scheduled run reads the current file from the conventional path.

Use the generic cron commands to update or delete the scheduled job:

```bash
tulkun cron update <job-id> --schedule "*/30 * * * *"
tulkun cron delete <job-id>
```

## Prerequisites

Run GitHub CLI login on the same host:

```bash
gh auth login
```

The authenticated account is used to read issues and PRs, fork target
repositories, push autofix branches, create or update pull requests, and reply
to comments.

Only open issues carrying the configured label are eligible. The default label
is `auto-fix`.

## Source Checkouts And Worktrees

Code changes happen inside isolated worktrees under each repository's
`worktree_root`. The source checkout and `main` branch are not modified.

If `source_dir` is set for a repository, it points at an existing local checkout
used as the source for `git worktree` creation. Otherwise, the repository
subagent creates or reuses a source checkout under that repository's
`worktree_root`.

Tulkun always forks before pushing. It pushes autofix branches to the fork
remote and opens pull requests back to the target repository.

## Runtime Flow

On each run, the skill:

1. bootstraps required host dependencies through
   `scripts/bootstrap-deps.sh`
2. loads `$TULKUN_HOME/cron/github-issue-autofix.yaml` through
   `scripts/load-config.py`
3. checks `gh auth status`
4. processes follow-up comments, PR comments, reviews, and review threads before
   selecting new issues
5. selects at most `max_issues` actionable issues per repository
6. starts at most one active subagent per repository
7. limits parallel repositories with `max_parallel_repositories`
8. reviews every subagent result as the coordinator
9. sends concrete fixes back to the same repository subagent until accepted or
   failed for a real blocker
10. commits accepted work, pushes to the fork remote, creates or updates PRs,
    and creates or replies to GitHub comments
11. calls `exit_coordinator_mode`

The run ends with a machine-readable `GITHUB_ISSUE_AUTOFIX_RESULT_JSON` line.

## Troubleshooting

If the job fails before selecting issues, check:

- the YAML file exists at `$TULKUN_HOME/cron/github-issue-autofix.yaml`
- `repositories` is a non-empty YAML list
- each `repo` uses `owner/repo`
- `gh auth status` succeeds
- the authenticated GitHub account can read each target repository
- each target issue has the configured label

If no PR is created, check whether the issue was skipped because it is
ambiguous, security-sensitive, already has an open autofix PR, or lacks a clear
implementation path.
