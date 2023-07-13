import * as vscode from 'vscode';

const blockName2SymbolKind: {[blockName: string]: vscode.SymbolKind} = {
	'describe': vscode.SymbolKind.Namespace,
	'context': vscode.SymbolKind.Event,
	'include_context': vscode.SymbolKind.Event,
	'include_examples': vscode.SymbolKind.Event,
	'it': vscode.SymbolKind.Method,
	'it_behaves_like': vscode.SymbolKind.Method,
	'shared_examples': vscode.SymbolKind.Module,
	'shared_examples_for': vscode.SymbolKind.Module,
	'shared_context': vscode.SymbolKind.Module,
};

export class RspecDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
		return new Promise((resolve, reject) => {
			const outline = this.buildOutline(document);
			resolve(outline);
		});
	}

	private buildOutline(document: vscode.TextDocument): vscode.DocumentSymbol[] {
		const allSymbols: vscode.DocumentSymbol[] = [];
		const symbols1Depth: vscode.DocumentSymbol[] = [];

		const blockGroup = Object.keys(blockName2SymbolKind).join('|');
		const blockRegex = new RegExp(`^(\\s*)(${blockGroup}) \'(.+)\'(?:\\s*(do|\\\\))?`);
		const multiLineNameRegex = /^(\s*)\'(.*)\'(?:\s*(do|\\))?/;

		const displayBlockNameLabel = vscode.workspace.getConfiguration('vscode-rspec-outline').get('displayBlockNameOnLabel', false);

		for (let i = 0; i < document.lineCount; i++) {
			let line = document.lineAt(i).text;
			let match = line.match(blockRegex);

			if (!match) {
				continue;
			}

			const blockName = match[2];
			const kind = blockName2SymbolKind[blockName];
			if (kind === undefined) {
				continue;
			}

			const indent = match[1].length;
			let text = match[3];
			let multiLineElement = match[4] || '';

			const blockStart = new vscode.Position(i, indent);
			let blockEnd = new vscode.Position(blockStart.line, line.length);
			let blockAreaEnd = new vscode.Position(i, line.length);

			if (multiLineElement == '\\') {
				while (++i < document.lineCount) {
					line = document.lineAt(i).text;
					match = line.match(multiLineNameRegex);

					if (!match) {
						i--;
						break;
					}

					text += (match[2] || '');

					multiLineElement = match[3];
					blockEnd = new vscode.Position(i, line.length);
					blockAreaEnd = new vscode.Position(i, line.length);

					if (multiLineElement != '\\') {
						break;
					}
				}
			}
			if (multiLineElement == 'do') {
				blockAreaEnd = this.findBlockAreaEnd(document, blockStart, blockEnd);
			}

			const name = displayBlockNameLabel ? blockName + ' ' + text : text;
			const desc = displayBlockNameLabel ? '' : blockName;

			const blockAreaRange = new vscode.Range(blockStart, blockAreaEnd);
			const blockRange = new vscode.Range(blockStart, blockEnd);
			const symbol = new vscode.DocumentSymbol(name, desc, kind, blockAreaRange, blockRange);

			const parentSymbol = this.findParentSymbol(symbol, allSymbols);
			if (parentSymbol !== null) {
				parentSymbol.children.push(symbol);
			} else {
				symbols1Depth.push(symbol);
			}

			allSymbols.push(symbol);
		}

		return symbols1Depth;
	}

	private findBlockAreaEnd(document: vscode.TextDocument, blockStart: vscode.Position, blockEnd: vscode.Position): vscode.Position {
		const indentRegex = /(\s*)(.+)/;

		for (let i = blockEnd.line + 1; i < document.lineCount; i++) {
			const line = document.lineAt(i).text;
			const match = line.match(indentRegex);
			if (!match) {
				continue;
			}

			const currentIndent = match[1].length;
			if (currentIndent == blockStart.character) {
				return new vscode.Position(i, line.length);
			}
			if (currentIndent < blockStart.character) {
				return new vscode.Position(i - 1, document.lineAt(i - 1).range.end.character);
			}
		}
		return document.lineAt(blockStart.line).range.end;
	}

	private findParentSymbol(currentSymbol: vscode.DocumentSymbol, allSymbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol | null {
		for (let i = allSymbols.length - 1; i >= 0; i--) {
			const parentSymbol = allSymbols[i];
			if (parentSymbol.selectionRange.start.character < currentSymbol.selectionRange.start.character) {
				return parentSymbol;
			}
		}
		return null;
	}
}
