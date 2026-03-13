import { deepFreeze } from "./freeze.js";

export function buildRecordLookup(records, keyField) {
    return deepFreeze(
        Object.fromEntries(records.map((record) => [record[keyField], record]))
    );
}

export function buildGroupedLookup(records, keyField) {
    const grouped = records.reduce((accumulator, record) => {
        const key = record[keyField];
        const current = accumulator[key] || [];
        current.push(record);
        accumulator[key] = current;
        return accumulator;
    }, Object.create(null));

    Object.keys(grouped).forEach((key) => {
        grouped[key] = Object.freeze(grouped[key]);
    });

    return deepFreeze(grouped);
}
