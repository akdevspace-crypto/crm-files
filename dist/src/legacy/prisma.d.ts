export = prisma;
declare const prisma: PrismaClient<{
    log: ("error" | "warn" | "info")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
import { PrismaClient } from ".prisma/client";
