function sortByOrder(records = []) {
    return [...records].sort((left, right) => left.sort_order - right.sort_order);
}

export function createExplanationsQueryApi(database) {
    const {
        explanationDocuments,
        explanationBlocks,
        indexes,
    } = database;

    function listExplanationDocuments() {
        return explanationDocuments;
    }

    function getExplanationDocumentById(documentId) {
        return indexes.documentsById[documentId] || null;
    }

    function getExplanationDocumentForTarget(targetType, targetId, { includeDraft = false } = {}) {
        const document = indexes.documentByTargetKey[`${targetType}:${targetId}`] || null;
        if (!document) {
            return null;
        }

        if (document.status === "published" || includeDraft) {
            return document;
        }

        return null;
    }

    function listExplanationBlocks(documentId, { includeHidden = false } = {}) {
        const blocks = indexes.blocksByExplanationId[documentId] || [];
        const visibleBlocks = includeHidden ? blocks : blocks.filter((block) => block.is_visible);
        return sortByOrder(visibleBlocks);
    }

    function getExplanationContentForTarget(
        targetType,
        targetId,
        {
            includeDraft = false,
            includeHidden = false,
        } = {}
    ) {
        const document = getExplanationDocumentForTarget(targetType, targetId, { includeDraft });
        return Object.freeze({
            document,
            blocks: document ? listExplanationBlocks(document.id, { includeHidden }) : Object.freeze([]),
        });
    }

    function getVerseExplanationContent(verseId, options = {}) {
        return getExplanationContentForTarget("verse", verseId, options);
    }

    function listAllExplanationBlocks() {
        return explanationBlocks;
    }

    return Object.freeze({
        listExplanationDocuments,
        getExplanationDocumentById,
        getExplanationDocumentForTarget,
        getExplanationContentForTarget,
        getVerseExplanationContent,
        listExplanationBlocks,
        listAllExplanationBlocks,
        explanationDocuments,
        explanationBlocks,
    });
}
