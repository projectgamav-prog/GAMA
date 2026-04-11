import { Fragment, type ReactNode } from 'react';
import type { RichTextBodyBlock } from './types';

export function parseRichTextDocument(source: string): RichTextBodyBlock[] {
    const normalized = source.replace(/\r\n/g, '\n').trim();

    if (normalized === '') {
        return [];
    }

    const chunks = normalized
        .split(/\n\s*\n/)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk !== '');

    return chunks.flatMap((chunk): RichTextBodyBlock[] => {
        const lines = chunk
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '');

        if (lines.length === 0) {
            return [];
        }

        if (lines.every((line) => line.startsWith('- ') || line.startsWith('* '))) {
            const items = lines
                .map((line) => line.replace(/^[-*]\s+/, '').trim())
                .filter((line) => line !== '');

            return items.length > 0 ? [{ type: 'list', items }] : [];
        }

        if (lines.every((line) => line.startsWith('> '))) {
            return [
                {
                    type: 'quote',
                    text: lines.map((line) => line.replace(/^>\s+/, '')).join(' '),
                },
            ];
        }

        if (lines[0].startsWith('### ')) {
            return [
                {
                    type: 'heading',
                    level: 3,
                    text: lines
                        .map((line, index) =>
                            index === 0 ? line.replace(/^###\s+/, '') : line,
                        )
                        .join(' ')
                        .trim(),
                },
            ];
        }

        if (lines[0].startsWith('## ')) {
            return [
                {
                    type: 'heading',
                    level: 2,
                    text: lines
                        .map((line, index) =>
                            index === 0 ? line.replace(/^##\s+/, '') : line,
                        )
                        .join(' ')
                        .trim(),
                },
            ];
        }

        return [{ type: 'paragraph', text: lines.join(' ') }];
    });
}

export function htmlToRichTextDocumentSource(html: string): string {
    const trimmed = html.trim();

    if (trimmed === '') {
        return '';
    }

    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const document = parser.parseFromString(trimmed, 'text/html');
        const blocks: string[] = [];

        document.body.childNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
                return;
            }

            const text = node.textContent?.trim() ?? '';

            if (text === '') {
                return;
            }

            if (node.tagName === 'H2') {
                blocks.push(`## ${text}`);
                return;
            }

            if (node.tagName === 'H3') {
                blocks.push(`### ${text}`);
                return;
            }

            if (node.tagName === 'BLOCKQUOTE') {
                blocks.push(
                    text
                        .split('\n')
                        .map((line) => `> ${line.trim()}`)
                        .join('\n'),
                );
                return;
            }

            if (node.tagName === 'UL' || node.tagName === 'OL') {
                const items = Array.from(node.querySelectorAll('li'))
                    .map((item) => item.textContent?.trim() ?? '')
                    .filter((item) => item !== '');

                if (items.length > 0) {
                    blocks.push(items.map((item) => `- ${item}`).join('\n'));
                }

                return;
            }

            blocks.push(text);
        });

        return blocks.join('\n\n').trim();
    }

    return trimmed
        .replace(/<\/(p|div|section|article|h2|h3|blockquote)>/gi, '\n\n')
        .replace(/<li>/gi, '\n- ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function renderRichTextInline(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let buffer = '';
    let key = 0;
    let index = 0;

    const flush = () => {
        if (buffer !== '') {
            nodes.push(<Fragment key={`text-${key++}`}>{buffer}</Fragment>);
            buffer = '';
        }
    };

    while (index < text.length) {
        if (text.startsWith('**', index)) {
            const closingIndex = text.indexOf('**', index + 2);

            if (closingIndex > index + 2) {
                flush();
                nodes.push(
                    <strong key={`strong-${key++}`}>
                        {text.slice(index + 2, closingIndex)}
                    </strong>,
                );
                index = closingIndex + 2;
                continue;
            }
        }

        if (text[index] === '*') {
            const closingIndex = text.indexOf('*', index + 1);

            if (closingIndex > index + 1) {
                flush();
                nodes.push(
                    <em key={`em-${key++}`}>{text.slice(index + 1, closingIndex)}</em>,
                );
                index = closingIndex + 1;
                continue;
            }
        }

        buffer += text[index];
        index += 1;
    }

    flush();

    return nodes;
}
