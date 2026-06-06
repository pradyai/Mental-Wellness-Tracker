# Testing

Two independent suites cover the app: **pytest** for the FastAPI backend and
**Vitest + React Testing Library** for the React frontend. Both run automatically
on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`).

## Backend (`backend/`)

Uses `pytest` with FastAPI's `TestClient`. The Gemini client is mocked, so tests
never hit the network or need an API key.

```bash
python -m venv venv
venv\Scripts\python -m pip install -r backend/requirements-dev.txt
cd backend && ../venv/Scripts/python -m pytest
```

- `tests/test_build_prompt.py` — the pure prompt-builder (no mocks).
- `tests/test_endpoints.py` — `/api/models` and `/api/insight`: success, request
  validation, invalid-key → 401, and unexpected-error → 502 mapping.
- `tests/conftest.py` — shared `TestClient` fixture and the fake Gemini client.

## Frontend (`frontend/`)

Uses `vitest` in a `jsdom` environment with React Testing Library.

```bash
cd frontend
npm install
npm test          # single run
npm run test:watch
```

Covers the `api` layer (mocked `fetch`), the `MoodSlider` / `TriggerSelector`
components, the `Setup` / `CheckIn` / `Insights` screens — including the
streak / average / top-trigger logic and the AI-panel loading/error/message
states — and `App` orchestration (localStorage persistence, per-user key
derivation, the check-in → insight flow, and corrupt-storage fallback).
`MoodChart` is stubbed in screen/App tests because recharts needs real layout
measurements unavailable in jsdom.
