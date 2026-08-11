# Power BI Updates Hub — SPFx web part

A custom SharePoint Framework (SPFx) web part that renders the Power BI
Updates Hub board: filterable cards for updates, glitches, requests,
launches, and overhauls, backed by two SharePoint lists.

This solution was authored by hand to match SPFx 1.18 conventions and has
been type-checked against the real `@microsoft/sp-webpart-base`, `@pnp/sp`,
and `@fluentui/react` packages. It has **not** been run through the full
`gulp build`/`gulp serve` pipeline in this environment (that requires the
SPFx Yeoman-generated toolchain, a real SharePoint tenant, and a browser).
Treat this as a complete, review-ready starting point — run the steps below
in your own dev environment before deploying.

## Prerequisites

- Node.js 16.13–16.x or 18.17.1–18.x (SPFx 1.18 does not support Node 20+)
- SharePoint Online tenant with app catalog access
- The two SharePoint lists created first — see **List schema required**
  below. The web part will fail to load data until these exist with these
  exact names and column names.

## List schema required

### "Power BI Updates" list

| Column (internal name) | Type | Choices |
|---|---|---|
| Title | Single line of text | — |
| Type | Choice | Update, Glitch, Request, Launch, Overhaul |
| Status | Choice | Investigating, In progress, Queued, Shipped, Fixed, Closed |
| Description | Multiple lines of text (plain) | — |
| Priority | Choice | High, Medium, Low |
| ReportLink | Hyperlink | — |
| DatePosted | Date only | — |
| LastUpdated | Date only | — |

### "Power BI Update Subscribers" list

| Column (internal name) | Type | Choices |
|---|---|---|
| Title | Single line of text | (set to the email on create) |
| Email | Single line of text | — |
| Name | Single line of text | — |
| Frequency | Choice | Weekly digest |
| SubscribedDate | Date only | — |
| Active | Yes/No | — |

Column internal names must match exactly (case-sensitive) — `UpdatesService.ts`
and `SubscribersService.ts` reference them directly. If your list uses
different internal names, update the `SELECT_FIELDS` array in
`UpdatesService.ts` and the field names in the `.add()`/`.update()` calls in
both services.

## Setup

```bash
npm install
```

If you're starting this as a brand-new SPFx project rather than dropping
these files into an existing one, scaffold first with the Yeoman generator,
then overwrite the generated `src/webparts/<name>` folder with this one:

```bash
npm install -g yo @microsoft/generator-sharepoint
yo @microsoft/sharepoint
```

## Run locally (workbench)

```bash
gulp trust-dev-cert
gulp serve
```

This opens the local SharePoint workbench. Add the web part, then use the
property pane to confirm the **Updates list name** and **Subscribers list
name** match your actual list titles (defaults: "Power BI Updates" and
"Power BI Update Subscribers").

Local workbench cannot reach a real SharePoint list unless you serve against
a hosted workbench on your tenant:

```
https://<your-tenant>.sharepoint.com/_layouts/15/workbench.aspx
```

## Package and deploy

```bash
gulp bundle --ship
gulp package-solution --ship
```

This produces `sharepoint/solution/power-bi-updates-hub.sppkg`. Upload that
file to your tenant's App Catalog, then add the web part to a page from
the web part picker.

## File guide

```
src/webparts/powerBiUpdatesHub/
  PowerBiUpdatesHubWebPart.ts          Web part class, property pane, render()
  PowerBiUpdatesHubWebPart.manifest.json
  loc/                                 Property pane label strings
  models/
    IUpdateItem.ts                     Update/Glitch/Request/Launch/Overhaul shape
    ISubscriber.ts                     Subscriber shape
  services/
    UpdatesService.ts                  PnPjs reads/writes against the main list
    SubscribersService.ts              PnPjs reads/writes against the subscriber list
  components/
    PowerBiUpdatesHub.tsx              Root component: filters, stats, search, feed
    ItemCard.tsx                       Single card renderer
    NewRequestModal.tsx                "New request" form → creates a Request item
    SubscribeModal.tsx                 "Subscribe" form → adds/reactivates a subscriber
    PowerBiUpdatesHub.module.scss      Styles matching SharePoint's native look
```

## What's intentionally not included

- **Weekly digest email flow** — build this in Power Automate against the
  same two lists, per the build instructions document. Not SPFx code.
- **Unsubscribe link handling** — the `unsubscribe()` method exists in
  `SubscribersService.ts`; wire it to a link/flow per your build plan.
- **Client-visibility / multi-client filtering** — deliberately left out of
  both lists and this web part, since there is currently one client. Add a
  `Client` choice column and a filter block in `PowerBiUpdatesHub.tsx`
  (mirroring the Type filter block) if that changes later.
- **Server-side filtering** — current implementation loads up to `pageSize`
  items and filters client-side, which is fine into the low hundreds of
  items. If the list grows much larger, move the Type/Priority/search
  filters into the PnP query (`.filter(...)`) inside `UpdatesService.ts`.
