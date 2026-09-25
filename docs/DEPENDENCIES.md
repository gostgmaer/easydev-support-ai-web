# Dependencies - support-ai web UI

Web UI for the support-ai platform.

This file is self-contained: it says what must be running (or configured) before this service works, gives the commands to start those dependencies, and lists who depends on it. `<infra>` below is `easydev-infra` (in this workspace: `C:\Users\kisho\WorkSpace\docker network\easydev-infra`). The full platform map lives in `learning/ai/langchain-knoledgebase-rag/docs/` (`SERVICE_DEPENDENCIES.md`, `OTHER_SERVICES_DEPENDENCIES.md`, `LOCAL_SETUP.md`, `ENVIRONMENT.md`).

**Legend:** **RUN** = must be up (compose `depends_on` or hard runtime). **CONFIG** = its address/secret must be set for this service to boot, but it need not be running. **FEATURE** = only one feature breaks when it is down. Nothing in this file was re-run when it was written; it is derived from the compose files, env examples and config code.

## 1. What this service depends on

| Dependency | Kind | Why |
|---|---|---|
| support-ai API (port 3307) | RUN | The UI's data source. |
| IAM / gateway | RUN (sign-in) | Sign-in goes through IAM. |

**Minimum to run it:** core + support-ai stack.

## 2. Bring the dependencies up

Create the shared Docker networks once (safe to repeat):

```bash
for n in core-network product-network ai-platform-network utility-network; do
  docker network inspect $n >/dev/null 2>&1 || docker network create $n
done
```

Start in this order (Git Bash; Docker Desktop must be running). Steps marked **(optional)** are only needed for the features noted as FEATURE/CONFIG in section 1; skip them if you do not use those features.

1. **Core: databases, IAM, gateway**

   ```bash
   cd "/c/Users/kisho/WorkSpace/docker network/easydev-infra"/stacks/core
   docker compose -p easydev-core -f docker-compose.local.build.yml up -d --build \
     core-postgres core-pgbouncer core-redis auth-service auth-worker gateway gateway-worker
   ```

2. **Support-AI stack: support-ai api/webhook/worker + its Postgres/Redis**

   ```bash
   cd "/c/Users/kisho/WorkSpace/docker network/easydev-infra"/stacks/support-ai
   docker compose -p easydev-support-ai -f docker-compose.local.build.yml up -d --build
   ```

3. **This service (UI/easydev-support-ai-web)** - if it is part of one of the stacks above it is already started by that step. To run it from source while developing, keep the dependencies above up and follow this repo's README. Whole-stack shortcut from the infra repo: `bash <infra>/scripts/deploy-local.sh --stack <core|product|ai-platform|support-ai|utility>` (builds from local source, creates the networks, waits for health; `--stack` assumes the stacks it depends on are already running). Build one image at a time on a low-memory machine.

## 3. Settings that tie it to its dependencies

- No `.env.example` was found in this repo - check its README / `next.config` for the API base URL (assumed: support-ai API + IAM).

Full variable documentation for the RAG-related services: `ENVIRONMENT.md` in the RAG repo. Never commit real values; only `*.example` files are tracked.

## 4. Who depends on this service

- End users

If you stop it, those consumers lose the feature described above.

## 5. Check it is up

```bash
npm run dev   # then open the printed URL
```
