import type { AdminContext, Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            adminContext: AdminContext;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
