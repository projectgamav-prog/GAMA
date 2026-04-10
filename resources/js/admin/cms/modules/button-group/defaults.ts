import type { ButtonGroupConfig, ButtonGroupData } from './types';
import { createDefaultButton } from './types';

export const buttonGroupDefaultData: ButtonGroupData = {
    buttons: [createDefaultButton()],
};

export const buttonGroupDefaultConfig: ButtonGroupConfig = {
    layout: 'auto',
    alignment: 'stretch',
};
