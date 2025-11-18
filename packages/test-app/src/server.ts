import express from "express";
import { renderTrpcPanel } from "@aeolun/trpc-ui";
import connectLiveReload from "connect-livereload";
import morgan from "morgan";
import * as trpcExpress from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import cors from "cors";
import { testRouter } from "./router.js";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import compression from "compression";
dotenv.config();

const serverUrl = process.env.SERVER_URL || "http://localhost";
const trpcPath = process.env.TRPC_PATH || "trpc";
const port = Number(process.env.PORT) || 4000;

console.log("Starting server with environment variables:");
console.log(process.env);

// to marginally improve local development experience
const liveReload = process.env.LIVE_RELOAD === "true";
const simulateDelay = process.env.SIMULATE_DELAY === "true";

if (!serverUrl) throw new Error("No SERVER_URL passed.");
if (!trpcPath) throw new Error("No TRPC_PATH passed.");

async function createExpressContext(
	opts: trpcExpress.CreateExpressContextOptions,
) {
	const authHeader = opts.req.headers.authorization;
	return {
		authorized: !!authHeader,
	};
}

async function createWSContext(opts: CreateWSSContextFnOptions) {
	const connectionParams = opts.info.connectionParams;
	console.log("Connection params:", connectionParams);
	return {
		authorized: !!connectionParams?.authorization,
	};
}

const expressApp = express();
const httpServer = createServer(expressApp);
const wss = new WebSocketServer({ server: httpServer });
// Apply WebSocket handler
const wssHandler = applyWSSHandler({
	wss,
	router: testRouter,
	createContext: createWSContext,
});

expressApp.use(cors({ origin: "*" }));
expressApp.use(compression());
if (liveReload) {
	expressApp.use(connectLiveReload());
}

if (simulateDelay) {
	console.log("Simulating delay...");
	expressApp.use((req, res, next) => {
		setTimeout(() => {
			next();
			console.log("Next in timeout");
		}, 1000);
	});
}

expressApp.use(morgan("short", {}));
expressApp.use(
	`/${trpcPath}`,
	trpcExpress.createExpressMiddleware({
		router: testRouter,
		createContext: createExpressContext,
	}),
);

console.log("Starting at url ");
console.log(`${serverUrl}${port ? `:${port}` : ""}/${trpcPath}`);

expressApp.get("/", async (_req, res) => {
	console.log("Got request");
	res.setHeader("Content-Type", "text/html");
	const html = renderTrpcPanel(testRouter, {
		url: `${serverUrl}${
			process.env.NODE_ENV === "production" ? "" : `:${port}`
		}/${trpcPath}`,
		transformer: "superjson",
		cache: false,
		extractTags: (meta) => {
			if (meta.role === "user") {
				return [
					{
						text: "user",
						color: "hotpink",
					},
				];
			}
			if (meta.role === "admin") {
				return [
					{
						text: "admin",
						color: "blue",
					},
				];
			}
			return [];
		},
	});
	res.send(html);
});

httpServer.listen(port ? port : 4000, () => {
	console.log(`Server running on port ${port || 4000}`);
	console.log(`WebSocket server is ready at ws://localhost:${port || 4000}`);
});
