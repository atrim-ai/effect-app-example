import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
})

export const TracingLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "effect-service",
  },
  spanProcessor: new BatchSpanProcessor(exporter),
}))
