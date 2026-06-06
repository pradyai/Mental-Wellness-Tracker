"""Shared fixtures and Gemini-client fakes for the backend test suite.

The real endpoints call ``genai.Client(api_key=...)`` and then use
``client.models.list()`` / ``client.models.generate_content(...)``. None of the
tests should touch the network, so we monkeypatch ``main.genai.Client`` with a
configurable fake.
"""
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from google.genai import errors as genai_errors

import main


@pytest.fixture
def client() -> TestClient:
    return TestClient(main.app)


class FakeModels:
    """Stand-in for ``client.models`` with scripted return values / errors."""

    def __init__(self, *, list_return=None, generate_return=None, raise_exc=None):
        self._list_return = list_return or []
        self._generate_return = generate_return
        self._raise_exc = raise_exc

    def list(self):
        if self._raise_exc:
            raise self._raise_exc
        return self._list_return

    def generate_content(self, model, contents):
        if self._raise_exc:
            raise self._raise_exc
        return SimpleNamespace(text=self._generate_return)


@pytest.fixture
def patch_genai(monkeypatch):
    """Return a helper that installs a fake ``genai.Client`` for one test."""

    def _install(*, list_return=None, generate_return=None, raise_exc=None):
        captured = {}

        def fake_client(api_key):
            captured["api_key"] = api_key
            return SimpleNamespace(
                models=FakeModels(
                    list_return=list_return,
                    generate_return=generate_return,
                    raise_exc=raise_exc,
                )
            )

        monkeypatch.setattr(main.genai, "Client", fake_client)
        return captured

    return _install


def client_error(code: int, message: str | None = None) -> genai_errors.ClientError:
    """Build a real ``ClientError`` carrying the given HTTP status and message."""
    return genai_errors.ClientError(
        code, {"error": {"message": message or f"status {code}"}}
    )


def fake_model(name: str, *, display_name: str | None, actions: list[str]):
    return SimpleNamespace(
        name=name, display_name=display_name, supported_actions=actions
    )
