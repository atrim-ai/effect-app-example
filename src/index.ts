import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"

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

// Run the server
NodeRuntime.runMain(Layer.launch(HttpLive))
