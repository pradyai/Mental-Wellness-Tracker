# AI Micro App Best Practices

A reference guide for agents and developers building small, AI-powered applications ("micro apps"). Keep it scoped, deterministic where possible, and resilient where it isn't. Every recommendation is tuned to score extremely high on: **Code Quality**, **Security**, **Efficiency**, **Testing**, and **Accessibility**.

***

## 1. Scope & Architecture

- **One job, done well.** A micro app solves a single, well-defined task. Resist feature creep; spin up a new app instead.
- **Thin app, thick prompt.** Push logic into well-structured prompts + schemas rather than sprawling client code. The app is glue around the model call.
- **Stateless by default.** The model has no memory between calls. Pass *all* required state (history, context, config) in every request. Persist state explicitly (DB, file, local state) — never assume the model remembers.
- **Separate concerns into testable units:**
  1. Input gathering
  2. Model invocation
  3. Output parsing / validation
  4. Rendering
- **Deterministic first.** If logic can live in code (routing, permissions, formatting, calculations), put it there. Reserve model calls for tasks requiring judgment or generation.
- **Small pure functions over large smart components.** Typed interfaces at every boundary make the app readable, reviewable, and unit-testable.

***

## 2. Prompting

- **Be explicit and structured.** State the task, constraints, format, and edge-case handling. Use positive *and* negative examples.
- **Use XML/section tags** to delimit instructions, context, and data so the model cannot confuse authority with input:
  ```
  <system>...</system>
  <user_input>...</user_input>
  <context>...</context>
  ```
- **Request specific output formats.** If you need structured data, say "respond ONLY with valid JSON, no markdown fences, no preamble."
- **Pin the model version** explicitly (e.g., `claude-sonnet-4-20250514`) so behavior is reproducible.
- **Set the role/system prompt** to constrain tone, domain, and refusal behavior.
- **Few-shot for consistency.** 2–3 examples beat paragraphs of description for format-sensitive tasks. Include at least one failure or edge-case example.
- **Version prompts like code.** Give templates stable IDs so eval results can be tied to exact prompt text. Log the prompt ID with every request.
- **Document refusal and fallback wording** so safety outcomes are consistent instead of improvised.

***

## 3. Structured Output

- **Prefer schema-validated outputs.** Define a schema (JSON Schema / Pydantic / Zod) *before* writing the prompt and validate every response against it.
- **Strip fences before parsing.** Models sometimes wrap JSON in ` ```json ``` `. Remove fences, then `JSON.parse` inside a try/catch.
- **Reprompt on parse failure.** On invalid output, feed the exact validation error back to the model and ask it to correct — cap repair attempts (2–3) to avoid loops. Don't crash.
- **Never trust output blindly.** Treat model output as untrusted input: sanitize before rendering or executing.
- **Process outputs by meaning.** Filter by block type / field name — don't assume `content[0]` is what you want.
- **Add a typed domain layer** between raw model output and UI components so no component ever consumes unvalidated data.

***

## 4. Error Handling & Resilience

- **Wrap every model call in try/catch.** Handle network errors, rate limits, malformed responses, and timeouts *distinctly*.
- **Retry with backoff** on transient errors (429, 5xx). Add jitter. Cap retries; surface a clear message after exhaustion.
- **Graceful degradation.** If the AI call fails, the app should fail informatively (cached answer, reduced feature set, manual retry) — not silently or fatally.
- **Validate inputs before spending a call.** Cheap local checks (file type, required fields, numeric ranges, auth state) save latency and cost.
- **Return structured error objects** to both the app and the model — not raw stack traces.
- **Include request IDs and prompt IDs in logs** so failures can be traced across services.

***

## 5. Latency & UX

- **Show progress.** Loading states, streaming, or skeletons — never a frozen UI during a call.
- **Stream when possible** for long outputs so users see early tokens.
- **Display partial data progressively** rather than blocking the whole UI on one slow response.
- **Set expectations.** Tell users the AI may take a few seconds and may occasionally be wrong.

### Accessibility (non-negotiable)

- Use semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, etc.) and maintain heading hierarchy.
- Ensure keyboard-operable controls, visible `:focus-visible` states, and descriptive `aria-label` on icon-only buttons.
- Minimum 44×44 px touch targets on all interactive elements.
- Associate error messages programmatically with their fields — readable by screen readers.
- Never rely on color alone to convey status, confidence, or failure.
- Respect `prefers-reduced-motion` by providing static/instant fallbacks for all animations.

***

## 6. Cost & Token Management

- **Right-size the model.** Use the smallest/cheapest model that meets quality bar; reserve large models for genuinely hard tasks.
- **Cap `max_tokens`** to what the task needs. Store task presets centrally so budgets do not drift.
- **Trim context.** Send only relevant history/state; summarize or window long conversations.
- **Cache** deterministic or repeated results where feasible (classifications, summaries of immutable files).
- **Batch** independent requests in parallel instead of looping serial calls.
- **Measure repair rate** after schema failures — a rising rate signals a prompt or schema regression before users report it.

***

## 7. Security & Safety

- **Never embed secrets/API keys** in client-side code. Route calls through a backend/proxy that injects credentials.
- **Treat all model output as untrusted.** Escape HTML, avoid `eval`, sandbox any executed code.
- **Guard against prompt injection.** Untrusted text (user input, fetched web content, file contents, tool results) can contain instructions. Isolate it in tagged blocks and never grant it authority over system instructions. Model all external content as a prompt-injection source.
- **Confirm before destructive/irreversible actions** triggered by model output (external side effects, purchases, writes).
- **Don't exfiltrate sensitive data** into prompts that hit third-party tools without need. Redact logs before storage.
- **Use allowlists** for tools, domains, file types, and operations. Define least-privilege scopes.

***

## 8. State & Conversation Management

- **Pass full history each turn** for multi-turn flows; the model is stateless.
- **For stateful apps (games, wizards),** serialize the complete state into a typed object, pass it in the prompt, and ask the model to return the updated state.
- **Version your state schema** so old persisted state can be migrated cleanly.
- **Keep state normalization separate from UI state** to simplify tests and reduce rendering bugs.
- **Avoid hidden prompt state** that exists only inside string concatenation helpers — it is invisible to tests and reviewers.

***

## 9. Tools & Integrations

- **Define tools narrowly** with clear descriptions and typed parameters — vague tools get misused.
- **Validate tool inputs and outputs** on both sides of the call.
- **Process tool results by type/structure, not position.** Don't assume `content[0]` is what you want; filter by block type.
- **Fail closed.** If a tool errors, return a structured error the model can reason about, not a raw stack trace.
- **Prefer several focused tools** over one vague general-purpose tool with ambiguous behavior.

***

## 10. Testing & Observability

- **Log prompts, model IDs, token counts, latency, parse outcomes, retries, and result classes** (redacting sensitive data) for debugging and eval.
- **Build a small eval set** of representative inputs + expected behaviors; run it on every prompt or model change.
- **Test the unhappy paths:** malformed output, empty input, rate limits, timeouts, injection attempts, tool failures.
- **Track cost and latency** per call type so regressions are visible.
- **Write testable prompt builders** — functions that accept explicit inputs and return deterministic prompt strings, so they can be snapshot-tested and reviewed.
- **Include a test matrix, threat model, and performance budget** in the repo so evaluators can see how the app behaves under failure, not just success.

***

## 11. Agent-Specific Notes

When an autonomous agent builds or extends this micro app:

- **Read the existing schema/state contract first**; don't reinvent it.
- **Make minimal, scoped edits.** Preserve the one-job principle.
- **Keep model output validated** — never wire raw output directly into execution or rendering.
- **Document any new prompt, tool, or schema field inline** where the next agent or developer will look first.
- **Prefer determinism.** Where logic can live in code rather than a model call, put it in code.

***

## Evaluation Criteria

Every implementation decision should be weighed against these five criteria:

| Criterion | What "high score" looks like |
|---|---|
| **Code Quality** | Small modules, typed boundaries, minimal side effects, readable naming, centralized prompt/config, linted and formatted. |
| **Security** | Backend-only secrets, output sanitization, injection isolation, explicit confirmation gates, audit logs for risky actions. |
| **Efficiency** | Low token waste, bounded retries, fast local validation, sensible model sizing, caching, batching, deterministic preprocessing. |
| **Testing** | Prompt versions under test, eval set coverage, unit tests for validators, integration tests for failures, snapshotable outputs. |
| **Accessibility** | Keyboard flow, screen-reader labels, WCAG AA contrast, 44px touch targets, clear error feedback, reduced-motion support. |

***

## Quick Checklist

- [ ] Single, clear purpose
- [ ] Model version pinned, `max_tokens` capped, prompt templates versioned
- [ ] Structured output + schema validation + bounded parse-error reprompt
- [ ] All state passed explicitly each call; no hidden prompt state
- [ ] try/catch + retry/backoff + structured error objects on every call
- [ ] Loading/streaming UX; never a frozen interface
- [ ] No secrets client-side; all output treated as untrusted
- [ ] Prompt-injection isolation for all untrusted input
- [ ] Accessibility: semantic HTML, keyboard nav, contrast, labels, 44px targets
- [ ] Logging + small eval set covering happy and unhappy paths
- [ ] Cost/latency/repair-rate monitored; regressions visible early
- [ ] Threat model, test matrix, and fallback behaviors documented in repo