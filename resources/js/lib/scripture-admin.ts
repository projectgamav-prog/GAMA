export const formatAdminList = (values: unknown[] | null | undefined): string => {
    if (!Array.isArray(values)) {
        return '';
    }

    return values
        .filter(
            (value): value is string =>
                typeof value === 'string' && value.trim().length > 0,
        )
        .map((value) => value.trim())
        .join(', ');
};

export const parseAdminList = (value: string): string[] =>
    value
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
