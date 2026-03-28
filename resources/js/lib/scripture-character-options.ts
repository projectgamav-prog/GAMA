import type {
    ScriptureCharacterSummary,
    ScriptureVerseCharacterAssignment,
} from '@/types';

export function getUniqueVerseCharacterOptions(
    assignments: ScriptureVerseCharacterAssignment[],
): ScriptureCharacterSummary[] {
    const charactersById = new Map<number, ScriptureCharacterSummary>();

    assignments.forEach((assignment) => {
        const character = assignment.character;

        if (
            character === null ||
            character === undefined ||
            typeof character.id !== 'number' ||
            typeof character.name !== 'string'
        ) {
            return;
        }

        if (!charactersById.has(character.id)) {
            charactersById.set(character.id, character);
        }
    });

    return [...charactersById.values()];
}
