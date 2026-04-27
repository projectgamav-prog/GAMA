export type AdminSchemaConstraintContext = {
    isCanonical?: boolean;
    isProtected?: boolean;
    quickEditAllowedFields?: readonly string[];
    structuredOnlyFields?: readonly string[];
    readOnlyFields?: readonly string[];
    protectedMutationReasons?: readonly string[];
};
