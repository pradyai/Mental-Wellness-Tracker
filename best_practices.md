# AI Micro App Best Practices

A reference guide for agents and developers building small, AI-powered applications ("micro apps"). Keep it scoped, deterministic where possible, and resilient where it isn't.

---

## 1. Scope & Architecture

- **One job, done well.** A micro app solves a single, well-defined task. Resist feature creep; spin up a new app instead.
- **Thin app, thick prompt.** Push logic into well-structured prompts + schemas rather than sprawling client code. The app is glue around the model call.
- **Stateless by default.** The model has no memory between calls. Pass *all* required state (history, context, config) in every request. Persist state explicitly (DB, file, local state) — never assume the model remembers.
- **Separate concerns:** (1) input gathering, (2) model invocation, (3) output parsing/validation, (4) rendering. Keep these as distinct, testable units.

---

## 2. Prompting

- **Be explicit and structured.** State the task, constraints, format, and edge-case handling. Use positive *and* negative examples.
- **Use XML/section tags** to delimit instructions, context, and data so the model can't confuse them.
- **Request specific output formats.** If you need structured data, say "respond ONLY with valid JSON, no markdown fences, no preamble."
- **Pin the model version** explicitly (e.g. `claude-sonnet-4-20250514`) so behavior is reproducible.
- **Set the role/system prompt** to constrain tone, domain, and refusal behavior.
- **Few-shot for consistency.** 2–3 examples beat paragraphs of description for format-sensitive tasks.

---

## 3. Structured Output

- **Prefer schema-validated outputs.** Define a schema (JSON Schema / Pydantic / Zod) and validate every response against it.
- **Strip fences before parsing.** Models sometimes wrap JSON in ```` ```json ````. Remove fences, then `JSON.parse` inside a try/catch.
- **Reprompt on parse failure.** On invalid output, feed the error back to the model and ask it to correct — don't crash.
- **Never trust output blindly.** Treat model output as untrusted input: sanitize before rendering or executing.

---

## 4. Error Handling & Resilience

- **Wrap every model call in try/catch.** Handle network errors, rate limits, malformed responses, and timeouts distinctly.
- **Retry with backoff** on transient errors (429, 5xx). Cap retries; surface a clear message after exhaustion.
- **Graceful degradation.** If the AI call fails, the app should fail informatively, not silently or fatally.
- **Validate inputs before spending a call.** Cheap local checks save latency and cost.

---

## 5. Latency & UX

- **Show progress.** Loading states, streaming, or skeletons — never a frozen UI during a call.
- **Stream when possible** for long outputs so users see early tokens.
- **Display partial data progressively** rather than blocking the whole UI on one slow response.
- **Set expectations.** Tell users the AI may take a few seconds and may occasionally be wrong.

---

## 6. Cost & Token Management

- **Right-size the model.** Use the smallest/cheapest model that meets quality bar; reserve large models for genuinely hard tasks.
- **Cap `max_tokens`** to what the task needs.
- **Trim context.** Send only relevant history/state; summarize or window long conversations.
- **Cache** deterministic or repeated results where feasible.
- **Batch** independent requests instead of looping serial calls.

---

## 7. Security & Safety

- **Never embed secrets/API keys** in client-side code. Route calls through a backend/proxy that injects credentials.
- **Treat all model output as untrusted.** Escape HTML, avoid `eval`, sandbox any executed code.
- **Guard against prompt injection.** Untrusted text inside a prompt (user input, fetched web content, file contents) can contain instructions — isolate it in tagged blocks and never grant it authority over system instructions.
- **Confirm before destructive/irreversible actions** triggered by model output.
- **Don't exfiltrate sensitive data** into prompts that hit third-party tools without need.

---

## 8. State & Conversation Management

- **Pass full history each turn** for multi-turn flows; the model is stateless.
- **For stateful apps (games, wizards),** serialize the complete state into the prompt and ask the model to return the updated state.
- **Version your state schema** so old persisted state can be migrated.

---

## 9. Tools & Integrations

- **Define tools narrowly** with clear descriptions and typed parameters — vague tools get misused.
- **Validate tool inputs and outputs** on both sides of the call.
- **Process tool results by type/structure, not position.** Don't assume `content[0]` is what you want; filter by block type.
- **Fail closed.** If a tool errors, return a structured error the model can reason about, not a raw stack trace.

---

## 10. Testing & Observability

- **Log prompts, responses, and parse outcomes** (redacting sensitive data) for debugging and eval.
- **Build a small eval set** of representative inputs + expected behaviors; run it on prompt/model changes.
- **Test the unhappy paths:** malformed output, empty input, rate limits, timeouts, injection attempts.
- **Track cost and latency** per call type so regressions are visible.

---

## 11. Agent-Specific Notes

When an autonomous agent builds or extends this micro app:

- **Read the existing schema/state contract first**; don't reinvent it.
- **Make minimal, scoped edits.** Preserve the one-job principle.
- **Keep model output validated** — never wire raw output directly into execution or rendering.
- **Document any new prompt, tool, or schema** inline so the next agent has the contract.
- **Prefer determinism.** Where logic can live in code rather than a model call, put it in code.

---

## Quick Checklist

- [ ] Single, clear purpose
- [ ] Model version pinned, `max_tokens` capped
- [ ] Structured output + schema validation + parse-error reprompt
- [ ] All state passed explicitly each call
- [ ] try/catch + retry/backoff on every call
- [ ] Loading/streaming UX
- [ ] No secrets client-side; output treated as untrusted
- [ ] Prompt-injection isolation for untrusted input
- [ ] Logging + small eval set
- [ ] Cost/latency monitored