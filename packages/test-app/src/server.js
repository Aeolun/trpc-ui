"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trpc_ui_1 = require("@aeolun/trpc-ui");
const connect_livereload_1 = __importDefault(require("connect-livereload"));
const morgan_1 = __importDefault(require("morgan"));
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const ws_1 = require("@trpc/server/adapters/ws");
const cors_1 = __importDefault(require("cors"));
const router_js_1 = require("./router.js");
const dotenv_1 = __importDefault(require("dotenv"));
const node_http_1 = require("node:http");
const ws_2 = require("ws");
const compression_1 = __importDefault(require("compression"));
dotenv_1.default.config();
const serverUrl = process.env.SERVER_URL || "http://localhost";
const trpcPath = process.env.TRPC_PATH || "trpc";
const port = Number(process.env.PORT) || 4000;
console.log("Starting server with environment variables:");
console.log(process.env);
// to marginally improve local development experience
const liveReload = process.env.LIVE_RELOAD === "true";
const simulateDelay = process.env.SIMULATE_DELAY === "true";
if (!serverUrl)
    throw new Error("No SERVER_URL passed.");
if (!trpcPath)
    throw new Error("No TRPC_PATH passed.");
function createExpressContext(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = opts.req.headers.authorization;
        return {
            authorized: !!authHeader,
        };
    });
}
function createWSContext(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const connectionParams = opts.info.connectionParams;
        console.log("Connection params:", connectionParams);
        return {
            authorized: !!(connectionParams === null || connectionParams === void 0 ? void 0 : connectionParams.authorization),
        };
    });
}
const expressApp = (0, express_1.default)();
const httpServer = (0, node_http_1.createServer)(expressApp);
const wss = new ws_2.WebSocketServer({ server: httpServer });
// Apply WebSocket handler
const wssHandler = (0, ws_1.applyWSSHandler)({
    wss,
    router: router_js_1.testRouter,
    createContext: createWSContext,
});
expressApp.use((0, cors_1.default)({ origin: "*" }));
expressApp.use((0, compression_1.default)());
if (liveReload) {
    expressApp.use((0, connect_livereload_1.default)());
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
expressApp.use((0, morgan_1.default)("short", {}));
expressApp.use(`/${trpcPath}`, trpcExpress.createExpressMiddleware({
    router: router_js_1.testRouter,
    createContext: createExpressContext,
}));
console.log("Starting at url ");
console.log(`${serverUrl}${port ? `:${port}` : ""}/${trpcPath}`);
expressApp.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Got request");
    res.setHeader("Content-Type", "text/html");
    const html = (0, trpc_ui_1.renderTrpcPanel)(router_js_1.testRouter, {
        url: `${serverUrl}${process.env.NODE_ENV === "production" ? "" : `:${port}`}/${trpcPath}`,
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
}));
httpServer.listen(port ? port : 4000, () => {
    console.log(`Server running on port ${port || 4000}`);
    console.log(`WebSocket server is ready at ws://localhost:${port || 4000}`);
});
