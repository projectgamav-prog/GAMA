import { createCharacterCollection, normalizeCharacterSlug } from "./schema.js";

const rawCharacters = [
    {
        slug: "krishna",
        name: "Krishna",
        image: "/assets/images/image.png",
        tradition: "Hindu",
        role: "Divine Guide",
        era: "Ancient",
        collection: "Bhagavad Gita Core",
        short_meta: "Divine guide - Bhagavad Gita",
        summary:
            "Krishna stands at the center of the Gita as the voice of discernment, duty, devotion, and inner freedom.",
        overview:
            "Krishna teaches how action, wisdom, and devotion can coexist without contradiction. He enters Arjuna's crisis not to remove struggle, but to illuminate the right way to move through it.",
        focus: "Duty, devotion, discernment, liberated action",
        detail_available: true,
        aliases: ["Sri Krishna", "Vasudeva"],
        tags: ["Bhagavad Gita", "Dharma", "Devotion"],
        search_terms: ["govinda", "keshava", "gita guide"],
    },
    {
        slug: "arjuna",
        name: "Arjuna",
        image: "/assets/images/arjun.png",
        tradition: "Hindu",
        role: "Seeker-Warrior",
        era: "Ancient",
        collection: "Bhagavad Gita Core",
        short_meta: "Seeker-warrior - inner crisis",
        summary:
            "Arjuna represents the sincere seeker whose confusion becomes the doorway to higher understanding.",
        overview:
            "He begins in moral conflict, emotional exhaustion, and hesitation. His questions make the Gita possible, turning uncertainty into the ground for spiritual instruction.",
        focus: "Crisis, inquiry, humility, transformation",
        detail_available: true,
        aliases: ["Partha", "Dhananjaya"],
        tags: ["Bhagavad Gita", "Inquiry", "Warrior"],
        search_terms: ["arjun", "seeker", "kurukshetra"],
    },
    {
        slug: "buddha",
        name: "Buddha",
        image: "/assets/images/image.png",
        tradition: "Buddhist",
        role: "Awakened Teacher",
        era: "Ancient",
        collection: "Global Wisdom",
        short_meta: "Awakened teacher - compassion",
        summary:
            "Buddha embodies careful seeing, disciplined awareness, and compassion grounded in direct insight.",
        overview:
            "He is associated with the movement from confusion to freedom through awareness, ethical restraint, and insight into suffering and its causes.",
        focus: "Awareness, compassion, liberation, discipline",
        detail_available: true,
        aliases: ["Gautama Buddha", "Siddhartha"],
        tags: ["Compassion", "Awareness", "Liberation"],
        search_terms: ["mindfulness", "awakening", "dharma"],
    },
    {
        slug: "jesus",
        name: "Jesus",
        image: "/assets/images/image.png",
        tradition: "Christian",
        role: "Teacher",
        era: "Classical",
        collection: "Global Wisdom",
        short_meta: "Teacher - love and sacrifice",
        summary:
            "Jesus represents transformative love, sacrifice, and a teaching centered on inner renewal and compassion.",
        overview:
            "He is remembered as a figure who brings spiritual authority into everyday life, emphasizing love, forgiveness, and the alignment of the heart with divine will.",
        focus: "Love, sacrifice, forgiveness, inward renewal",
        detail_available: true,
        aliases: ["Jesus Christ"],
        tags: ["Love", "Forgiveness", "Sacrifice"],
        search_terms: ["christ", "gospel", "teacher"],
    },
    {
        slug: "shankar",
        name: "Shankar",
        image: "/assets/images/image.png",
        tradition: "Vedanta",
        role: "Philosopher",
        era: "Medieval",
        collection: "Advaita Study",
        short_meta: "Philosopher - non-duality",
        summary:
            "Shankar is associated with clear non-dual reasoning and philosophical interpretation of the self and absolute reality.",
        overview:
            "His place in the collection centers on disciplined interpretation, metaphysical clarity, and the distinction between the changing world and the unchanging real.",
        focus: "Advaita, reasoning, self-knowledge, metaphysics",
        detail_available: false,
        aliases: ["Adi Shankaracharya"],
        tags: ["Advaita", "Vedanta", "Philosophy"],
        search_terms: ["non-duality", "commentary", "self-knowledge"],
    },
    {
        slug: "nanakdev",
        name: "Nanakdev",
        image: "/assets/images/image.png",
        tradition: "Sikh",
        role: "Saint",
        era: "Medieval",
        collection: "Sikh Wisdom",
        short_meta: "Saint - devotion and truth",
        summary:
            "Nanakdev represents devotion joined with truthfulness, service, and remembrance of the divine in daily life.",
        overview:
            "His voice in a comparative wisdom collection highlights the union of devotion, ethical living, and inward remembrance without withdrawal from society.",
        focus: "Service, remembrance, truth, devotion",
        detail_available: false,
        aliases: ["Guru Nanak", "Nanak"],
        tags: ["Service", "Truth", "Devotion"],
        search_terms: ["sikh guru", "naam", "seva"],
    },
    {
        slug: "rama",
        name: "Rama",
        image: "/assets/images/image.png",
        tradition: "Hindu",
        role: "King",
        era: "Ancient",
        collection: "Epic Traditions",
        short_meta: "King - dharma and restraint",
        summary:
            "Rama stands as a figure of ordered duty, restraint, and fidelity to dharma under pressure.",
        overview:
            "He is often approached as an exemplar of principled leadership, measured conduct, and the burden of righteous responsibility.",
        focus: "Dharma, restraint, leadership, fidelity",
        detail_available: false,
        aliases: ["Sri Rama"],
        tags: ["Dharma", "Leadership", "Epic"],
        search_terms: ["ramayana", "ideal king", "maryada"],
    },
    {
        slug: "hanuman",
        name: "Hanuman",
        image: "/assets/images/image.png",
        tradition: "Hindu",
        role: "Devotee",
        era: "Ancient",
        collection: "Epic Traditions",
        short_meta: "Devotee - strength in service",
        summary:
            "Hanuman represents strength guided by humility, service, and unwavering devotion.",
        overview:
            "He is a model of disciplined energy placed fully in service of a higher purpose, making devotion active rather than merely emotional.",
        focus: "Service, strength, devotion, humility",
        detail_available: false,
        aliases: ["Anjaneya", "Bajrangbali"],
        tags: ["Devotion", "Strength", "Service"],
        search_terms: ["bhakti", "ram devotee", "monkey god"],
    },
];

export const CHARACTERS_DATABASE = Object.freeze({
    characters: createCharacterCollection(rawCharacters),
    indexes: Object.freeze({}),
});

export const CHARACTERS = CHARACTERS_DATABASE.characters;
export const CHARACTER_FALLBACK_IMAGE = "/assets/images/image.png";

export function getCharacterRecordBySlug(slug) {
    const normalizedSlug = normalizeCharacterSlug(slug);
    return CHARACTERS.find((character) => character.slug === normalizedSlug) || null;
}
