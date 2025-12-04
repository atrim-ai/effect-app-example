// Load environment variables for OTLP configuration
import "dotenv/config"

import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { createServer } from "node:http"

// --- OpenTelemetry imports ---
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { Resource } from "@opentelemetry/resources"
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions"

// --- OpenTelemetry configuration (reads from environment) ---
const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318"
const otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS
  ? Object.fromEntries(
      process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",").map((h) =>
        h.split("=")
      )
    )
  : {}

const TracingLive = NodeSdk.layer(() => ({
  resource: new Resource({
    [ATTR_SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || "effect-app-example",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: otlpHeaders,
    })
  ),
}))

// Define routes with manual span instrumentation
const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(HttpServerResponse.text("Hello, Effect!")).pipe(
      Effect.withSpan("GET /", { attributes: { "http.route": "/" } })
    )
  ),
  HttpRouter.get(
    "/health",
    Effect.succeed(HttpServerResponse.json({ status: "ok" })).pipe(
      Effect.withSpan("GET /health", { attributes: { "http.route": "/health" } })
    )
  )
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 })

// Compose the application with tracing
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(TracingLive) // Add tracing layer
)

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
