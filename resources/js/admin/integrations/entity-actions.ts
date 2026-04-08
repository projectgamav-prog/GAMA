import { entityDeleteActionModule } from '@/admin/modules/entity-actions/EntityDeleteAction';

export {
    entityDeleteActionModule,
};

export const entityActionAdminModules = [entityDeleteActionModule] as const;
