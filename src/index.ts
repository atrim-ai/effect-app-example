import { initializeInstrumentation } from "@atrim/instrument-node"

await initializeInstrumentation({
  serviceName: "effect-app-example",
  serviceVersion: "1.0.0",
  otlp: {
    endpoint: 'http://localhost:4319',
    headers: {
      'x-api-key': 'atrim_internal_tenant_000000000002'
    }
  }
})

import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { createServer } from "node:http"
import { EffectInstrumentationLive } from "@atrim/instrument-node/effect"

// Define routes with manual spans
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.sync(() => HttpServerResponse.text("Hello, Effect!")).pipe(Effect.withSpan("GET /"))),
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" }).pipe(Effect.withSpan("GET /health"))),
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 0 })

// Compose the application
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(EffectInstrumentationLive),
)

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
