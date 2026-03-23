# Dictionary Entries

`dictionary_entries` is the v1 core table for Sanskrit dictionary data. It stores standalone word-like entries without changing the canonical scripture hierarchy.

## Fields

- `slug`: unique stable identifier for the entry.
- `headword`: main human-facing Sanskrit form, typically in Devanagari.
- `transliteration`: optional roman transliteration.
- `normalized_headword`: auto-generated search/deduplication form of `headword`.
- `normalized_transliteration`: auto-generated search/deduplication form of `transliteration`.
- `entry_type`: future-friendly classifier such as `word`, `root`, `name`, `compound`, or `phrase`.
- `root_entry_id`: optional self-reference to another dictionary entry for future root or derivation linking.
- `root_headword`: optional plain-text helper for root or related lemma notes.
- `short_meaning`: optional one-line quick meaning.
- `notes`: optional internal editorial or admin notes.
- `is_published`: visibility flag for public-facing use later.

## Normalization

Normalized fields are generated automatically when a dictionary entry is saved.

The v1 normalization is intentionally conservative:

- trims and squishes whitespace
- removes zero-width characters
- removes obvious punctuation and separators, including danda-style marks
- lowercases transliteration normalization only
- preserves Devanagari text and transliteration diacritics

This version does not perform stemming, cross-script transliteration, grammatical analysis, or fuzzy search expansion.

## Not Included Yet

The v1 dictionary core intentionally does not yet include separate tables for:

- `dictionary_entry_meanings`
- `dictionary_entry_forms`
- `dictionary_entry_relations`
- `verse_dictionary_entries`

Those are the recommended phase-2 extensions once the core entry layer is stable.

`root_entry_id` gives v1 a minimal path toward word-family and derivation navigation without requiring those phase-2 tables yet.
