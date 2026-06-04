# Agents And Models

This page documents the full `agents:` section of `tulkun.yaml`.

This is one of the most important parts of Tulkun configuration because it
defines:

- which agents exist
- which models they use
- how memory, planning, guardrails, and advanced runtime defaults behave

## `agents`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `agents.defaults` | object | empty object with runtime defaults applied | Shared defaults for agent behavior. |
| `agents.definitions` | object map | `main` is auto-created if missing | Named agent definitions. |

## `agents.definitions`

Each entry under `agents.definitions` is one named agent.

If `main` is omitted, Tulkun creates it automatically with:

- `role: Tulkun assistant`
- `goal: Help the user using workspace context and skills`
- `backstory: You are a careful, tool-using agent.`
- `max_iterations: 90`
- one empty `llm_providers` entry

### Agent Definition Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `agents.definitions.<name>.role` | string | empty, except auto-created `main` | Short role description. |
| `agents.definitions.<name>.goal` | string | empty, except auto-created `main` | Main operating goal. |
| `agents.definitions.<name>.backstory` | string | empty, except auto-created `main` | Additional role framing for prompts. |
| `agents.definitions.<name>.max_iterations` | integer | `90` if omitted or invalid | Maximum iterations for the agent run loop. |
| `agents.definitions.<name>.llm_providers` | object[] | at least one empty entry for `main` | Provider chain used by the agent. |
| `agents.definitions.<name>.loop_guard` | object | disabled unless configured | Loop-guard behavior for the agent. |
| `agents.definitions.<name>.heartbeat` | object | inherited from `agents.defaults.heartbeat` | Per-agent heartbeat override. |

### How To Use Named Agents

Use named agents when:

- different tasks require different models
- one agent should be review-focused while another is implementation-focused
- background or delegated work should use a different role definition

Avoid creating many weakly differentiated agents. The best named agents have a
clear operating purpose.

## `llm_providers`

`llm_providers` is an ordered provider chain.

Each entry includes provider identity, model identity, and optional runtime
overrides.

### Provider Entry Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `provider` | string | empty | Provider name such as `openai`, `anthropic`, `deepseek`, or `openrouter`. |
| `model` | string | empty | Model identifier. |
| `config.api_key` | string | empty | Provider API key. |
| `config.base_url` | string | empty | Override base URL. |
| `config.api_path` | string | empty | Override API path. |
| `config.params` | object | empty | Provider-native request parameters merged into the request body. |
| `params` | object | empty | Top-level alias accepted by current config loading; used only when `config.params` is empty. |

### Provider Credentials And Env Overrides

Provider credentials can be supplied by placeholder or `.env`.

Examples of supported environment names include:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`
- `XAI_API_KEY`
- `MISTRAL_API_KEY`
- `OLLAMA_API_KEY`

Use `config.base_url` when:

- pointing Tulkun at an OpenAI-compatible proxy
- using a self-hosted provider endpoint
- targeting an enterprise API gateway

Use `config.params` when:

- the model provider supports extra request-time knobs
- you need provider-native JSON options such as `temperature` or `max_tokens`

## `loop_guard`

Loop guard is an agent-level safety and recovery control.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | disabled unless configured | Enables loop guard. |
| `after_iterations` | integer | `0` | Start guarding after this many iterations. |
| `repeat_interval` | integer | `0` | Re-check cadence after activation. |
| `history_assistant_rounds` | integer | `0` | Assistant-round window provided to loop evaluation. |
| `rewrite_llm_providers` | object[] | empty | Provider chain used for rewrite assistance. |
| `eval_llm_providers` | object[] | empty | Provider chain used for evaluation assistance. |

Use loop guard when:

- long-running agent tasks can get stuck in repetitive behavior
- you want a dedicated cheaper model chain to assess or rewrite stalled work

## `agents.defaults`

`agents.defaults` centralizes the shared runtime policy for agents.

This is where most of Tulkun's advanced runtime behavior is configured.

## `agents.defaults.memory_search`

Controls the retrieval-oriented search memory subsystem.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | disabled unless configured | Enables memory search. |
| `provider` | string | empty | Embedding or search provider. |
| `model` | string | empty | Embedding model. |
| `fallback` | string | empty | Fallback search mode such as `fts`. |
| `remote.base_url` | string | empty | Remote search or embedding service base URL. |
| `remote.api_key` | string | empty | Remote service API key. |
| `remote.api_path` | string | empty | Remote API path. |
| `remote.headers` | object | empty | Extra HTTP headers. |
| `extra_paths` | string[] | empty | Extra search roots beyond built-in paths. |
| `query.hybrid.enabled` | boolean | disabled unless configured | Enables hybrid ranking. |
| `query.hybrid.candidate_multiplier` | number | `0` if omitted | Candidate expansion multiplier. |
| `query.hybrid.mmr.enabled` | boolean | disabled unless configured | Enables MMR diversification. |
| `query.hybrid.mmr.lambda` | number | `0` if omitted | MMR lambda. |
| `query.hybrid.temporal_decay.enabled` | boolean | disabled unless configured | Enables time-based recency bias. |
| `query.hybrid.temporal_decay.half_life_days` | number | `0` if omitted | Temporal half-life. |
| `store.vector.enabled` | boolean | disabled unless configured | Enables vector store usage. |
| `store.vector.extension_path` | string | empty | Loadable vector extension path. |
| `store.vector.embedding_dimensions` | integer | `0` if omitted | Embedding size. |

Use this block when:

- you want search-based recall from workspace or memory content
- you need external embedding infrastructure
- you need vector-backed search rather than fallback-only retrieval

## `agents.defaults.chat_history`

Controls recent transcript injection into prompts.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | Enables chat-history injection. |
| `max_turns` | integer | `40` | Maximum turns preserved for injection. |
| `max_chars_per_message` | integer | `12000` | Per-message truncation cap. |
| `max_injected_chars` | integer | `48000` | Total injected history cap. |

## `agents.defaults.memory_govern`

Controls scheduled memory governance behavior.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | Enables governance jobs. |
| `promote_interval_min` | integer | `0` unless set | Promotion interval in minutes. |
| `rem_interval_min` | integer | `0` unless set | REM-style interval in minutes. |
| `reindex_after_write` | boolean | `true` | Reindexes after memory writes. |
| `promote_dry_run` | boolean | `true` | Keeps promotion in dry-run mode unless changed. |
| `rem_apply` | boolean | disabled unless configured | Allows REM apply phase to mutate state. |
| `debounce_assistant_sec` | integer | `0` unless set | Debounce before governance reacts to assistant output. |

## `agents.defaults.memory_flush`

Controls flush-marker behavior when history is truncated.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | disabled unless configured | Enables flush markers. |
| `write_markdown_excerpt` | boolean | disabled unless configured | Writes markdown excerpts during flush. |
| `max_markdown_chars_per_day` | integer | `96000` | Daily markdown excerpt cap. |
| `max_compact_chars_per_turn` | integer | `800` | Per-turn compact excerpt cap. |

## `agents.defaults.evolution_proposals`

Controls proposal drafting from repeated tool failures.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | disabled unless configured | Enables proposal drafting. |
| `min_tool_errors_same_tool` | integer | `3` | Minimum repeated same-tool errors before drafting. |
| `on_batch_task_channel` | boolean | `false` | Enables proposal drafting on batch task channels. |
| `severe_error_substrings` | string[] | empty | Always-trigger error substrings. |
| `error_rate_min_errors` | integer | `0` | Minimum errors for rolling error-rate trigger. |
| `error_rate_window` | integer | `0` | Rolling window size for error-rate trigger. |
| `multi_tool_aggregate` | boolean | `false` | Allows aggregation across multiple tools. |

## `agents.defaults.evolution_dataset`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `sources` | string[] | empty | Dataset source scopes. |
| `max_rows_per_run` | integer | `5000` | Export row limit per run. |
| `redact_pii` | boolean | `true` | Redacts PII in exported rows. |

## `agents.defaults.evolution_post_turn`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | disabled unless configured | Enables post-turn evolution analysis. |
| `system_prompt_path` | string | empty | Prompt file for post-turn analysis. |
| `max_out_tokens` | integer | `1024` | Max output tokens for the post-turn run. |
| `budget_runs_per_hour` | integer | `8` | Hourly budget for post-turn runs. |

## `agents.defaults.evolution_strategy`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `evolution_strategy` | string | `balanced` | Strategy label for proposal and promotion behavior. |

## `agents.defaults.skill_edit`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `max_skill_runes` | integer | `120000` | Maximum accepted skill source size. |
| `max_patch_runes` | integer | `8000` | Maximum accepted patch size for skill-edit flows. |

## `agents.defaults.promote_gate`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `smoke_script_rel` | string | `scripts/evolution_smoke.sh` effective helper default | Relative or absolute smoke script. |
| `golden_dir_rel` | string | `workspace/evolution/golden` effective helper default | Relative or absolute golden directory. |
| `require_smoke_pass` | boolean | `false` | Requires smoke pass before promote. |
| `backup_on_promote` | boolean | `true` | Keeps backup artifacts on promote. |
| `dedupe_cooldown_hours` | integer | `6` | Proposal dedupe cooldown. |

## `agents.defaults.context_inject`

Controls what context sources are injected and how large they can become.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `workspace_bootstrap_md` | boolean | `true` | Includes workspace bootstrap guidance. |
| `workspace_rules_pre_hook` | boolean | `true` | Injects workspace rules in pre-hook context. |
| `context_engine_rules_source` | boolean | effective `false` when `workspace_rules_pre_hook` is on | Includes rules through the context engine source path. |
| `context_engine_history_source` | boolean | effective `false` when chat-history injection is enabled | Includes transcript history through context engine source path. |
| `active_memory_pre_hook` | boolean | `true` | Injects Active Memory in pre-hook context. |
| `skills_level0_source` | boolean | `true` | Exposes level-0 skills as a context source. |
| `workspace_rules_chain` | boolean | `true` | Enables workspace rules chaining. |
| `max_pre_hook_rules_chars` | integer | caller-specific fallback | Maximum pre-hook rules chars. |
| `max_render_item_preview` | integer | `300` | Preview chars per rendered item. |
| `max_context_engine_json_chars` | integer | caller-specific fallback | Context-engine JSON cap. |
| `max_active_memory_summary_chars` | integer | plugin-specific fallback | Active Memory summary cap. |
| `model_context_tokens` | integer | unset unless configured | Explicit model context window. |
| `warn_remaining_tokens` | integer | `8000` | Remaining-token warning threshold. |

## `agents.defaults.planner`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | Enables planner behavior. |
| `max_steps` | integer | `5` | Maximum planner steps. |
| `emit_default_plan` | boolean | `false` | Emits a default plan automatically. |
| `prefer_execute_in_agent_mode` | boolean | `true` | Prefers execution in agent mode. |

## `agents.defaults.mcp_servers`

MCP server entries expose external tool or resource servers to Tulkun.

### MCP Server Entry Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `name` | string | empty | Logical server name. |
| `transport` | string | empty | Transport kind such as `stdio` or `sse`. |
| `url` | string | empty | Endpoint URL for network transports. |
| `headers` | object | empty | Transport headers. |
| `oauth.mode` | string | empty, can be inferred | OAuth mode. |
| `oauth.access_token` | string | empty | Cached access token. |
| `oauth.token_type` | string | empty | Token type. |
| `oauth.client_id` | string | empty | Client ID. |
| `oauth.client_secret` | string | empty | Client secret. |
| `oauth.token_url` | string | empty | Token endpoint. |
| `oauth.authorization_url` | string | empty | Authorization endpoint. |
| `oauth.redirect_url` | string | empty | Redirect URL. |
| `oauth.refresh_token` | string | empty | Refresh token. |
| `oauth.scopes` | string[] | empty | OAuth scopes. |
| `disable_standalone_sse` | boolean | `false` | Disables standalone SSE fallback. |
| `command` | string | empty | Local command for stdio launch. |
| `args` | string[] | empty | Command args. |
| `env` | object | empty | Child-process environment overrides. |
| `dir` | string | empty | Working directory for the child process. |
| `inherit_parent_env` | boolean | `false` | Inherits parent environment. |
| `expected_command_sha256` | string | empty | Pinned command hash. |

## `agents.defaults.tool_classifier`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `false` unless configured or env-forced | Enables automatic tool classification. |
| `allow` | string[] | empty | Explicit allow list. |
| `soft_deny` | string[] | empty | Soft-deny list. |
| `environment` | string[] | empty | Environment variables exposed to the classifier. |

## `agents.defaults.long_run_sync`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | Enables long-run sync policy. |
| `strict` | boolean | `true` | Enforces strict long-run sync policy. |
| `wall_clock_threshold` | string | `30m` | Threshold before sync handling activates. |
| `poll_interval` | string | `15s` | Poll cadence for long-run checks. |
| `confirm_timeout` | string | `30m` | Timeout for pending confirmation. |
| `require_channel_confirm` | boolean | `true` | Requires explicit channel confirmation. |
| `memory_file_base` | string | `long_run` | Base name for long-run memory notes. |
| `skip_if_batch_tools_used` | boolean | `true` | Skips sync flow if batch tools were already used. |

## `agents.defaults.guardrails`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `profile` | string | `strict` | Guardrails profile label. |
| `prompt.delimiter_enabled` | boolean | `true` | Enables prompt delimiter wrapping. |
| `prompt.delimiter_begin` | string | empty | Delimiter start marker. |
| `prompt.delimiter_end` | string | empty | Delimiter end marker. |
| `prompt.sandwich_enabled` | boolean | `true` | Enables sandwich-style reminder tail. |
| `prompt.sandwich_tail` | string | empty | Sandwich tail text. |
| `input.rules_enabled` | boolean | `true` | Enables input-side rules checks. |
| `input.max_runes` | integer | `200000` | Input size limit. |
| `input.block_substrings` | string[] | empty | Hard-block substrings. |
| `input.policy_enforcer.enabled` | boolean | `false` | Enables model-assisted input policy enforcement. |
| `input.policy_enforcer.provider` | string | empty | Provider for policy enforcement. |
| `input.policy_enforcer.model` | string | empty | Model for policy enforcement. |
| `input.policy_enforcer.api_key_env` | string | empty | API key env name. |
| `input.policy_enforcer.timeout_seconds` | integer | `0` unless set | Enforcement timeout. |
| `output.heuristic_enabled` | boolean | `true` | Enables heuristic output checks. |
| `retrieval.baseline_enabled` | boolean | `true` | Enables retrieval-side baseline checks. |
| `retrieval.max_chunk_runes` | integer | `120000` | Retrieval chunk cap. |
| `http_sidecars_required` | boolean | `false` | Requires all configured sidecars to be available. |
| `http_sidecars` | object[] | empty | HTTP moderation or policy sidecars. |
| `external_moderation.enabled` | boolean | `true` | Enables external moderation endpoint calls. |
| `external_moderation.base_url` | string | empty | Moderation base URL. |
| `external_moderation.path` | string | empty | Moderation API path. |
| `external_moderation.timeout_seconds` | integer | `0` unless set | Moderation timeout. |

## `agents.defaults.heartbeat`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `every` | string | `30m` | Heartbeat cadence. |
| `prompt` | string | built-in heartbeat prompt | Heartbeat prompt text. |
| `include_system_prompt_section` | boolean | `true` | Includes heartbeat guidance in system prompt. |
| `ack_max_chars` | integer | `300` | Maximum heartbeat acknowledgement length. |
| `light_context` | boolean | `false` | Uses lighter context for heartbeat runs. |
| `isolated_session` | boolean | `false` | Runs heartbeat in an isolated session. |
| `target` | string | empty | Target agent ID. |
| `session` | string | empty | Target session ID. |
| `active_hours.start` | string | empty | Heartbeat active-hours start time. |
| `active_hours.end` | string | empty | Heartbeat active-hours end time. |
| `active_hours.timezone` | string | empty | Active-hours timezone. |

## `agents.defaults.token_estimate`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `encoding` | string | empty; runtime falls back to active model or `cl100k_base` | Explicit tokenizer encoding. |
| `model` | string | empty | Model used for token-estimation heuristics. |
| `fallback_rune_div4` | boolean | `true` | Allows rune/4 fallback when tokenizer initialization fails. |

## `agents.defaults.web_search`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `provider` | string | empty, behaves like `auto` | Search provider selection. |
| `tavily.api_key` | string | empty | Tavily API key. |
| `tavily.search_depth` | string | `basic` unless explicitly `advanced` | Tavily search depth. |
| `brave.api_key` | string | empty | Brave Search API key. |
| `baidu.api_key` | string | empty | Baidu web search API key. |

Accepted provider values:

- `auto`
- `tavily`
- `brave`
- `baidu`

## `agents.defaults.sourcegraph`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `enabled` | boolean | effective `true` when omitted | Enables Sourcegraph-backed features. |
| `graphql_endpoint` | string | empty | GraphQL endpoint. |
| `token` | string | empty | Sourcegraph token. |

## Related

- [Memory, Compaction, And Runtime Features](/config/memory-and-runtime-features)
- [Sandbox And Permissions](/config/sandbox-and-permissions)
- [Subagents and Workboards](/mechanics/subagents-and-workboards)
