"""Integration tests for the FastAPI endpoints, with Gemini fully mocked.

These exercise the request/response contract and error mapping without ever
hitting the network, using the ``patch_genai`` helper from ``conftest``.
"""
from conftest import client_error, fake_model

VALID_CHECKIN = {
    "mood": 6,
    "triggers": ["Sleep Deprivation"],
    "reflection": "long day",
    "timestamp": "2026-06-06T10:30:00.000Z",
}

INSIGHT_BODY = {
    "name": "Arjun",
    "exam_type": "JEE",
    "model": "gemini-pro",
    "mood_history": [VALID_CHECKIN],
}


# --- /api/models -----------------------------------------------------------

def test_list_models_filters_and_maps(client, patch_genai):
    patch_genai(
        list_return=[
            fake_model("models/gemini-pro", display_name="Gemini Pro",
                       actions=["generateContent"]),
            fake_model("models/embed-only", display_name="Embed",
                       actions=["embedContent"]),  # filtered out
            fake_model("models/gemini-flash", display_name=None,
                       actions=["generateContent"]),  # falls back to id label
        ]
    )

    resp = client.get("/api/models", headers={"X-API-Key": "key"})

    assert resp.status_code == 200
    assert resp.json() == {
        "models": [
            {"id": "gemini-pro", "label": "Gemini Pro"},
            {"id": "gemini-flash", "label": "gemini-flash"},
        ]
    }


def test_list_models_forwards_api_key(client, patch_genai):
    captured = patch_genai(list_return=[])
    client.get("/api/models", headers={"X-API-Key": "secret-key"})
    assert captured["api_key"] == "secret-key"


def test_list_models_requires_api_key_header(client):
    assert client.get("/api/models").status_code == 422


def test_list_models_invalid_key_403_returns_401(client, patch_genai):
    patch_genai(raise_exc=client_error(403))
    resp = client.get("/api/models", headers={"X-API-Key": "bad"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid API key."


def test_list_models_invalid_key_400_returns_401(client, patch_genai):
    # Gemini reports a bad key as a 400 with an API_KEY_INVALID reason, not 401.
    patch_genai(raise_exc=client_error(400, "API key not valid. API_KEY_INVALID"))
    resp = client.get("/api/models", headers={"X-API-Key": "bad"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid API key."


def test_list_models_other_client_error_stays_400(client, patch_genai):
    # A non-key client error must not be masked as an auth failure.
    patch_genai(raise_exc=client_error(400, "model not found"))
    resp = client.get("/api/models", headers={"X-API-Key": "key"})
    assert resp.status_code == 400


def test_list_models_unexpected_error_returns_502(client, patch_genai):
    patch_genai(raise_exc=RuntimeError("boom"))
    resp = client.get("/api/models", headers={"X-API-Key": "key"})
    assert resp.status_code == 502


# --- /api/insight ----------------------------------------------------------

def test_insight_returns_generated_message(client, patch_genai):
    patch_genai(generate_return="You are doing great, Arjun.")
    resp = client.post("/api/insight", json=INSIGHT_BODY,
                       headers={"X-API-Key": "key"})
    assert resp.status_code == 200
    assert resp.json() == {"message": "You are doing great, Arjun."}


def test_insight_invalid_key_returns_401(client, patch_genai):
    patch_genai(raise_exc=client_error(401))
    resp = client.post("/api/insight", json=INSIGHT_BODY,
                       headers={"X-API-Key": "bad"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid API key."


def test_insight_unexpected_error_returns_502(client, patch_genai):
    patch_genai(raise_exc=RuntimeError("boom"))
    resp = client.post("/api/insight", json=INSIGHT_BODY,
                       headers={"X-API-Key": "key"})
    assert resp.status_code == 502


def test_insight_rejects_malformed_body(client):
    # ``mood`` must be an int and a check-in is required — FastAPI returns 422.
    bad_body = {**INSIGHT_BODY, "mood_history": [{"mood": "high"}]}
    resp = client.post("/api/insight", json=bad_body, headers={"X-API-Key": "k"})
    assert resp.status_code == 422
