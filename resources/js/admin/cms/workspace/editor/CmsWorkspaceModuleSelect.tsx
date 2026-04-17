import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CmsModuleKey } from '@/types';
import { cmsModules } from '../../core/module-registry';

type Props = {
    id: string;
    value: CmsModuleKey;
    onValueChange: (nextValue: CmsModuleKey) => void;
};

export function CmsWorkspaceModuleSelect({
    id,
    value,
    onValueChange,
}: Props) {
    return (
        <Select
            value={value}
            onValueChange={(nextValue) => onValueChange(nextValue as CmsModuleKey)}
        >
            <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder="Choose a CMS module" />
            </SelectTrigger>
            <SelectContent>
                {cmsModules.map((module) => (
                    <SelectItem key={module.key} value={module.key}>
                        {module.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
