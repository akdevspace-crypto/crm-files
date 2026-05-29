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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = __importStar(require("express"));
const telephony_gateway_1 = require("./telephony/telephony.gateway");
const legacyModule = require('./legacy/index.js');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.enableCors({ origin: '*' });
    app.enableShutdownHooks();
    const expressInstance = app.getHttpAdapter().getInstance();
    expressInstance.use(legacyModule.app);
    const server = await app.listen(4000);
    console.log(`[Unified Backend] Running on Port 4000`);
    try {
        const telephonyGateway = app.get(telephony_gateway_1.TelephonyGateway);
        const io = telephonyGateway.server;
        legacyModule.mountLegacyApp(legacyModule.app, io);
        console.log(`[Legacy Service] successfully mounted and initialized.`);
    }
    catch (err) {
        console.error(`[Legacy Service] failed to initialize.`, err);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map