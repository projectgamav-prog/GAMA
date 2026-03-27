import { useCallback, useEffect, useRef, useState } from 'react';

export type ScriptureAdminFeedbackTone = 'success';

export type ScriptureAdminFeedbackEntry = {
    label: string;
    tone: ScriptureAdminFeedbackTone;
};

/**
 * Small shared feedback store for page-local admin trust cues.
 *
 * Editors save, create, reorder, duplicate, or delete in a specific region or
 * block. The relevant session hook then posts a short-lived badge to the exact
 * surface that should acknowledge the change.
 */
export function useScriptureAdminFeedback(durationMs = 2400) {
    const [feedbackByKey, setFeedbackByKey] = useState<
        Record<string, ScriptureAdminFeedbackEntry>
    >({});
    const timeoutIdsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
        {},
    );

    const clearFeedback = useCallback((key: string) => {
        const timeoutId = timeoutIdsRef.current[key];

        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
            delete timeoutIdsRef.current[key];
        }

        setFeedbackByKey((current) => {
            if (!(key in current)) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    }, []);

    const showFeedback = useCallback(
        (
            key: string,
            label: string,
            tone: ScriptureAdminFeedbackTone = 'success',
        ) => {
            const timeoutId = timeoutIdsRef.current[key];

            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }

            setFeedbackByKey((current) => ({
                ...current,
                [key]: {
                    label,
                    tone,
                },
            }));

            timeoutIdsRef.current[key] = setTimeout(() => {
                setFeedbackByKey((current) => {
                    if (!(key in current)) {
                        return current;
                    }

                    const next = { ...current };
                    delete next[key];

                    return next;
                });

                delete timeoutIdsRef.current[key];
            }, durationMs);
        },
        [durationMs],
    );

    const feedbackFor = useCallback(
        (key: string): ScriptureAdminFeedbackEntry | null =>
            feedbackByKey[key] ?? null,
        [feedbackByKey],
    );

    useEffect(() => {
        return () => {
            Object.values(timeoutIdsRef.current).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
        };
    }, []);

    return {
        feedbackFor,
        showFeedback,
        clearFeedback,
    };
}
