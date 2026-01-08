import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { createServer } from "node:http"
import { EffectInstrumentationLive } from "@atrim/instrument-node/effect"

// Define routes
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.text("Hello, Effect!")),
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" })),
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 })

// Compose the application
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
)

// Run with instrumentation
const program = Effect.gen(function* () {
  yield* Effect.log("Starting Effect HTTP server with auto-instrumentation")
  return yield* Effect.never
}).pipe(
  Effect.provide(Layer.merge(HttpLive, EffectInstrumentationLive))
)

NodeRuntime.runMain(program)
