import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    mergeCustomers(primaryId: string, duplicateId: string, req: any): Promise<{
        message: string;
        primaryId: string;
    }>;
}
