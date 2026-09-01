import { OrgRepository } from './org.repository';
import { CreateOrgDto, UpdateOrgDto, CreateBranchDto } from './dto/org.dto';
export declare class OrgService {
    private readonly orgRepo;
    constructor(orgRepo: OrgRepository);
    createOrganization(dto: CreateOrgDto): Promise<{
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
    getOrganization(id: string): Promise<{
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
    }>;
    updateOrganization(id: string, dto: UpdateOrgDto): Promise<{
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
    deleteOrganization(id: string): Promise<{
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
    createBranch(orgId: string, dto: CreateBranchDto): Promise<{
        id: string;
        name: string;
        address: string | null;
        createdAt: Date;
        organizationId: string;
    }>;
    removeBranch(branchId: string): Promise<{
        id: string;
        name: string;
        address: string | null;
        createdAt: Date;
        organizationId: string;
    }>;
}
