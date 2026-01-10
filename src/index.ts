import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Fiber } from "effect"
import { createServer } from "node:http"
import { CombinedTracingLive } from '@atrim/instrument-node/effect/auto'

console.log('[effect-app] Starting application...')

// Define routes with forked fibers to demonstrate fiber-level tracing
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.gen(function* () {
    console.log('[effect-app] Handling / request')

    // Fork some fibers to see fiber-level tracing
    const fiber1 = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep('5 millis')
        return "task1"
      })
    )
    const fiber2 = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep('10 millis')
        return "task2"
      })
    )

    // Wait for both
    yield* Fiber.join(fiber1)
    yield* Fiber.join(fiber2)

    return HttpServerResponse.text("Hello, Effect!")
  })),
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" })),
)

// Create the HTTP server layer
const ServerLive = NodeHttpServer.layer(createServer, { port: 3456 })

// Compose the application with CombinedTracingLive (HTTP + Fiber tracing!)
const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(CombinedTracingLive),
)

console.log('[effect-app] Launching server with CombinedTracingLive...')

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
