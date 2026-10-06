# Business apps: how Claude connects (research notes)

Verified on 2026-10-06. Every fact below comes from a page opened on that date. Anything not confirmed on an official page is marked NOT VERIFIED.

Purpose: source material for the step-by-step guides a small business owner's Claude follows to connect their apps (read-only by default) and spot tasks.

Key: "Directory connector" means a listing in Anthropic's connector directory at claude.com/connectors (opened in Claude via Customize > Connectors). "Vendor MCP server" means a remote MCP endpoint run by the app vendor itself.

---

## 0. How connectors work across Claude surfaces

- Where users find them: "Click the '+' button in the lower left corner of your chat, or type '/' to open the menu. Hover over 'Connectors.' Select 'Manage connectors.'" or go to Customize > Connectors (claude.ai/customize/connectors).
- Plans: "Web connectors are available for all users on Claude, Cowork, Claude Desktop, and Claude Mobile." Free users are limited to 1 custom connector; Pro, Max, Team and Enterprise can add several. Individual vendors may add their own plan rules (see HubSpot).
- Surfaces: "Connectors work across Claude, Claude Desktop, Claude Code, and the API (via the MCP Connector)."
- Team and Enterprise: an Owner or Primary Owner must enable a connector at organisation level before members can use it.
- Claude Code: connectors added at claude.ai/customize/connectors load automatically in Claude Code only when Claude Code is signed in with a claude.ai subscription account. They do not load with ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, Bedrock or Google Cloud, or a CLAUDE_CODE_OAUTH_TOKEN from `claude setup-token`. Check with `/status`, sign in with `/login`. They appear in `/mcp` marked as coming from claude.ai; connectors not yet signed into sit behind a "Show unused connectors" row. They can be turned off with `ENABLE_CLAUDEAI_MCP_SERVERS=false`, `"disableClaudeAiConnectors": true` in settings, or per connector in `/mcp`.
- Adding a vendor MCP server directly in Claude Code: `claude mcp add --transport http <name> <url>` (add `--header "Authorization: Bearer <token>"` for token auth, `--scope user` for all projects). OAuth servers: run `/mcp`, pick the server and complete the browser sign-in, or `claude mcp login <name>`.

Sources:
- https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities
- https://code.claude.com/docs/en/mcp

---

## Part 1. Email and calendar

### Gmail

- Directory connector: yes. Exact name: **Gmail**. Publisher: Google (Anthropic verified, added March 2026). Server: `https://gmailmcp.googleapis.com/mcp/v1`.
- Where: Customize > Connectors, or + > Connectors in a chat.
- Plans: "Google Workspace connectors (Gmail, Google Calendar, and Google Drive) are available for all users on Claude and Claude Desktop." Team and Enterprise need an Owner or Primary Owner to enable them.
- Claude Code: yes, via claude.ai login sync (section 0).
- CAN CREATE DRAFTS: yes. Anthropic help centre lists "Draft emails with proper formatting and context" and "List saved drafts in your Gmail account". The directory listing includes a `create_draft` tool alongside `send_message`, `reply` and `forward`.
- Send: the connector can also send, reply and forward. "By default, Claude asks for your approval before each of these actions." On Team and Enterprise, owners decide whether members can let these run without asking. Guides must tell Claude to use `create_draft` only and never `send_message`, `reply` or `forward`.
- Attachments: metadata only, not content.
- Verified on 2026-10-06.

Sources:
- https://support.claude.com/en/articles/10166901-use-google-workspace-connectors
- https://claude.com/connectors/gmail

### Google Calendar

- Directory connector: yes. Exact name: **Google Calendar**. Publisher: Google (Anthropic verified, added March 2026). Server: `https://calendarmcp.googleapis.com/mcp/v1`.
- Plans, location and Claude Code access: as Gmail.
- CAN CREATE EVENTS: yes. Help centre: "Create, update, and delete events with full customization". Tools listed: create_event, delete_event, get_event, list_calendars, list_events, respond_to_event, search_events, suggest_time, update_event.
- Verified on 2026-10-06.

Sources:
- https://support.claude.com/en/articles/10166901-use-google-workspace-connectors
- https://claude.com/connectors/google-calendar

### Microsoft 365 (Outlook mail and calendar)

- Directory connector: yes. Exact name: **Microsoft 365**. Publisher: Anthropic (Anthropic verified). Covers Outlook, SharePoint, OneDrive and Teams.
- Where: Customize > Connectors, find Microsoft 365, click Connect, sign in with Microsoft and approve.
- Plans: "Free, Pro, Max, Team, and Enterprise".
- Account requirement: a work Microsoft 365 account tied to a Microsoft Entra tenant. "Personal Microsoft accounts (such as @outlook.com, @hotmail.com, or @live.com) can't be used." Owners of outlook.com mailboxes have no official connector; use the URL formats below to hand drafts to them.
- Claude Code: yes, via claude.ai login sync (section 0).
- Read tools in the directory listing: outlook_email_search, outlook_calendar_search, find_meeting_availability, sharepoint_search, sharepoint_folder_search, chat_message_search, read_resource.
- Drafts and events: the help centre says Claude can "Draft, send, and organize email" and update calendars, BUT only where the organisation's admin has enabled write tools: "Whether Claude can also take actions like sending email, updating your calendar, creating files, or sending Teams messages depends on what your admin has enabled." By default treat Microsoft 365 as read-only and hand drafts and events over as links (below). Attachments are not supported in write tools.
- Verified on 2026-10-06.

Sources:
- https://support.claude.com/en/articles/15183774-connect-to-microsoft-365
- https://claude.com/connectors/microsoft-365

---

## Part 1b. Pre-filled compose URL formats

None of these 4 formats is officially documented by Google or Microsoft. All are widely documented by third parties and work today, but the vendors can change them without notice. URL-encode every value (space = %20, new line = %0A).

### Gmail web, new email (NOT officially documented)

Current format (Simon Willison, tested):
```
https://mail.google.com/mail/u/0/?tf=cm&to=a@example.com&cc=b@example.com&bcc=c@example.com&su=Subject&body=Body%20text
```
- `to`, `cc`, `bcc`: comma-separated addresses. `su`: subject. `body`: body text. `tf=cm` opens the compose window. `u/0` is the first signed-in account (u/1 the second).
- Older format still widely quoted: `https://mail.google.com/mail/?view=cm&fs=1&to=...&su=...&body=...`. Willison reports it now redirects; use `tf=cm`.

Source: https://til.simonwillison.net/google/gmail-compose-url (third party)

### Outlook on the web, new email (NOT officially documented)

Microsoft 365 work accounts:
```
https://outlook.office.com/mail/deeplink/compose?to=a@example.com,b@example.com&cc=c@example.com&subject=Subject&body=Body%20text
```
- Parameters reported working: `to`, `cc`, `subject`, `body`. Join every parameter with `&` after the first `?`.
- Known bug reported on Microsoft Q&A (March 2024): if the user's session has expired, the first compose after signing in may drop cc, subject and body, and spaces may show as `+`. Older community gists say `cc` does not work; the Q&A thread says it does when separators are correct. Treat `cc` as unreliable.
- outlook.com personal accounts: the equivalent `https://outlook.live.com/mail/deeplink/compose?...` is NOT VERIFIED. No page opened confirmed it.
- Safe fallback for both: a standard `mailto:` link, `mailto:a@example.com?cc=b@example.com&subject=...&body=...`.

Sources:
- https://learn.microsoft.com/en-us/answers/questions/4619953/want-to-pre-populate-to-cc-subject-body-by-passing (community Q&A on Microsoft's site, not documentation)
- https://gist.github.com/miwebguy/2e805e343e0d434f06f2194b92b925d8 (third party)

### Google Calendar web, new event (NOT officially documented; Google used to document it)

```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=Title&dates=20261007T090000Z/20261007T100000Z&details=Notes&location=Place&ctz=Europe/London
```
- `action=TEMPLATE` required. `text`: title. `dates`: start/end as `YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ` (UTC when both halves end in Z), or `YYYYMMDD/YYYYMMDD` for all-day (end date exclusive). `details`: description (simple `<b>` and `<a>` survive). `location`: free text. `ctz`: time zone for both start and end.
- Alternative base: `https://calendar.google.com/calendar/r/eventedit?...`

Source: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/master/services/google.md (third party)

### Outlook Calendar web, new event (NOT officially documented)

Microsoft 365:
```
https://outlook.office.com/calendar/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Title&startdt=2026-10-07T09:00:00&enddt=2026-10-07T10:00:00&body=Notes&location=Place
```
outlook.com: same parameters on `https://outlook.live.com/calendar/deeplink/compose`.
- `subject`: title. `startdt`, `enddt`: `YYYY-MM-DDTHH:mm:SSZ` in UTC, or drop the trailing Z to use the user's own time zone; `YYYY-MM-DD` for all-day. `body`: description (accepts HTML). `location`: free text. `allday=true` for all-day.

Source: https://interactiondesignfoundation.github.io/add-event-to-calendar-docs/services/outlook-web.html (third party, states "There is no official documentation")

---

## Part 2. Business apps

### Xero

1. Directory connector: yes. Exact name: **Xero**. Publisher: Xero Limited (Anthropic verified, added April 2026). Server: `https://mcp.xero.com/mcp`. Read-only: "Claude connects with read-only access". 20 tools including get_invoices, show_invoices_summary, get_aged_receivables, get_aged_payables, get_bills, get_contacts, get_profit_and_loss, get_cash_position, get_bank_account_transactions. Xero's UK and US pages: needs "an active Xero subscription and a Claude account (either free or paid)"; "read-only at launch... can't edit invoices, post transactions, or change anything in your books." Steps: add Xero in Claude's connectors directory, sign in with Xero login, choose the organisation.
2. Vendor MCP server: also an open-source local server, npm `@xeroapi/xero-mcp-server` (runs with `npx -y @xeroapi/xero-mcp-server@latest`). Auth: Xero Custom Connection (`XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`) or `XERO_CLIENT_BEARER_TOKEN`. This server can write (create invoices, etc.). Developer route, not for this audience. No documented `claude mcp add` command for it.
3. API key route: not needed. Custom Connection details beyond the repo README: NOT VERIFIED.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/xero
- https://www.xero.com/uk/ai-in-accounting/claude/
- https://www.xero.com/us/ai-in-accounting/claude/
- https://github.com/xeroapi/xero-mcp-server

### QuickBooks Online

1. Directory connector: yes. Exact name: **Intuit QuickBooks**. Publisher: Intuit QuickBooks (Anthropic verified, added March 2026). Server: `https://ai-inc.quickbooks.intuit.com/v1/mcp`. **US customers only** per Intuit: "currently available to US customers only." NOT read-only: it can create, update and send invoices and estimates and create payment links. Intuit says destructive actions such as deleting an invoice need confirmation; standard creation does not. Steps: Claude.ai > Connectors > Intuit QuickBooks > Connect > sign in with Intuit.
2. Vendor MCP server: Intuit's `quickbooks-online-mcp-server` on GitHub is a LOCAL stdio server, not hosted. Needs an Intuit Developer app (OAuth client id and secret) plus `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_REFRESH_TOKEN`, `QUICKBOOKS_REALM_ID`, `QUICKBOOKS_ENVIRONMENT`. Production needs a public HTTPS callback. Developer-only.
3. API key route: QuickBooks Online API uses OAuth 2.0 through the Intuit Developer Portal (per the repo). No personal API key route found: NOT VERIFIED that none exists.

UK note: a UK QuickBooks user has no non-developer route verified. Flag in the guide.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/intuit-quickbooks
- https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US
- https://github.com/intuit/quickbooks-online-mcp-server

### FreeAgent

1. Directory connector: no. `claude.com/connectors/freeagent` returns 404 and the directory page does not list it.
2. Vendor MCP server: none found. Only community servers (for example @crowdform/freeagent-mcp, OxygenBubbles/freeagent-mcp-server). Not official; NOT VERIFIED for safety.
3. API route: OAuth 2.0 only. No personal access token or API key is documented.
   - Create an app at the FreeAgent Developer Dashboard (https://dev.freeagent.com) to get an OAuth Client ID and Secret.
   - Authorise: `https://api.freeagent.com/v2/approve_app`. Token: `https://api.freeagent.com/v2/token_endpoint`. Access token lasts 1 hour; refresh token about 20 years. FreeAgent's docs point to the Google OAuth 2.0 Playground for stepping through the flow by hand.
   - No read-only scope is documented.
   - Headers: `Authorization: Bearer TOKEN`, `Accept: application/json`, `User-Agent: <app name>`.
   - Read-only test: `GET https://api.freeagent.com/v2/company`. Unpaid invoices: `GET https://api.freeagent.com/v2/invoices?view=open_or_overdue` (other views: overdue, open, recent_open_or_overdue, draft, paid).
   - Sandbox: `https://api.sandbox.freeagent.com`.

Verified on 2026-10-06.

Sources:
- https://dev.freeagent.com/docs/oauth
- https://dev.freeagent.com/docs/introduction
- https://dev.freeagent.com/docs/invoices
- https://claude.com/connectors (FreeAgent absent)

### HubSpot

1. Directory connector: yes. Exact name: **HubSpot**. Publisher: HubSpot (Anthropic verified, added November 2025). Server: `https://mcp.hubspot.com/anthropic`. HubSpot's own guide says it needs a **paid Claude plan (Pro, Max, Team or Enterprise)**. Super Admins and users with App Marketplace Access connect directly; others need Super Admin approval. Read and write (create and update contacts, deals, tickets and more). HubSpot recommends setting the connector to always ask before updates. Steps (HubSpot's wording): Claude settings > Connectors > Browse > HubSpot > Connect > authenticate > choose permissions.
2. Vendor MCP server: `https://mcp.hubspot.com`, OAuth. Claude Code: `claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com` (example in Claude Code docs), then `/mcp` to sign in. HubSpot's page does not document a read-only scope option.
3. API key route (fallback): legacy private app. Development > Legacy apps > Create legacy app > Private, tick only read scopes (for example crm.objects.contacts.read, crm.objects.deals.read), then Auth tab > Show token > Copy. Header `Authorization: Bearer <token>`. Test: `GET https://api.hubapi.com/crm/v3/objects/contacts`. Exact scope names: NOT VERIFIED on an opened page.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/hubspot
- https://knowledge.hubspot.com/integrations/set-up-and-use-the-hubspot-connector-for-claude
- https://developers.hubspot.com/docs/build-with-ai/remote-mcp-server
- https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview
- https://code.claude.com/docs/en/mcp

### Pipedrive

1. Directory connector: yes. Exact name: **Pipedrive** (directory slug pipedrive-mcp). Publisher: Pipedrive (Anthropic verified). Listed in the directory on 18 August 2026. Server: `https://mcp.pipedrive.ai/mcp`. "Available on all paid Pipedrive plans." Read and write (addDeal, addNote, updateActivity alongside getDeals, getActivities, searchDeals). No read-only option documented; access follows the user's Pipedrive permissions.
2. Vendor MCP server: same URL, OAuth. Pipedrive's support article still shows the custom connector route: Customize > Connectors > + > Add custom connector, name `Pipedrive MCP BETA`, URL `https://mcp.pipedrive.ai/mcp`. Claude Code command: not documented by Pipedrive; the generic form `claude mcp add --transport http pipedrive https://mcp.pipedrive.ai/mcp` follows Claude Code docs (NOT VERIFIED on a Pipedrive page).
3. API key route (fallback): account name (top right) > Company settings > Personal preferences > API (direct link https://app.pipedrive.com/settings/api). 1 active token per user per company; it gives access to all that user's data, no read-only option. Header `x-api-token: <token>`. Test: `GET https://<companydomain>.pipedrive.com/api/v2/deals`.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/pipedrive-mcp
- https://www.pipedrive.com/en/newsroom/pipedrive-mcp-connector-is-now-available-in-claudes-official-marketplace
- https://support.pipedrive.com/en/article/mcp-claude
- https://pipedrive.readme.io/docs/how-to-find-the-api-token
- https://pipedrive.readme.io/docs/core-api-concepts-authentication

### Slack

1. Directory connector: yes. Exact name: **Slack**. Publisher: Slack (Anthropic verified, added November 2025). Server: `https://mcp.slack.com/mcp`. Tools include slack_read_channel, slack_read_thread, slack_search_public_and_private and also slack_send_message. Needs "a Slack workspace with the MCP integration approved by your workspace admin." Claude plan rules beyond the general connector rules: NOT VERIFIED.
2. Vendor MCP server: same URL, OAuth. Claude Code: Slack documents the plugin route, `/plugin install slack` in a session or `claude plugin install slack` from the terminal; the plugin configures the server and prompts OAuth. Desktop: Customize > Connectors > + > Slack.
3. API key route: not needed. Not researched further.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/slack
- https://docs.slack.dev/ai/slack-mcp-server/connect-to-claude/

### Notion

1. Directory connector: yes. Exact name: **Notion**. Publisher: Notion (Anthropic verified, added November 2025). Server: `https://mcp.notion.com/mcp`. Read and write (search, fetch, create-pages, update-page and more).
2. Vendor MCP server: same URL. Claude Code: `claude mcp add --transport http notion https://mcp.notion.com/mcp`, then `/mcp` to sign in. OAuth only: "Notion MCP currently requires you to complete the OAuth authorization flow." Integration tokens do not work with the hosted server.
3. API key route (fallback): Developer portal > Developer connections > create connection > Configuration tab > copy the API token. Share each page with it (page menu > Add connections). Headers `Authorization: Bearer <token>`, `Notion-Version: 2026-03-11`. Test: `GET https://api.notion.com/v1/pages/<page_id>`. Read-only capability setting: NOT VERIFIED on the opened page.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/notion
- https://developers.notion.com/guides/mcp/get-started-with-mcp
- https://developers.notion.com/docs/authorization

### Stripe

1. Directory connector: yes. Exact name: **Stripe**. Publisher: Stripe (Anthropic verified). Tools include stripe_api_read and stripe_api_write. Steps (Stripe's docs): Connect to Claude, sign in to Stripe in the OAuth window, then + > Connectors > enable Stripe. Team and Enterprise: an owner adds it first.
2. Vendor MCP server: `https://mcp.stripe.com`. Claude Code: `claude mcp add --transport http stripe https://mcp.stripe.com/` then `/mcp` for OAuth. Stripe's recommended setup is `npm install -g @stripe/cli@latest` then `stripe agent setup`. OAuth lets the user set permissions per environment. Stripe requires human confirmation for some writes such as refunds.
3. Key route (for clients without OAuth): an **Agent API key** passed as `Authorization: Bearer <key>`, kept in an environment variable referenced from `.mcp.json`. **From 31 October 2026 Stripe MCP rejects full secret keys and restricted keys without the Agent tag.** Agent key creation path and read-only permission settings: NOT VERIFIED on an opened page (see https://docs.stripe.com/keys).

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/stripe
- https://docs.stripe.com/mcp

### Google Drive

1. Directory connector: yes. Exact name: **Google Drive**. Publisher: Google. Tools include search_files, read_file_content, list_recent_files, and also share_file, trash_file, create_file, update_file. Share, move and trash need approval by default. Same plan rules as Gmail.
2. Vendor MCP server: the directory connector is Google's own. Server URL: NOT VERIFIED (not shown on the page opened).
3. API key route: not needed. Not researched.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/google-drive
- https://support.claude.com/en/articles/10166901-use-google-workspace-connectors

### Calendly

1. Directory connector: yes. Exact name: **Calendly**. Publisher: Calendly. Server: `https://mcp.calendly.com/`. 36 tools including meetings-list_events, users-get_current_user, and write tools such as event_types-create_event_type and meetings-cancel_event. Calendly: "You don't need a paid Calendly plan", though some actions vary by plan. Steps: Customize > Connect your tools > search Calendly > sign in > Approve, then + > Connectors > toggle on.
2. Vendor MCP server: same URL for any MCP client. Claude Code command: not documented by Calendly; generic form `claude mcp add --transport http calendly https://mcp.calendly.com/` (NOT VERIFIED on a Calendly page).
3. API key route (fallback): Integrations page > API & Webhooks > Get a token now (or Generate new token) > name it > Create Token > Copy token. Shown once only. Scopes are chosen at creation. Header format and test request: NOT VERIFIED on the opened page.

Verified on 2026-10-06.

Sources:
- https://claude.com/connectors/calendly
- https://calendly.com/help/connect-calendly-to-your-ai-tools
- https://developer.calendly.com/docs/authentication/how-to-authenticate-with-personal-access-tokens

---

## Recommended route per app

| App | Route | Read-only by default? | Notes |
|---|---|---|---|
| Gmail | Directory connector **Gmail** | No. Tell Claude to use create_draft only | Free plan OK. Synced into Claude Code via claude.ai login |
| Google Calendar | Directory connector **Google Calendar** | No. Can create events | Free plan OK |
| Outlook (work M365) | Directory connector **Microsoft 365** | Yes unless admin enabled write tools | Work accounts only. Hand drafts and events over as deeplinks |
| Outlook.com (personal) | No connector. Deeplinks or mailto only | n/a | Not supported by Microsoft 365 connector |
| Xero | Directory connector **Xero** | Yes, read-only by design | Best fit. Free or paid Claude |
| QuickBooks Online | Directory connector **Intuit QuickBooks** (US only) | No. Can create invoices | UK users: no non-developer route verified |
| FreeAgent | No official route. OAuth API via Developer Dashboard | Depends on code | Hardest. Needs an OAuth app and token refresh |
| HubSpot | Directory connector **HubSpot** | No. Set "ask before updates" | Needs paid Claude plan |
| Pipedrive | Directory connector **Pipedrive** | No | Paid Pipedrive plans |
| Slack | Directory connector **Slack**; Claude Code: `claude plugin install slack` | No. Can send messages | Workspace admin approval |
| Notion | Directory connector **Notion**; Claude Code: `claude mcp add --transport http notion https://mcp.notion.com/mcp` | No | OAuth only |
| Stripe | Directory connector **Stripe** | No. Restrict in OAuth consent | Agent keys only for key auth from 31 Oct 2026 |
| Google Drive | Directory connector **Google Drive** | No. Share and trash need approval | |
| Calendly | Directory connector **Calendly** | No. Can cancel meetings | No paid Calendly plan needed |

Default instruction for every guide: connect through Customize > Connectors in claude.ai, then confirm in Claude Code with `/mcp` while signed in with the claude.ai account. Where a connector has write tools, the guide must tell Claude to read only and to draft rather than send.
