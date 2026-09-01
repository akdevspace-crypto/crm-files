import { PrismaService } from '../prisma/prisma.service';
export declare class OrgRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        name: string;
        gstNumber: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        businessHours: import("@prisma/client/runtime/library").JsonValue | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findById(id: string): Promise<({
        branches: {
            id: string;
            name: string;
            address: string | null;
            createdAt: Date;
            organizationId: string;
        }[];
    } & {
        id: string;
        name: string;
        gstNumber: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        businessHours: import("@prisma/client/runtime/library").JsonValue | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        gstNumber: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        businessHours: import("@prisma/client/runtime/library").JsonValue | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        gstNumber: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        businessHours: import("@prisma/client/runtime/library").JsonValue | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addBranch(orgId: string, name: string, address?: string): Promise<{
        id: string;
        name: string;
        address: string | null;
        createdAt: Date;
        organizationId: string;
    }>;
    findBranchById(branchId: string): Promise<{
        id: string;
        name: string;
        address: string | null;
        createdAt: Date;
        organizationId: string;
    } | null>;
    deleteBranch(branchId: string): Promise<{
        id: string;
        name: string;
        address: string | null;
        createdAt: Date;
        organizationId: string;
    }>;
}
