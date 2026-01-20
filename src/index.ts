import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Fiber } from "effect"
import { createServer } from "node:http"
import { UnifiedTracingLive } from "@atrim/instrument-node/effect/auto"

const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.gen(function* () {
    const fiber1 = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep('5 millis')
        return "task1"
      }).pipe(Effect.withSpan('task1'))
    )
    const fiber2 = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep('10 millis')
        return "task2"
      }).pipe(Effect.withSpan('task2'))
    )

    yield* Fiber.join(fiber1)
    yield* Fiber.join(fiber2)

    return HttpServerResponse.text("Hello, Effect!")
  }).pipe(Effect.withSpan('GET /'))),

  HttpRouter.get("/batch", Effect.gen(function* () {
    const results = yield* Effect.all([
      Effect.succeed({ id: 1, name: "Alice" }),
      Effect.succeed({ id: 2, name: "Bob" }),
      Effect.succeed({ id: 3, name: "Charlie" })
    ])

    return yield* HttpServerResponse.json({ users: results })
  }).pipe(Effect.withSpan('GET /batch'))),

  HttpRouter.get("/process", Effect.gen(function* () {
    const items = [1, 2, 3, 4, 5]
    const processed = yield* Effect.forEach(items, (n) =>
      Effect.gen(function* () {
        yield* Effect.sleep('2 millis')
        return n * 2
      }).pipe(Effect.withSpan('processItem', { attributes: { 'item.value': n } }))
    )

    return yield* HttpServerResponse.json({ processed })
  }).pipe(Effect.withSpan('GET /process'))),

  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" })),
)

const ServerLive = NodeHttpServer.layer(createServer, { port: 0 })

const HttpLive = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(UnifiedTracingLive),
)

NodeRuntime.runMain(Layer.launch(HttpLive))
