Codex Architecture Brief
Scripture platform admin refactor context, rules, current issues, and implementation guardrails
Use this document as the source-of-truth brief in a fresh Codex window.
Purpose: prevent page-local hacks, preserve the locked semantic-surface architecture, and correct the current Verse translation/commentary implementation without losing the good schema-based wiring.
Current priority	Keep the good schema-based module wiring, remove fake full-edit behavior, and rewrite Verse translations/commentaries into user-friendly editor language.
1. Locked architecture context
This project is not greenfield. The admin system already has a locked direction, and Codex must work inside it rather than improvising new page-specific patterns.
•	Pages are render shells and should stay thin.
•	Admin attaches through semantic surfaces.
•	Modules qualify by semantic identity plus capabilities.
•	Reusable editor behavior lives in resources/js/admin/modules.
•	Semantic attachment specs, builders, and contracts live in resources/js/admin/surfaces.
•	Schema-family assembly lives in resources/js/admin/integrations.
•	Runtime host and qualification engine live in resources/js/admin/core.
•	Do not reintroduce local page hooks, bridge/session behavior, or page-fragile wrappers.
2. Project direction and boundaries
•	Canonical scripture/book pages are schema-specific exceptions.
•	Long-term future work may move toward one universal CMS-driven page system, but the current priority is canonical scripture admin.
•	Canonical uniqueness is hierarchical/composite, not globally name-based: book > book_section > chapter > chapter_section > verse.
•	Do not redesign canonical routing, canonical hierarchy, or the schema boundary during this pass.
•	Do not flatten backend schema policy into generic frontend guesses.
3. Current public flow
•	Book list: scripture.books.index
•	Chapter list: scripture.books.show
•	Verse list: scripture.chapters.show
•	Verse detail: scripture.chapters.verses.show
The old extra gateway layer has already been removed. Do not bring back old chapter-section gateway pages or similar detours.
4. Current admin philosophy
•	Pages expose semantic facts.
•	Integrations normalize schema context.
•	Modules define qualification and actions.
•	Hosts resolve placement and render buttons/actions.
•	Button labels should not be page-hardcoded where avoidable.
•	Closed-state launchers should be compact and grouped; open editor forms may remain full-width.
5. Real schema truth for this task
The Verse support features must be derived from the actual tables and model relations, not from generic UI ideas.
Table / relation	Purpose	Fields / notes
verses	Canonical verse owner	Owns translations() and commentaries()
verse_translations	Verse-owned translation rows	source_key, source_name, translation_source_id, language_code, text, sort_order
translation_sources	Optional source linkage for translations	Must be respected in form design
verse_commentaries	Verse-owned commentary rows	source_key, source_name, commentary_source_id, author_name, language_code, title, body, sort_order
commentary_sources	Optional source linkage for commentaries	Must be respected in form design
6. What Codex did right
•	It used the real Verse relations and real tables instead of page-local fake abstractions.
•	It added backend request/controller flow for translations and commentaries.
•	It kept the Verse pages mostly thin.
•	It attached the features through semantic surfaces instead of page-authored add/edit buttons.
•	It introduced a shared contract family (relation_rows) for verse-owned row collections, which is acceptable internally.
7. What is wrong right now
1.	The editor copy is too developer-facing. It leaks table/row language into the user experience.
2.	Full edit for the new translation/commentary modules is not a real full-edit workflow. It links to the generic Verse full-edit page without opening a dedicated relation editor or deep-linking to the relevant section.
3.	The full-edit page still behaves like another launcher surface for these new modules, so the user lands there and still has to activate the module again.
4.	The current result is therefore schema-correct in wiring, but weak in UX contract.
8. Required correction for the current Verse relation modules
Do not throw away the new schema-based wiring. Correct it.
•	Keep the real-table, real-relation, surface-based architecture for verse_translations and verse_commentaries.
•	Rewrite the user-facing copy into editor-friendly language.
•	Remove or disable fake Full edit for translations/commentaries unless a real dedicated full-edit experience is implemented.
•	Do not leave decorative links that promise deeper editing but only navigate to another launcher page.
•	If real full edit is added later, it must either deep-link and auto-open the correct section or become a dedicated relation workspace.
9. User-friendly language rules
The UI may be schema-backed internally, but the editor-facing wording must remain human and product-friendly.
Avoid	Prefer
Manage verse-owned rows from verse_translations	Verse translations
Add translation row	Add translation
Edit commentary row	Edit commentary
Unlinked row	Not linked to a saved source yet
relation rows	Translations / Commentaries
schema field metadata	Available fields
10. Button and surface rules Codex must follow
•	Pages expose surfaces only.
•	Modules expose actions.
•	Hosts render buttons/actions.
•	Button labels should come from module/action metadata or shared semantic label helpers, not page files.
•	Do not hardcode Add Translation, Edit Commentary, Full edit, or similar labels in page shells.
•	Closed-state launchers remain compact, grouped, and high-contrast; open editor forms may remain larger.
•	If a module action is not real, do not render the button.
11. Surface and contract expectations for Verse support
•	Verse translations and commentaries should remain attached through the current semantic/module/action system.
•	If relation_rows is used internally, keep it internal and clean; do not leak that vocabulary into user copy.
•	If current Verse support surfaces are sufficient, reuse them.
•	If a new contract family is truly needed, make it generic and justify it in the report.
12. Detailed implementation guardrails for the next Codex pass
5.	Start by auditing the current translation/commentary modules and full-edit links before changing UI copy.
6.	Keep the backend table truth and route/controller wiring unless there is a real bug.
7.	Rewrite the editor copy to be user-friendly and product-facing.
8.	Remove or hide Full edit for relation modules unless a real full-edit experience is built in this pass.
9.	Do not solve the problem by hardcoding page labels or page-local buttons.
10.	Keep Verse pages thin and let AdminModuleHost or shared wrappers own activation.
11.	If shared relation editor infrastructure is extracted, keep schema differences explicit: translation fields are not the same as commentary fields.
12.	Clean up any in-scope dead glue left by the half-implemented full-edit path.
13. What Codex must not do
•	Do not redesign the CMS.
•	Do not redesign canonical routing.
•	Do not reintroduce old page-local admin hooks.
•	Do not flatten backend policy into frontend guesswork.
•	Do not build fake full-edit links again.
•	Do not expose raw table language directly to editors unless it is secondary diagnostic information.
•	Do not add page-fragile wrappers or duplicate launchers.
14. Recommended deliverable for the next fix pass
•	Keep stronger high-contrast compact buttons.
•	Keep current grouped launcher layout.
•	Keep schema-based translation and commentary modules.
•	Rewrite translations/commentaries into user-friendly editor copy.
•	Remove fake Full edit or make it real.
•	Preserve thin-page architecture.
•	Report exactly what copy changed, what full-edit behavior changed, and what dead glue was removed.
15. Codex handoff prompt
Use or adapt the following in the fresh Codex window:
We are continuing an existing Laravel + Inertia + React scripture platform. This is not a greenfield task.
Architecture rules
- Pages are render shells and must stay thin.
- Admin attaches through semantic surfaces.
- Modules qualify by semantic identity plus capabilities.
- Reusable editor behavior lives in resources/js/admin/modules.
- Semantic attachment specs/builders/contracts live in resources/js/admin/surfaces.
- Schema-family assembly lives in resources/js/admin/integrations.
- Runtime host/qualification lives in resources/js/admin/core.
- Do not reintroduce page-local admin hooks, bridge/session behavior, or page-fragile wrappers.
Current philosophy
- Pages expose surfaces.
- Modules expose actions.
- Hosts render buttons/actions.
- Button labels should not be page-hardcoded where avoidable.
- Closed-state launchers stay compact and grouped.
- Open editor forms may remain full-width.
Current public flow
- scripture.books.index
- scripture.books.show
- scripture.chapters.show
- scripture.chapters.verses.show
Schema truth for this pass
The relevant real tables are:
- verses
- verse_translations
- translation_sources
- verse_commentaries
- commentary_sources
Verse already owns:
- translations()
- commentaries()
The new translation/commentary work must stay schema-driven from these real tables and relations.
What Codex did right already
- Added schema-based Verse translation/commentary support.
- Kept Verse pages thin overall.
- Attached the features through semantic surfaces and module wiring instead of page-local buttons.
What is wrong right now
- The editor copy is too developer-facing and exposes row/table language.
- The new Full edit behavior is not real. It links to the generic Verse full-edit page without a true translation/commentary full-edit workflow.
- The full-edit page still behaves like another launcher page for these features, so the UX promise is misleading.
What to do now
1. Keep the current schema-based wiring for verse_translations and verse_commentaries.
2. Rewrite the translation/commentary UI copy into user-friendly editor language.
3. Remove or disable fake Full edit for these relation modules unless you implement a real dedicated full-edit experience in this pass.
4. Do not add hardcoded Add/Edit buttons in page shells.
5. Keep actions module-driven and surface-driven.
6. Keep pages thin.
7. Clean up any dead glue related to the half-implemented full-edit path.
User-facing language rule
Avoid developer wording like:
- verse-owned rows
- translation row
- commentary row
- unlinked row
- relation rows
Prefer editor-friendly wording like:
- Verse translations
- Add translation
- Edit commentary
- Not linked to a saved source yet
Important
If Full edit is not real, do not render it.
Report requirements
- what copy changed
- what full-edit behavior changed
- what remained schema-driven from real tables
- what dead glue was removed
- whether any limitations remain
16. Final note for Codex
The current wiring is not the main problem. The wording layer and the fake full-edit promise are. Fix those without undoing the good schema/surface/module work.
