import { OrgService } from './org.service';
import { UpdateOrgDto, CreateBranchDto } from './dto/org.dto';
export declare class OrgController {
    private readonly orgService;
    constructor(orgService: OrgService);
    getOrg(id: string): Promise<{
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
    updateOrg(id: string, dto: UpdateOrgDto): Promise<{
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
    addBranch(orgId: string, dto: CreateBranchDto): Promise<{
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
