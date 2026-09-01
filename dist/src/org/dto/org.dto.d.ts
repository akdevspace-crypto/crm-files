export declare class CreateOrgDto {
    name: string;
    gstNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
    businessHours?: any;
}
export declare class UpdateOrgDto extends CreateOrgDto {
}
export declare class CreateBranchDto {
    name: string;
    address?: string;
}
