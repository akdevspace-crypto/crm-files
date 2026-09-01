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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
async function run() {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);
        const email = `test_agent_${Date.now()}@test.com`;
        console.log("Attempting to insert test User with email:", email);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'AGENT',
            },
        });
        console.log("User created successfully:", user.id);
        console.log("Attempting to insert Agent profile...");
        const agent = await prisma.agent.create({
            data: {
                userId: user.id,
                name: 'Test Agent',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                gender: '',
                dob: undefined,
                employeeId: `EMP_${Date.now()}`,
                department: 'Sales',
                status: 'AVAILABLE',
            },
        });
        console.log("Agent created successfully:", agent.id);
    }
    catch (err) {
        console.error("PRISMA FAILURE RUNNING TEST INSERTION:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=test-create.js.map