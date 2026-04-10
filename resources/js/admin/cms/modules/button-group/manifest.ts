import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import {
    buttonGroupDefaultConfig,
    buttonGroupDefaultData,
} from './defaults';
import { ButtonGroupEditor } from './editor';
import { ButtonGroupRenderer } from './renderer';
import {
    getButtonGroupAlignment,
    getButtonGroupButtons,
    getButtonGroupLayout,
} from './types';

const validateButtonGroup = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};
    const buttons = getButtonGroupButtons(value.data);

    if (buttons.length === 0) {
        errors['data_json.buttons'] = 'Add at least one button.';

        return errors;
    }

    buttons.forEach((button, index) => {
        if (button.label.trim() === '') {
            errors[`data_json.buttons.${index}.label`] = 'Button label is required.';
        }

        if (
            ! ['url', 'cms_page', 'scripture_route'].includes(
                button.destination_type,
            )
        ) {
            errors[`data_json.buttons.${index}.destination_type`] =
                'Choose a valid destination type.';
        }

        if (
            button.destination_type === 'url'
            && (button.url === null || button.url.trim() === '')
        ) {
            errors[`data_json.buttons.${index}.url`] =
                'Button URL is required.';
        }

        if (
            button.destination_type === 'cms_page'
            && (button.cms_page_slug === null
                || button.cms_page_slug.trim() === '')
        ) {
            errors[`data_json.buttons.${index}.cms_page_slug`] =
                'CMS page slug is required.';
        }

        if (
            button.destination_type === 'scripture_route'
            && (button.scripture_path === null
                || button.scripture_path.trim() === '')
        ) {
            errors[`data_json.buttons.${index}.scripture_path`] =
                'Scripture path is required.';
        }

        if (
            ! ['default', 'secondary', 'outline', 'ghost'].includes(
                button.variant,
            )
        ) {
            errors[`data_json.buttons.${index}.variant`] = 'Choose a valid button style.';
        }
    });

    if (
        ! ['auto', 'stack', 'inline'].includes(
            getButtonGroupLayout(value.config),
        )
    ) {
        errors['config_json.layout'] = 'Choose a valid button layout.';
    }

    if (
        ! ['start', 'center', 'end', 'stretch'].includes(
            getButtonGroupAlignment(value.config),
        )
    ) {
        errors['config_json.alignment'] = 'Choose a valid button alignment.';
    }

    return errors;
};

export const buttonGroupModuleManifest = defineCmsModuleManifest({
    key: 'button_group',
    label: 'Button Group',
    category: 'actions',
    description:
        'One or more CTA buttons that stay grouped inside the current container.',
    defaultData: buttonGroupDefaultData,
    defaultConfig: buttonGroupDefaultConfig,
    Renderer: ButtonGroupRenderer,
    Editor: ButtonGroupEditor,
    validate: validateButtonGroup,
});
