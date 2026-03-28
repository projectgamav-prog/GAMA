import { hierarchyCreateEditorModule } from '@/admin/modules/sections/HierarchyCreateEditor';
import { sectionCollectionPanelModule } from '@/admin/modules/sections/SectionCollectionPanel';
import { sectionGroupPanelModule } from '@/admin/modules/sections/SectionGroupPanel';
import { sectionIntroEditorModule } from '@/admin/modules/sections/SectionIntroEditor';
import { sectionRowDetailEditorModule } from '@/admin/modules/sections/SectionRowDetailEditor';

export {
    hierarchyCreateEditorModule,
    sectionCollectionPanelModule,
    sectionGroupPanelModule,
    sectionIntroEditorModule,
    sectionRowDetailEditorModule,
};

export const sectionAdminModules = [
    sectionCollectionPanelModule,
    sectionGroupPanelModule,
    hierarchyCreateEditorModule,
    sectionIntroEditorModule,
    sectionRowDetailEditorModule,
] as const;
