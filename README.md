# Time Mirror — a digital twin that grows from a child's memories

Time Mirror is a full-stack web app that builds a **digital twin** of a child from the memories a
parent feeds it. Every memory becomes a point of light; the twin grows as the collection grows,
and when you talk to it, the answers come back from those memories — never from invention.

**Live app (the full version — seed boot animation, real AI chat):** <https://coding-lady-hackathon.vercel.app/>

**Static demo (self-contained, opens in any browser):** <https://voskamp099.github.io/time-mirror-demo/>

The demo folder in this repository is a self-contained static build of the product loop
(feed → grow → talk). Its chat replies are composed locally from retrieved memories so the
page needs no server and no model call; the real application below streams its answers from a
large language model.

The demo is published at two paths, serving the same file: `/time-mirror-demo/` on the notebook
site (the canonical one) and `/time-mirror/` from this repository's own Pages branch. The source
is `demo/index.html`; the notebook site keeps a copy at `time-mirror-demo/index.html`, so change
both when the demo changes.

## The product

| Screen | What it does |
| --- | --- |
| Onboarding | Creates the twin: parent name, child name, birthday, avatar seed |
| Feed | Feeds a memory: text, time types (multi-select), emotion, scene, custom tags. Excel batch import on desktop |
| Mirror | The memory panel: particles, timeline, "this day" entries |
| Growth | Nine-dimension temperament radar, eight-dimension intelligence radar, development-stage timeline, time distribution, emotion pattern, value seeds with clickable evidence |
| Chat | Streaming conversation with the twin, switchable between parent voice (third person) and child voice (second person) |

## The agent part

The interesting part is not the UI, it is how a reply is grounded:

1. **Memory structuring** — every fed memory is normalised into `{date, content, time types, emotion, scene, tags}`.
2. **Retrieval** — the relevant memories are pulled out and injected as `memoryContext` into the system prompt.
3. **Persona prompt** — the twin is instructed to answer from real details, to keep the parent's or the child's voice, and to admit ignorance when the memories do not cover the question.
4. **Streaming** — the API route returns the model's output as server-sent events, so the reply appears token by token.

The prompt rules are deliberately conservative, because the failure mode of a "child's digital twin"
is a confident invention about a real child:

- answer from stored memories only, never invent a story;
- say "I don't know you well enough yet" when the evidence is missing;
- quote concrete details instead of generalities;
- never moralise, never give a standard answer.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **UI**: shadcn/ui (Radix UI), Tailwind CSS 4, warm "dawn" theme, canvas particle system
- **Backend**: `src/app/api/chat/route.ts` — server-sent events over a model stream
- **Storage**: Drizzle ORM over PostgreSQL, Supabase client, S3-compatible object storage for media
- **Data import**: SheetJS for the Excel batch import in the feed screen

## How it was built

This is an AI-native build: the product spec, the visual language and the implementation were
produced and iterated with AI coding tools (an AI agent workspace plus terminal coding agents),
and the design decisions were kept in `DESIGN.md` and `AGENTS.md` so that every later change
stayed consistent with the same rules — warm palette, rounded shapes, no cold blues, slow
animations, no data tables where a memory should feel like a memory.

## Running the full application

The project was created inside an AI agent workspace and expects its platform tooling:

```bash
pnpm install
coze dev        # or: bash scripts/dev.sh
```

The model call goes through the workspace's own client SDK, so credentials are injected by the
environment; no key is stored in this repository. The production path is `scripts/build.sh`
followed by `scripts/start.sh`.

If you only want to see the product behaviour, open the static demo instead — it needs nothing
but a browser.

## Repository layout

```
demo/index.html     static interactive demo (no server, no dependencies)
src/app             Next.js application: onboarding, feed, mirror, growth, chat
src/app/api/chat    streaming chat endpoint and the persona prompt
src/lib             memory store and data model types
DESIGN.md           visual language and product rules
AGENTS.md           page map, stack, and structure notes for AI agents
```

## Notes

- All sample content in the demo is invented for demonstration; the application stores nothing on
  the client and ships no credentials.
- The five time categories follow the "five kinds of time" framework and each carries its own
  colour in the interface.

## Licence

MIT.
