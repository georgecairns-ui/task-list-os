# Call recording and meeting transcription tools: how Claude connects

Verified on 2026-10-06

Scope: read access to call transcripts and summaries so Claude (mainly Claude Code, sometimes the Claude desktop app) can create follow-up tasks. Every fact below comes from a vendor page, vendor help centre or Anthropic page opened on the date above. Anything not confirmed on an official page is marked NOT VERIFIED.

## How connectors reach Claude Code (applies to every tool below)

| Item | Detail |
|---|---|
| Connector added in claude.ai | Connectors added at claude.ai/customize/connectors are automatically available in Claude Code, shown in the `/mcp` panel, when Claude Code is logged in with a claude.ai subscription account |
| When they do not load | Not loaded when Claude Code uses `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, Bedrock or Google Cloud |
| Add a remote MCP server by hand | `claude mcp add --transport http <name> <url>` |
| Sign in to an OAuth server | Run `/mcp` inside Claude Code, or `claude mcp login <name>` |
| Add an API key header | `claude mcp add --transport http <name> <url> --header "Authorization: Bearer <token>"` |
| Source | https://code.claude.com/docs/en/mcp |

## 1. Fathom

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Fathom - Your Meeting Intelligence Layer" (search "Fathom"). Built by Fathom, Anthropic verified. Tools: get_identity, list_teams, list_meetings, get_meeting_summary, get_meeting_transcript, find_person, search_meetings (all read tools) |
| Vendor MCP server | `https://api.fathom.ai/mcp`. Auth: sign-in "authorization prompts" (vendor page does not name OAuth explicitly; NOT VERIFIED as OAuth) |
| Claude Code command (vendor documented) | `claude mcp add fathom -- npx mcp-remote@latest https://api.fathom.ai/mcp` |
| Plans | Fathom pricing page lists "Public API & MCP" and "Claude & ChatGPT Integrations" on Premium, Team, Business and Enterprise. Not on Free |
| Public API | Yes, REST. Base URL `https://api.fathom.ai/external/v1` |
| Where to create the key | User Settings, API Access section (https://fathom.video/customize#api-access-header), then generate an API key. Key only sees meetings you recorded or that were shared with you or your Team |
| Auth header | `X-Api-Key: YOUR_API_KEY` |
| Read-only list request | `curl https://api.fathom.ai/external/v1/meetings -H "X-Api-Key: YOUR_API_KEY"` |
| Fallback | Not needed |

Sources: https://claude.com/connectors/fathom, https://developers.fathom.ai/mcp-docs/claude, https://developers.fathom.ai/quickstart, https://developers.fathom.ai/api-reference/meetings/list-meetings, https://www.fathom.ai/pricing

## 2. Fireflies.ai

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Fireflies". Built by Fireflies AI Corp, Anthropic verified. Tools: get_user, get_transcript, get_transcripts |
| Vendor MCP server | `https://api.fireflies.ai/mcp`. Auth: OAuth (Google or Microsoft sign-in, recommended) or API key as `Authorization: Bearer YOUR_API_KEY` |
| Claude Code command (vendor documented) | NOT VERIFIED. Fireflies documents a Claude Desktop JSON config using `npx mcp-remote https://api.fireflies.ai/mcp --header "Authorization: Bearer YOUR_API_KEY_HERE"`. The generic Anthropic syntax would be `claude mcp add --transport http fireflies https://api.fireflies.ai/mcp` |
| Plans | Fireflies help page says the connector needs a paid Claude plan (Pro, Team or Enterprise). Fireflies plan needed for the connector: NOT VERIFIED. API rate limits by Fireflies plan: Free 50 requests per day, Pro 500 per day, Business and Enterprise 60 per minute |
| Public API | Yes, GraphQL at `https://api.fireflies.ai/graphql` |
| Where to create the key | Log in at fireflies.ai, Integrations section, click Fireflies API, copy the API key |
| Auth header | `Authorization: Bearer your_api_key` |
| Read-only list request | `curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer your_api_key" --data '{ "query": "query Transcripts($userId: String) { transcripts(user_id: $userId) { title id } }" }' https://api.fireflies.ai/graphql` |
| Fallback | Not needed |

Sources: https://claude.com/connectors/fireflies, https://guide.fireflies.ai/articles/8272956938-learn-about-the-fireflies-mcp-server-model-context-protocol, https://docs.fireflies.ai/fundamentals/authorization, https://docs.fireflies.ai/fundamentals/limits, https://docs.fireflies.ai/graphql-api/query/transcripts

## 3. Otter.ai

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Otter.ai". Built by Otter.ai, Anthropic verified, added April 2026. Tools: get_user_info, search, fetch |
| Vendor MCP server | `https://mcp.otter.ai/mcp`. Auth: OAuth ("All access is OAuth-authenticated"). Otter states there is no public API key for the MCP |
| Claude Code command (vendor documented) | NOT VERIFIED. Otter documents a generic JSON config with the URL above and OAuth. Generic Anthropic syntax: `claude mcp add --transport http otter https://mcp.otter.ai/mcp`, then `/mcp` to sign in |
| Claude setup (vendor documented) | Settings, Connectors, Browse connectors, find Otter.ai, Connect, sign in to Otter, Authorize access |
| Plans | Otter plan needed for the MCP: NOT VERIFIED. Public API: "available for all Enterprise workspaces" only |
| Public API | Yes (Enterprise only). Base `https://api.otter.ai/v1`. Rate limit 10 requests per second |
| Where to create the key | Sign in to Otter.ai, Integrations in the left navigation, Developer tab, Create key, copy it (shown once, max 2 keys per user) |
| Auth header | `Authorization: Bearer YOUR_API_KEY` |
| Read-only list request | `curl -X GET "https://api.otter.ai/v1/conversations?include_shared=false&limit=20" -H "Authorization: Bearer YOUR_API_KEY"` |
| Fallback | Not needed for the connector route |

Sources: https://claude.com/connectors/otter-ai, https://help.otter.ai/hc/en-us/articles/35287607569687-Otter-MCP-Server, https://help.otter.ai/hc/en-us/articles/36130822688279-Otter-ai-Public-API

## 4. Granola

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Granola". Built by Granola, Anthropic verified, added January 2026. Tools: query_granola, list_meetings, get_meetings, get_meeting_transcript |
| Vendor MCP server | `https://mcp.granola.ai/mcp`. Auth: OAuth 2.0, browser sign-in |
| Claude Code command (vendor documented) | `claude mcp add granola --transport http https://mcp.granola.ai/mcp`, then open a new terminal, run `claude`, run `/mcp`, select Granola, choose Authenticate |
| Plans (MCP) | Free: personal notes from the last 30 days only, and some folder, search and transcript tools are paid only. Paid plans unlock folders, search and transcripts |
| Public API | Yes. Base `https://public-api.granola.ai/v1`. Business plan members can create keys; on Enterprise, admins choose the scopes. Free or individual plan API access: NOT VERIFIED (not mentioned) |
| Where to create the key | Granola desktop app, Settings, Connectors, API keys, Create new key, choose scopes, generate. Keys start `grn_` |
| Auth header | `Authorization: Bearer grn_YOUR_API_KEY` |
| Read-only list request | `curl -H "Authorization: Bearer YOUR_API_KEY" "https://public-api.granola.ai/v1/notes"` |
| Fallback | Not needed |

Sources: https://claude.com/connectors/granola, https://docs.granola.ai/help-center/sharing/integrations/mcp, https://docs.granola.ai/introduction, https://docs.granola.ai/api-reference/list-notes

## 5. tl;dv

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "tldv". Built by tldx solutions GmbH, Anthropic verified. Covers Google Meet, Zoom and Teams recordings. Tools: get-meeting-metadata, get-meeting-notes, get-meeting-transcript, get-user-profile, search-meetings |
| Vendor MCP server | Hosted: `https://mcp.tldv.io/mcp` (URL from the Anthropic directory listing), OAuth. Also an official local build at github.com/tldv-public/tldv-mcp-server that uses a tl;dv API key; tl;dv says most people should use the hosted connector |
| Claude Code command (vendor documented) | NOT VERIFIED. Generic Anthropic syntax: `claude mcp add --transport http tldv https://mcp.tldv.io/mcp`, then `/mcp` to sign in |
| Plans | Connector plan requirement: NOT VERIFIED. API: Pro or Business (and Enterprise) only, not Free. The meeting organiser's plan decides API access |
| Public API | Yes. Base `https://pasta.tldv.io` |
| Where to create the key | Settings, Personal Settings, API Keys (https://tldv.io/app/settings/personal-settings/api-keys) |
| Auth header | `x-api-key: YOUR_API_KEY` |
| Read-only list request | `GET https://pasta.tldv.io/v1alpha1/meetings?page=1&limit=50` with the header above |
| Fallback | Not needed |

Sources: https://claude.com/connectors/tldv, https://github.com/tldv-public/tldv-mcp-server, https://intercom.help/tldv/en/articles/11583137-api, https://doc.tldv.io/index.html

## 6. Read AI

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Read AI". Built by Read AI, Anthropic verified, added May 2026. Directory listing shows get_meeting_by_id and list_meetings. Read AI's own MCP page also lists "Create meeting agent" (sends a bot to a call) and "Share meeting report" (can email an invite). Those 2 are write actions: guides must tell Claude not to use them |
| Vendor MCP server | `https://api.read.ai/mcp`, OAuth 2.1, Streamable HTTP. Read AI states it works in Claude Desktop, Web and Code. Open beta |
| Claude Code command (vendor documented) | NOT VERIFIED. Read AI says connecting the Claude connector makes it available "across all Claude surfaces, including Claude Code". Generic Anthropic syntax: `claude mcp add --transport http readai https://api.read.ai/mcp` |
| Claude setup (vendor documented) | Claude website or desktop app, Customize, Connectors, search "Read AI", Connect to Claude, Allow Access |
| Plans | "Available to all users regardless of plan or workspace". If you belong to a workspace, it must have Downloads enabled in Workspace Settings, Reports and Sharing |
| Public API | Yes, open beta. Base `https://api.read.ai/`. 100 requests per minute per user |
| Where to create the key | No static API keys. OAuth 2.1 only: register a client with `POST https://api.read.ai/oauth/register`, sign in at https://api.read.ai/oauth/ui, exchange the code for tokens. Access tokens expire after 10 minutes. Not suitable for non-technical users |
| Auth header | `Authorization: Bearer YOUR_ACCESS_TOKEN` |
| Read-only list request | `curl "https://api.read.ai/v1/meetings?limit=5" -H "Authorization: Bearer YOUR_ACCESS_TOKEN"` |
| Fallback | Not needed |

Sources: https://claude.com/connectors/read-ai, https://support.read.ai/hc/en-us/articles/49379985941523-Read-AI-API-and-MCP-Overview, https://support.read.ai/hc/en-us/articles/54786334602003-Connecting-the-Read-AI-MCP-Server-to-Claude, https://support.read.ai/hc/en-us/articles/49381158409491-MCP-Server, https://support.read.ai/hc/en-us/articles/49380809380371-API-Keys-Authentication, https://support.read.ai/hc/en-us/articles/49381161088659-API-Reference

## 7. Zoom (cloud recording transcripts and AI Companion summaries)

| Question | Answer |
|---|---|
| Official Claude connector | Yes. Directory name: "Zoom for Claude". Built by Zoom, Anthropic verified, added April 2026. Tools: search_meetings, recordings_list, get_meeting_assets, get_recording_resource, search_zoom, get_file_content, plus 3 write tools (create_new_file_with_markdown, hub_create_file_from_content, hub_get_file_content). Guides must tell Claude not to create files |
| Requirements (Zoom docs) | Licensed user on Zoom Workplace Pro, Pro Plus, Business, Business Plus, Enterprise, Enterprise Plus or Enterprise Bundle. Smart Recording and Meeting Summary (AI Companion) enabled. Meetings recorded to the cloud with Smart Recording for video features. A Zoom account owner or admin with privileges is required. OAuth |
| Vendor MCP server | `https://mcp.zoom.us/mcp/zoom/streamable` (URL from the Anthropic directory listing). Zoom's connector page does not give a URL or a Claude Code command |
| Claude Code command (vendor documented) | NOT VERIFIED. Use the claude.ai connector, which then appears in Claude Code |
| Public API | Yes, `https://api.zoom.us/v2`. Cloud recordings need Pro or higher with Cloud Recording on. Summaries need Pro, Business or higher and "Meeting Summary with AI Companion" on |
| Where to create credentials | No simple API key. Zoom App Marketplace, Developers link (lower left), Created Apps, plus sign, Build an app, Server-to-Server OAuth app, add scopes, Activate. Admin-level scopes need an admin role. Token: `POST https://zoom.us/oauth/token` with `grant_type=account_credentials` and Basic auth of client ID and secret |
| Auth header | `Authorization: Bearer <ACCESS_TOKEN>` |
| Read-only list requests | `GET https://api.zoom.us/v2/users/me/recordings` (scope `cloud_recording:read:list_user_recordings`; transcripts appear as recording files) and `GET https://api.zoom.us/v2/users/{userId}/meeting_summaries` (scope `meeting_summary:read`) |
| Fallback | AI Companion: "The summary will be automatically sent after the meeting has ended." Claude can then read it through the Gmail or Microsoft 365 connector |

Sources: https://claude.com/connectors/zoom-for-claude, https://developers.zoom.us/docs/mcp/plug-ins-and-connectors/claude-connector/, https://developers.zoom.us/api-hub/meetings/methods/endpoints.json, https://developers.zoom.us/docs/internal-apps/create/, https://developers.zoom.us/docs/internal-apps/s2s-oauth/, https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057960

## 8. Microsoft Teams (meeting transcripts)

| Question | Answer |
|---|---|
| Official Claude connector | No Teams-only connector. Transcripts come through "Microsoft 365", built by Anthropic, URL `https://microsoft365.mcp.claude.com/mcp`. Available on Free, Pro, Max, Team and Enterprise |
| Transcript access | The connector requests `OnlineMeetingTranscript.Read.All` ("Read meeting transcripts"), `OnlineMeetingAiInsight.Read`, `OnlineMeetings.Read`, `OnlineMeetingArtifact.Read.All` and `OnlineMeetingRecording.Read.All`. Claude docs: Teams Calendar "Review meeting information, summaries, and attendance". All access is delegated |
| Requirements | Work or school Microsoft account (not outlook.com, hotmail.com or live.com). A Microsoft Entra Global Administrator grants one-time tenant consent. On Claude Team and Enterprise, the Claude Owner adds the connector first. Write tools (send mail, Teams messages) only work if admins turn them on |
| Vendor MCP server | NOT VERIFIED (no Microsoft-published Teams transcript MCP found) |
| Public API | Microsoft Graph. `GET /me/onlineMeetings/{online-meeting-id}/transcripts`. Delegated permission `OnlineMeetingTranscript.Read.All`, work or school accounts only. Needs an Entra app registration and an OAuth token: no API key. Not suitable for non-technical users |
| Auth header | `Authorization: Bearer {token}` |
| Read-only request | `GET https://graph.microsoft.com/v1.0/me/onlineMeetings/{online-meeting-id}/transcripts` |
| Fallback | NOT VERIFIED (where Teams stores transcript files was not checked on a Microsoft page) |

Sources: https://claude.com/connectors/microsoft-365, https://claude.com/docs/connectors/microsoft/365, https://support.claude.com/en/articles/15183774-connect-to-microsoft-365, https://support.claude.com/en/articles/12684923-microsoft-365-connector-security-guide, https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-transcripts?view=graph-rest-1.0

## 9. Google Meet (transcripts and Gemini "Take notes for me")

| Question | Answer |
|---|---|
| Official Claude connector | No Google Meet connector found in the directory. Use "Google Drive" (built by Google, Anthropic verified, URL `https://drivemcp.googleapis.com/mcp/v1`), which reads Google Docs, Sheets, Slides and PDFs. Gmail connector also available |
| Where the files land | Transcripts: "saved in the meeting organiser's Google Drive in the 'Google Meet' folder", with a sub-folder per meeting. Gemini notes: "saved in the meeting organiser's Google Drive in the 'Google Meet' folder". From July 2026 the old "Meet recordings" folder is renamed "Legacy Meet recordings" |
| Email | Transcripts: an automated message goes to the host, co-hosts and whoever turned on Transcripts. Gemini notes: people the notes are shared with get an email with access after the meeting |
| Plans | Transcripts: Business Standard, Business Plus, Enterprise Starter, Enterprise Standard, Enterprise Plus, Teaching and Learning Upgrade, Education Plus, Workspace Individual. Gemini notes: "an eligible Google Workspace edition or Google AI plan" (exact list NOT VERIFIED) |
| Vendor MCP server | Google Drive MCP above. Meet-specific MCP: NOT VERIFIED |
| Public API | Google Meet REST API: NOT VERIFIED (not researched on a Google page). Not needed, since the Drive route works |
| Fallback (this is the route) | Connect Google Drive in Claude, then ask Claude to search the "Google Meet" folder for the latest transcript or notes doc. Gmail connector as a second option for the email notices |

Sources: https://claude.com/connectors/google-drive, https://support.google.com/meet/answer/12849897?hl=en-GB, https://support.google.com/meet/answer/14754931?hl=en-GB

## Recommended route per tool

Order of preference: Claude connector first, then vendor MCP, then API key, then fallback.

| Tool | Recommended route | Notes for the guide |
|---|---|---|
| Fathom | Connector "Fathom" in claude.ai, then it appears in Claude Code. Backup: `claude mcp add fathom -- npx mcp-remote@latest https://api.fathom.ai/mcp`. Then API key (`X-Api-Key`) | Needs a paid Fathom plan (Premium or above) |
| Fireflies.ai | Connector "Fireflies" (OAuth). Backup: API key from Integrations, Fireflies API | Free plan API capped at 50 requests per day |
| Otter.ai | Connector "Otter.ai" (OAuth). No API key option outside Enterprise | API is Enterprise only |
| Granola | Connector "Granola". Backup: `claude mcp add granola --transport http https://mcp.granola.ai/mcp` then `/mcp` | Free plan: last 30 days only, transcript tools paid only. API key needs Business plan |
| tl;dv | Connector "tldv" (OAuth). Backup: API key from Personal Settings, API Keys | API needs Pro or Business |
| Read AI | Connector "Read AI" (OAuth). No API key route exists | Tell Claude never to use "create meeting agent" or "share meeting report" |
| Zoom | Connector "Zoom for Claude". Fallback: AI Companion summary email read through Gmail or Microsoft 365 | Needs paid Zoom plan, Smart Recording and Meeting Summary on, and an admin. Tell Claude never to create files. Skip the API (Server-to-Server OAuth is too technical) |
| Microsoft Teams | Connector "Microsoft 365" | Needs a work Microsoft account and one-time Global Administrator consent. Leave write tools off. Skip Graph API |
| Google Meet | Fallback via the "Google Drive" connector, reading the organiser's "Google Meet" folder. Gmail connector as a second option | Needs a Workspace edition that includes transcripts or Gemini notes |
