# Effect App Example

This is an Effect TypeScript HTTP API project.

**Primary Goals:**
1. Compare instrumentation approaches: show that `@atrim/instrument-node` requires less code than native OTel instrumentation
2. Use git diffs between branches to illustrate the difference in lines of code

## Tech Stack

- **Runtime**: Node.js with ESM
- **Language**: TypeScript with strict configuration
- **Framework**: Effect with @effect/platform for HTTP

## Branch Structure

### Branch Purposes

- **`main`** - Working application WITHOUT any instrumentation (baseline for comparison)
- **`otel-instrumented`** - Native OpenTelemetry instrumentation (manual SDK setup)
- **`atrim-instrumented`** - Uses `@atrim/instrument-node` library (simplified setup)

### Keeping Branches in Sync

The instrumented branches must stay synchronized with `main` for core application code. They should ONLY contain additional code required for instrumentation.

**Standard workflow when updating core code:**
1. Make changes on `main`
2. Merge `main` into both instrumented branches:
   ```bash
   git checkout otel-instrumented && git merge main
   git checkout atrim-instrumented && git merge main
   ```
3. Push all branches to keep them synced locally and remotely

**Branch reset workflow (when instrumented branches have 3+ commits):**

When an instrumented branch accumulates 3 or more commits, reset it to maintain a clean diff:

1. Create a patch from the current instrumented branch:
   ```bash
   git checkout otel-instrumented
   git diff main > /tmp/otel-instrumentation.patch
   ```
2. Create a fresh branch from main:
   ```bash
   git checkout main
   git checkout -b otel-instrumented-new
   git apply /tmp/otel-instrumentation.patch
   git add -A && git commit -m "feat: add OpenTelemetry instrumentation"
   ```
3. Replace the old branch:
   ```bash
   git branch -D otel-instrumented
   git branch -m otel-instrumented-new otel-instrumented
   git push origin otel-instrumented --force
   ```
4. Repeat for `atrim-instrumented` if needed
5. Ensure all branches are synced locally before proceeding with new work

## Code Style for Instrumented Branches

**No comments in instrumentation code.** Changes on instrumented branches should be self-documenting. The git diff against `main` serves as the documentation showing exactly what instrumentation requires.

**Minimize code additions.** Only add what is strictly necessary for instrumentation to function. This keeps diffs clean and demonstrates the true cost of each approach.

## Quick Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Watch mode compilation
pnpm build      # Build for production
pnpm typecheck  # Type check
```

## Comparing Instrumentation Approaches

To see the difference between approaches:

```bash
# Lines added for OTel native instrumentation
git diff main..otel-instrumented --stat

# Lines added for Atrim instrumentation
git diff main..atrim-instrumented --stat

# Side-by-side diff of a specific file
git diff main..otel-instrumented -- src/index.ts
git diff main..atrim-instrumented -- src/index.ts
```

## Project Structure

```
src/           # TypeScript source files
dist/          # Compiled JavaScript output
```

## Commands

- `pnpm build` - Compile TypeScript
- `pnpm dev` - Watch mode compilation
- `pnpm typecheck` - Type check without emitting

## Dependencies

**main branch (baseline):**
- `effect`: Core Effect library
- `@effect/platform`: HTTP server
- `@effect/platform-node`: Node.js runtime

**otel-instrumented adds:**
- `@effect/opentelemetry`: Effect-OTel integration
- `@opentelemetry/api`: OTel API
- `@opentelemetry/sdk-trace-base`: OTel SDK trace
- `@opentelemetry/sdk-trace-node`: OTel Node.js tracer provider
- `@opentelemetry/sdk-trace-web`: OTel Web tracer (peer dependency)
- `@opentelemetry/resources`: OTel resources
- `@opentelemetry/semantic-conventions`: OTel semantic conventions
- `@opentelemetry/exporter-trace-otlp-http`: OTLP exporter
- `dotenv`: Environment variable loading

**atrim-instrumented adds:**
- `@atrim/instrument-node`: Atrim instrumentation
- `@effect/opentelemetry`: Effect-OTel integration (peer dependency)
- `@opentelemetry/api`: OTel API (peer dependency)

<!-- effect-solutions:start -->
## Effect Solutions Usage

The Effect Solutions CLI provides curated best practices and patterns for Effect TypeScript. Before working on Effect code, check if there's a relevant topic that covers your use case.

- `effect-solutions list` - List all available topics
- `effect-solutions show <slug...>` - Read one or more topics
- `effect-solutions search <term>` - Search topics by keyword

**Local Effect Source:** The Effect repository is cloned to `~/.local/share/effect-solutions/effect` for reference. Use this to explore APIs, find usage examples, and understand implementation details when the documentation isn't enough.
<!-- effect-solutions:end -->
