"""Unit tests for the pure ``build_prompt`` helper.

``build_prompt`` is the most important pure function in the backend: it shapes
the text sent to Gemini. It has no I/O, so it is tested directly with no mocks.
"""
from main import CheckIn, InsightRequest, build_prompt


def make_request(check_ins, name="Arjun", exam_type="JEE", model="gemini-pro"):
    return InsightRequest(
        name=name,
        exam_type=exam_type,
        model=model,
        mood_history=[CheckIn(**c) for c in check_ins],
    )


def test_includes_name_exam_and_latest_mood():
    req = make_request(
        [{"mood": 7, "triggers": ["Sleep Deprivation"], "reflection": "tired",
          "timestamp": "2026-06-06T10:30:00.000Z"}]
    )
    prompt = build_prompt(req)

    assert "Arjun" in prompt
    assert "JEE" in prompt
    assert "mood: 7/10" in prompt
    assert "Sleep Deprivation" in prompt
    assert '"tired"' in prompt


def test_empty_triggers_and_reflection_use_placeholders():
    req = make_request(
        [{"mood": 5, "triggers": [], "reflection": "",
          "timestamp": "2026-06-06T10:30:00.000Z"}]
    )
    prompt = build_prompt(req)

    assert "none reported" in prompt
    assert "no reflection provided" in prompt


def test_history_lists_every_entry_by_date():
    req = make_request(
        [
            {"mood": 4, "triggers": ["Fear of Failure"], "reflection": "",
             "timestamp": "2026-06-04T09:00:00.000Z"},
            {"mood": 6, "triggers": [], "reflection": "",
             "timestamp": "2026-06-05T09:00:00.000Z"},
            {"mood": 8, "triggers": ["Peer Pressure"], "reflection": "ok",
             "timestamp": "2026-06-06T09:00:00.000Z"},
        ]
    )
    prompt = build_prompt(req)

    # Each entry is summarised on its own dated line.
    assert "2026-06-04: mood 4/10, triggers: Fear of Failure" in prompt
    assert "2026-06-05: mood 6/10, triggers: none" in prompt
    assert "2026-06-06: mood 8/10, triggers: Peer Pressure" in prompt
    # Latest check-in details come from the final entry.
    assert "mood: 8/10" in prompt
    assert '"ok"' in prompt
