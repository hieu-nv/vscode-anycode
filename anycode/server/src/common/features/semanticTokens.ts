/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as lsp from 'vscode-languageserver';
import { DocumentStore } from '../documentStore';
import { Trees } from '../trees';
import Languages from '../languages';

export class SemanticTokensProvider {

    static readonly tokenTypes = [
        'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
        'type', 'struct', 'class', 'interface', 'enum', 'typeParameter',
        'function', 'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
    ];

    static readonly tokenModifiers = [
        'declaration', 'definition', 'readonly', 'static', 'deprecated', 'abstract', 'async', 'modification', 'documentation', 'defaultLibrary'
    ];

    private readonly _legend: lsp.SemanticTokensLegend;

    constructor(
        private readonly _documents: DocumentStore,
        private readonly _trees: Trees,
    ) {
        this._legend = {
            tokenTypes: SemanticTokensProvider.tokenTypes,
            tokenModifiers: SemanticTokensProvider.tokenModifiers
        };
    }

    register(connection: lsp.Connection) {
        connection.client.register(lsp.SemanticTokensRegistrationType.type, {
            documentSelector: Languages.getSupportedLanguages('syntaxHighlights', ['highlights']),
            legend: this._legend,
            full: true,
            range: true
        });
        connection.onRequest(lsp.SemanticTokensRequest.type, this.provideSemanticTokens.bind(this));
        connection.onRequest(lsp.SemanticTokensRangeRequest.type, this.provideSemanticTokensRange.bind(this));
    }

    async provideSemanticTokens(params: lsp.SemanticTokensParams): Promise<lsp.SemanticTokens> {
        const document = await this._documents.retrieve(params.textDocument.uri);
        const tree = await this._trees.getParseTree(document);
        if (!tree) {
            return { data: [] };
        }

        return {
            data: this._encodeTokens(tree, document)
        };
    }

    async provideSemanticTokensRange(params: lsp.SemanticTokensRangeParams): Promise<lsp.SemanticTokens> {
        const document = await this._documents.retrieve(params.textDocument.uri);
        const tree = await this._trees.getParseTree(document);
        if (!tree) {
            return { data: [] };
        }

        return {
            data: this._encodeTokens(tree, document, params.range)
        };
    }

    private _encodeTokens(tree: any, document: lsp.TextDocument, range?: lsp.Range): number[] {
        const query = Languages.getQuery(tree.getLanguage(), 'highlights');
        const captures = query.captures(
            tree.rootNode,
            range ? { row: range.start.line, column: range.start.character } : undefined,
            range ? { row: range.end.line, column: range.end.character } : undefined
        );

        // sort captures by start position, then by length (longest first)
        captures.sort((a, b) => {
            if (a.node.startIndex !== b.node.startIndex) {
                return a.node.startIndex - b.node.startIndex;
            }
            return b.node.endIndex - a.node.endIndex;
        });

        const result: number[] = [];
        let lastLine = 0;
        let lastChar = 0;

        for (let i = 0; i < captures.length; i++) {
            const capture = captures[i];
            const node = capture.node;

            // skip overlapping tokens (if a token starts before the previous one ends)
            if (i > 0 && node.startIndex < captures[i - 1].node.endIndex) {
                continue;
            }

            const typeIndex = SemanticTokensProvider.tokenTypes.indexOf(capture.name);
            if (typeIndex === -1) {
                continue;
            }

            const start = node.startPosition;
            const end = node.endPosition;
            const text = node.text;
            const lines = text.split('\n');

            for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                const line = start.row + lineIdx;
                const lineText = lines[lineIdx];
                const length = lineText.length;

                if (length > 0) {
                    const deltaLine = line - lastLine;
                    const deltaChar = deltaLine === 0 ? (lineIdx === 0 ? start.column - lastChar : 0) : (lineIdx === 0 ? start.column : 0);

                    result.push(
                        deltaLine,
                        deltaChar,
                        length,
                        typeIndex,
                        0
                    );

                    lastLine = line;
                    lastChar = lineIdx === 0 ? start.column : 0;
                }
            }
        }

        return result;
    }
}
