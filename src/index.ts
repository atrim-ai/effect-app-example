import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Fiber } from "effect"
import { createServer } from "node:http"
import { FullAutoTracingLive } from '@atrim/instrument-node/effect/auto'

console.log('[effect-app] Starting application...')

// Define routes - fork fibers for auto-tracing visibility
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.gen(function* () {
    console.log('[effect-app] Handling / request')
    // Fork a fiber to trigger supervisor
    const fiber = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep('10 millis')
        return "Hello, Effect!"
      })
    )
    const result = yield* Fiber.join(fiber)
    return HttpServerResponse.text(result)
  })),
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" })),
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 0 })

// Compose the application with FullAutoTracingLive (includes exporter setup)
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(FullAutoTracingLive),
)

console.log('[effect-app] Launching server with FullAutoTracingLive...')

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
