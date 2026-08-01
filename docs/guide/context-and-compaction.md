# Context and Compaction

Tulkun uses replacement-history compaction. It replaces the model's
active history with one provider-produced compacted history
or one local handoff summary, while keeping the transcript append-only for audit
and resume.

## When Compaction Runs

Automatic compaction is always active. It is checked:

- before recording the incoming user message for a new turn
- between model samples during a turn
- after a provider reports that the context window was exceeded

The default threshold is the model's automatic-compaction limit, capped at 90%
of its full context window. A positive
`compact.model_auto_compact_token_limit` can lower that threshold but cannot
raise it. The full model context window is always a hard cap.

`compact.model_auto_compact_token_limit_scope` controls threshold accounting:

- `total` counts the complete active context
- `body_after_prefix` counts growth after the input-token baseline of the
  current compact window

The incoming message is not included in the pre-turn compaction request. It is
appended exactly once to the replacement history afterward.

## Manual `/compact`

`/compact` immediately runs the same compaction pipeline with reason
`user_requested`. It runs `PreCompact` before the request and `PostCompact`
after a successful checkpoint. Automatic compaction uses the same hooks with an
automatic trigger.

In the terminal UI, an indeterminate animated bar is shown for the complete
compact request lifetime. The running card is replaced by the completed or
failed compact result, so provider failures cannot leave stale progress behind.

## Provider And Local Semantics

For OpenAI Responses, remote v2 is the default. Tulkun sends the current history
to the normal `/responses` endpoint with an input item of type
`compaction_trigger`. The response must contain exactly one compaction item; its
opaque encrypted content is stored and replayed without interpretation. Recent
eligible user history is retained within the provider-compatible 64,000-token
budget.

When `compact.remote_compaction_v2` is `false`, Tulkun uses
`/responses/compact`. The provider response becomes the replacement history
after stale developer, system, tool, and non-conversation items are removed.

Providers without remote compaction use the current main model and the built-in 
handoff prompt. On context-window errors, Tulkun retries after removing
the oldest history item. The replacement contains up to 20,000 tokens of the
newest real user messages, followed by a user-role handoff summary with the 
summary prefix. The oldest partially retained user message keeps its
beginning and end with a truncation marker.

## Checkpoints And Resume

Every successful compaction appends a durable checkpoint containing the complete
replacement history. Checkpoints form a UUID-v7 window chain with the current,
previous, and first window IDs and a monotonically increasing window number.

On resume, Tulkun reconstructs model context from the latest checkpoint plus
the transcript suffix written after it. Older transcript rows remain available
for audit but are no longer model-active. A mid-turn compaction reinjects the
current initial instructions immediately before the newest real user or compact
item; pre-turn and manual compaction wait for the next normal turn to inject
fresh instructions.

## Related

- [Architecture](/guide/architecture)
- [Memory Systems](/guide/memory-systems)
- [Configuration](/config/memory-and-runtime-features)
