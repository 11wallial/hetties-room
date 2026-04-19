# Shared wish board — one-time deploy (≈3 min)

Until this is done, both phones get their own *local-only* board. After, both read/write the same shared board.

## What you need

- A free Cloudflare account (dash.cloudflare.com) — no credit card required
- Terminal access to this repo

## Steps

From inside `hettie-countdown/app/worker/notes-api/`:

```bash
npx wrangler login                       # opens browser — approve once
npx wrangler kv namespace create HETTIES_NOTES
# copy the `id: "..."` value from the output
```

Paste that id into `wrangler.jsonc` where it says `PASTE_KV_NAMESPACE_ID_HERE`, then:

```bash
npx wrangler deploy
# → note the URL it prints (https://hetties-room-notes.<you>.workers.dev)
```

Quick test it's alive:

```bash
curl https://hetties-room-notes.<you>.workers.dev/notes
# expect: {"notes":[]}
```

## Wire it to the site

On GitHub → Settings for the `hetties-room` repo:

1. **Secrets → Actions → New secret**
   - name: `CLOUDFLARE_API_TOKEN`
   - value: create at dash.cloudflare.com → My Profile → API Tokens → template *"Edit Cloudflare Workers"*

2. **Variables → Actions → New variable**
   - name: `NOTES_WORKER_URL`
   - value: the URL from step above

3. Push any commit. The Pages rebuild will bake the URL in — the board will go live and both phones will share.

## That's it

From now on, every push re-deploys both the site and the Worker automatically via `.github/workflows/deploy.yml`. You never have to touch wrangler again unless you edit the Worker source.
