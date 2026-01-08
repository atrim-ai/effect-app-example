// Load environment variables for OTLP configuration
import "dotenv/config"

import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"

// --- OpenTelemetry imports ---
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

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
  resource: {
    serviceName: process.env.OTEL_SERVICE_NAME || "effect-app-example",
    serviceVersion: "1.0.0",
  },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: otlpHeaders,
    })
  ),
}))

// Define routes
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.text("Hello, Effect!")),
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" }))
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 0 })

// Compose the application with tracing
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(Layer.merge(ServerLive, TracingLive))
)

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
