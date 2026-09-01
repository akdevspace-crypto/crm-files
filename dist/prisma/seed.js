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
async function main() {
    console.log('Start seeding Paramantra CRM Phase 1 dynamic RBAC...');
    const org = await prisma.organization.upsert({
        where: { id: 'fc75cbca-5a45-46e9-9905-521d708e5ebe' },
        update: {},
        create: {
            id: 'fc75cbca-5a45-46e9-9905-521d708e5ebe',
            name: 'Paramantra Enterprise Solutions',
            gstNumber: '29ABCDE1234F1Z5',
            address: '100 Innovation Way, Tech Park',
            city: 'Bangalore',
            country: 'India',
            timezone: 'Asia/Kolkata',
            businessHours: {
                open: '09:00',
                close: '18:00',
            },
        },
    });
    console.log(`Organization seeded: ${org.name}`);
    const permissionsList = [
        { code: 'Lead.Create', category: 'Lead' },
        { code: 'Lead.Read', category: 'Lead' },
        { code: 'Lead.Update', category: 'Lead' },
        { code: 'Lead.Delete', category: 'Lead' },
        { code: 'Lead.Claim', category: 'Lead' },
        { code: 'Lead.Import', category: 'Lead' },
        { code: 'Lead.Export', category: 'Lead' },
        { code: 'Customer.Create', category: 'Customer' },
        { code: 'Customer.Read', category: 'Customer' },
        { code: 'Customer.Update', category: 'Customer' },
        { code: 'Customer.Delete', category: 'Customer' },
        { code: 'Dashboard.View', category: 'Dashboard' },
        { code: 'Calendar.Create', category: 'Calendar' },
        { code: 'Calendar.Read', category: 'Calendar' },
        { code: 'Calendar.Update', category: 'Calendar' },
        { code: 'Calendar.Delete', category: 'Calendar' },
        { code: 'Org.Update', category: 'Organization' },
    ];
    const dbPermissions = [];
    for (const perm of permissionsList) {
        const p = await prisma.permission.upsert({
            where: { code: perm.code },
            update: {},
            create: {
                code: perm.code,
                category: perm.category,
            },
        });
        dbPermissions.push(p);
    }
    console.log(`Seeded ${dbPermissions.length} dynamic permissions`);
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Supervisory role with full access to organization data and settings',
        },
    });
    const agentRole = await prisma.role.upsert({
        where: { name: 'AGENT' },
        update: {},
        create: {
            name: 'AGENT',
            description: 'Standard CRM agent with pipeline operations access',
        },
    });
    for (const perm of dbPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });
    }
    const agentAllowedCodes = [
        'Lead.Read',
        'Lead.Update',
        'Lead.Claim',
        'Customer.Read',
        'Customer.Update',
        'Dashboard.View',
        'Calendar.Read',
        'Calendar.Create',
        'Calendar.Update',
    ];
    const agentPerms = dbPermissions.filter((p) => agentAllowedCodes.includes(p.code));
    for (const perm of agentPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: agentRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: agentRole.id,
                permissionId: perm.id,
            },
        });
    }
    console.log('Mapped permissions to ADMIN and AGENT roles');
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'Raghav@uec.com';
    const adminPass = process.env.SUPER_ADMIN_PASSWORD || 'raghav@uec.com';
    const passwordHash = await bcrypt.hash(adminPass, 10);
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
        },
        create: {
            email: adminEmail,
            passwordHash,
            organizationId: org.id,
            role: 'SUPER_ADMIN',
            agentProfile: {
                create: {
                    name: 'Raghav',
                    department: 'Management',
                    status: 'AVAILABLE',
                },
            },
        },
    });
    await prisma.userRoleAssignment.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    console.log(`Admin user seeded: ${adminUser.email} / (password restored from env)`);
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map