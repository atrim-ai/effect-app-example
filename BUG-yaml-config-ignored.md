# Bug: instrumentation.yaml exporter_config is ignored

## Summary
The `exporter_config.endpoint` setting in `instrumentation.yaml` is being ignored by `@atrim/instrument-node`. The library defaults to `http://localhost:4318` regardless of what's configured.

## Steps to Reproduce

1. Set `exporter_config.endpoint` to a custom value in `instrumentation.yaml`:
   ```yaml
   effect:
     exporter_config:
       type: otlp
       endpoint: "http://localhost:9999"  # Custom port
       headers:
         x-api-key: test_key_from_yaml
   ```

2. Start the server:
   ```bash
   npx tsx src/index.ts
   ```

3. Observe the startup logs:
   ```
   @atrim/source-capture: Using OTLPTraceExporter (http://localhost:4318)
   ```

## Expected Behavior
The exporter should use `http://localhost:9999` as configured.

## Actual Behavior
The exporter uses `http://localhost:4318` (default).

## Workaround
Use environment variables instead:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4319" \
OTEL_EXPORTER_OTLP_HEADERS="x-api-key=your_key" \
npx tsx src/index.ts
```

## Affected Version
- `@atrim/instrument-node`: 0.8.0-054e7f6-20260117002843

## Impact
- Users cannot configure the exporter endpoint via YAML
- Headers configuration may also be ignored (not verified)
- Forces reliance on environment variables

## Likely Cause
The `UnifiedTracingLive` or `SourceCaptureTracingLive` layer is not reading the `exporter_config` section from the loaded config, or is reading it but not passing it to the OTLPTraceExporter constructor.
