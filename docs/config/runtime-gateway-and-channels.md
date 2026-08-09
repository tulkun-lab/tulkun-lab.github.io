# Runtime, Gateway, And Channels

This page documents the runtime-facing parts of `tulkun.yaml`:

- top-level runtime identity settings
- gateway service behavior
- messaging and webhook integrations

## Top-Level Runtime Settings

### `personality`

Controls the global personality selection used by supported models.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `personality` | string | empty in file; effective runtime fallback is `friendly` | Selects global response style for models that honor personality selection. |

Accepted values:

- `friendly`
- `pragmatic`
- `none`

What it affects:

- global response style selection for supported OpenAI-family models
- agent tone shaping when the active model supports explicit personality mode

What it does not affect:

- models that ignore personality settings
- skill instructions
- hooks
- memory prompts

Use it when:

- you want Tulkun to feel more direct and engineering-oriented across sessions
- you want to disable explicit personality selection for supported models

## `gateway`

The `gateway` block controls Tulkun's service runtime.

It matters for:

- local HTTP access
- web clients
- API-backed sessions
- cross-surface operation

### Gateway Reference

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `gateway.http_addr` | string | `127.0.0.1:6060` | HTTP listen address for the Tulkun gateway. |
| `gateway.cors_origins` | string[] | `http://127.0.0.1:5173`, `http://localhost:5173`, `http://127.0.0.1:3000`, `http://localhost:3000` | Browser origins allowed by CORS. |
| `gateway.auth.mode` | string | `token` | Selects gateway auth mode. |
| `gateway.auth.token` | string | empty | Token credential for token-based auth. |
| `gateway.auth.password` | string | empty | Password credential for password-based auth if used. |
| `gateway.grpc.port` | string | empty | Optional gRPC port for gateway-side runtime services. |
| `gateway.banner` | boolean | unset unless configured | Enables or disables gateway banner output. |
| `gateway.banner_text` | string | empty | Custom text shown in the banner. |
| `gateway.manage_enable` | boolean | unset unless configured | Enables management endpoints when supported by the runtime. |
| `gateway.enable_response_gzip` | boolean | unset unless configured | Enables gzip compression for responses. |
| `gateway.log_req_enable` | boolean | unset unless configured | Logs inbound gateway requests. |
| `gateway.route_root_path` | string | empty | Prefix root for gateway routes. |
| `gateway.write_timeout` | string | empty | HTTP write timeout duration. |
| `gateway.read_timeout` | string | empty | HTTP read timeout duration. |
| `gateway.idle_timeout` | string | empty | HTTP idle timeout duration. |
| `gateway.grace_timeout` | string | empty | Graceful shutdown timeout. |
| `gateway.service_name` | string | empty | Service identity label. |
| `gateway.service_group` | string | empty | Service grouping label. |
| `gateway.service_version` | string | empty | Service version label. |
| `gateway.log_level` | string | empty | Gateway log verbosity level. |
| `gateway.log_path` | string | empty | Output directory for gateway logs. |
| `gateway.log_caller` | boolean | unset unless configured | Includes caller metadata in logs. |
| `gateway.log_discard` | boolean | unset unless configured | Discards gateway logs entirely. |

### How To Use The Gateway Block

`gateway.http_addr` is the most important field for local bring-up.

Use it when:

- you need Tulkun reachable by a browser, web client, or external caller
- you want to bind to a non-default interface or port

`gateway.cors_origins` matters when:

- you are serving the docs, UI, or a local web app from a different origin
- browser requests fail because of CORS

`gateway.auth.*` matters when:

- exposing Tulkun beyond a strictly local environment
- integrating with a web client that must authenticate

The timeout fields matter when:

- you are proxying long-running requests
- large responses or slow clients cause connection churn

The service identity and logging fields matter when:

- you run Tulkun as part of a larger platform
- you need clearer service metadata in logs or observability pipelines

## Messaging And Integration Channels

Tulkun includes multiple channel blocks for inbound and outbound integrations.

Each channel typically answers the same four questions:

1. is the integration enabled?
2. where does inbound traffic arrive?
3. where does outbound traffic go?
4. which credentials or policies does the integration require?

## Common Channel Patterns

### Simple bot-token channels

These channels mostly require an `enabled` switch and a bot token.

| Section | Fields |
| --- | --- |
| `telegram` | `enabled`, `bot_token` |
| `discord` | `enabled`, `bot_token` |

Use them when:

- Tulkun should receive events directly from the platform bot interface

### Inbound webhook plus outbound bridge channels

These channels usually define:

- `enabled`
- `inbound_path`
- `outbound_url`
- `token`
- `secret`

This pattern applies to:

- `slack`
- `whatsapp`
- `email`
- `sms`
- `webhook`
- `bluebubbles`

### Outbound bridge-only channels

These channels define:

- `enabled`
- `outbound_url`
- `token`

This pattern applies to:

- `signal`
- `mattermost`
- `matrix`
- `homeassistant`

### Policy-driven chat platforms

These channels include sender, group, or DM policy controls:

- `weixin`
- `feishu`
- `dingtalk`
- `qq`

## Channel Reference

### `wecom`

Primary WeCom enterprise callback integration.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `wecom.enabled` | boolean | `false` | Enables WeCom callback handling. |
| `wecom.token` | string | empty | Verification token. |
| `wecom.encoding_aes_key` | string | empty | WeCom callback encryption key. |
| `wecom.corp_id` | string | empty | Enterprise corp ID. |
| `wecom.corp_secret` | string | empty | Enterprise app secret. |
| `wecom.agent_id` | integer | `0` | WeCom application agent ID. |
| `wecom.callback_path` | string | `/wecom/callback` | Inbound callback route exposed by Tulkun. |

Use it when:

- Tulkun should receive enterprise WeCom callbacks directly

### `wecom_callback`

Alternate WeCom callback surface.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `wecom_callback.enabled` | boolean | `false` | Enables the alternate WeCom callback surface. |
| `wecom_callback.token` | string | empty | Verification token. |
| `wecom_callback.encoding_aes_key` | string | empty | Encryption key. |
| `wecom_callback.corp_id` | string | empty | Corp ID. |
| `wecom_callback.corp_secret` | string | empty | Corp secret. |
| `wecom_callback.agent_id` | integer | `0` | Agent ID. |
| `wecom_callback.callback_path` | string | `/wecom_callback/callback` | Alternate inbound callback route. |

### `telegram`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `telegram.enabled` | boolean | `false` | Enables Telegram bot ingress. |
| `telegram.bot_token` | string | empty | Telegram bot token. |

### `discord`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `discord.enabled` | boolean | `false` | Enables Discord bot ingress. |
| `discord.bot_token` | string | empty | Discord bot token. |

### `slack`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `slack.enabled` | boolean | `false` | Enables Slack integration. |
| `slack.inbound_path` | string | `/channels/slack/inbound` | Slack inbound webhook route. |
| `slack.outbound_url` | string | empty | Optional outbound bridge URL. |
| `slack.bot_token` | string | empty | Slack bot token. |
| `slack.secret` | string | empty | Slack signing secret. |

Use it when:

- Tulkun must receive Slack events through the gateway
- Slack request signature validation is required

### `whatsapp`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `whatsapp.enabled` | boolean | `false` | Enables WhatsApp bridge integration. |
| `whatsapp.inbound_path` | string | `/channels/whatsapp/inbound` | Inbound webhook route. |
| `whatsapp.outbound_url` | string | `http://127.0.0.1:3000` | Outbound bridge endpoint. |
| `whatsapp.token` | string | empty | Integration token. |
| `whatsapp.secret` | string | empty | Integration secret. |

`whatsapp.outbound_url` is one of the few channel fields with a built-in runtime
default. It assumes a local bridge process unless you override it.

### `signal`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `signal.enabled` | boolean | `false` | Enables Signal bridge integration. |
| `signal.outbound_url` | string | empty | Outbound Signal bridge endpoint. |
| `signal.token` | string | empty | Integration token. |

### `mattermost`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `mattermost.enabled` | boolean | `false` | Enables Mattermost bridge integration. |
| `mattermost.outbound_url` | string | empty | Outbound hook endpoint. |
| `mattermost.token` | string | empty | Integration token. |

### `matrix`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `matrix.enabled` | boolean | `false` | Enables Matrix bridge integration. |
| `matrix.outbound_url` | string | empty | Outbound bridge endpoint. |
| `matrix.token` | string | empty | Integration token. |

### `homeassistant`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `homeassistant.enabled` | boolean | `false` | Enables Home Assistant integration. |
| `homeassistant.outbound_url` | string | `http://homeassistant.local:8123` | Home Assistant base URL. |
| `homeassistant.token` | string | empty | Home Assistant access token. |

### `email`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `email.enabled` | boolean | `false` | Enables email ingress and egress. |
| `email.inbound_path` | string | `/channels/email/inbound` | Email inbound route. |
| `email.outbound_url` | string | empty | Outbound mail bridge URL. |
| `email.token` | string | empty | Channel token. |
| `email.secret` | string | empty | Channel secret. |

### `sms`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `sms.enabled` | boolean | `false` | Enables SMS ingress and egress. |
| `sms.inbound_path` | string | `/channels/sms/inbound` | SMS inbound route. |
| `sms.outbound_url` | string | empty | Outbound bridge URL. |
| `sms.token` | string | empty | Channel token. |
| `sms.secret` | string | empty | Channel secret. |

### `webhook`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `webhook.enabled` | boolean | `false` | Enables generic webhook ingestion. |
| `webhook.inbound_path` | string | `/channels/webhook/inbound` | Generic inbound route. |
| `webhook.outbound_url` | string | empty | Optional outbound callback URL. |
| `webhook.token` | string | empty | Integration token. |
| `webhook.secret` | string | empty | Integration secret. |

### `bluebubbles`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `bluebubbles.enabled` | boolean | `false` | Enables BlueBubbles integration. |
| `bluebubbles.inbound_path` | string | `/channels/bluebubbles/inbound` | Inbound route. |
| `bluebubbles.outbound_url` | string | empty | Outbound bridge URL. |
| `bluebubbles.token` | string | empty | Integration token. |
| `bluebubbles.secret` | string | empty | Integration secret. |

### `weixin`

Weixin is more policy-rich than basic webhook channels.

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `weixin.enabled` | boolean | `false` | Enables Weixin integration. |
| `weixin.base_url` | string | `https://ilinkai.weixin.qq.com` | Base service URL. |
| `weixin.cdn_base_url` | string | empty | CDN base for media asset access. |
| `weixin.token` | string | empty | Weixin token. |
| `weixin.account_id` | string | empty | Account identifier. |
| `weixin.bot_type` | string | empty | Bot flavor or channel label. |
| `weixin.channel_version` | string | empty | Bridge version or protocol label. |
| `weixin.route_tag` | string | empty | Internal route partition tag. |
| `weixin.silk_voice_decode` | boolean | `false` | Enables Silk voice decoding. |
| `weixin.dm_policy` | string | `open` | Direct-message access policy. |
| `weixin.allow_from` | string[] | empty | Sender allowlist. |

Use `dm_policy` and `allow_from` when:

- the channel should be restricted to approved senders
- Tulkun should operate in a narrower production context

### `feishu`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `feishu.enabled` | boolean | `false` | Enables Feishu integration. |
| `feishu.app_id` | string | empty | App ID. |
| `feishu.app_secret` | string | empty | App secret. |
| `feishu.domain` | string | `feishu` | Domain selector. |
| `feishu.connection_mode` | string | `websocket` | Connection transport mode. |
| `feishu.group_policy` | string | `allowlist` | Group access policy. |
| `feishu.group_allow_from` | string[] | empty | Allowed group identifiers. |

### `dingtalk`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `dingtalk.enabled` | boolean | `false` | Enables DingTalk integration. |
| `dingtalk.client_id` | string | empty | Client ID. |
| `dingtalk.client_secret` | string | empty | Client secret. |
| `dingtalk.dm_policy` | string | `open` | Direct-message policy. |
| `dingtalk.group_policy` | string | `open` | Group access policy. |
| `dingtalk.allow_from` | string[] | empty | DM sender allowlist. |
| `dingtalk.group_allow_from` | string[] | empty | Group allowlist. |

### `qq`

| Field | Type | Default | Usage |
| --- | --- | --- | --- |
| `qq.enabled` | boolean | `false` | Enables QQ integration. |
| `qq.app_id` | string | empty | QQ app ID. |
| `qq.client_secret` | string | empty | QQ client secret. |
| `qq.allow_from` | string[] | empty | Sender allowlist. |

## Environment Overrides

Many credentials can be injected from `~/.tulkun/.env`.

Representative examples:

- `TULKUN_GATEWAY_TOKEN`
- `TULKUN_GATEWAY_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `DISCORD_BOT_TOKEN`
- `SLACK_BOT_TOKEN`
- `SLACK_SECRET`
- `WHATSAPP_TOKEN`
- `WHATSAPP_SECRET`
- `SOURCEGRAPH_TOKEN`

Use environment overrides when:

- the same config file is shared across environments
- secrets must stay outside version control
- deployment systems inject credentials at runtime

## Related

- [Agents And Models](/config/agents-and-models)
- [Sandbox And Permissions](/config/sandbox-and-permissions)
- [CLI and Surfaces](/guide/cli-and-surfaces)
