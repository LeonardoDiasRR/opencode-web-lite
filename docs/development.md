# Development

## Commands

- `npm install`: install root workspaces.
- `npm test`: run service and app unit tests.
- `npm run build`: build service and app.
- `npm run check`: run tests and builds.
- `npm run app:e2e`: run Playwright E2E tests after browser installation.

## E2E Setup

Install Playwright browsers before the first E2E run:

```bash
npm exec --workspace=app playwright install
```

E2E tests use mocked service and provider responses. They do not call external APIs.

## Local Flow

1. Start the local service with `npm run service:dev`.
2. Copy the token printed by the service.
3. Start the app with `npm run app:dev`.
4. Open the Vite URL, connect with the token, select a workspace path, and initialize it.

## Troubleshooting

- Port busy: set `OPENCODE_PORT` before starting the service.
- Invalid token: restart the service or read the token printed on startup.
- Build failure: run `npm run check` and fix the first failing workspace.

## Known Limits

- MCP execution is limited until the agentic runtime phase is complete.
- Plugin execution is controlled and does not run arbitrary code by default.
- E2E coverage uses deterministic mocks instead of real LLM providers.
