import * as vscode from 'vscode';

const blockType2SymbolKind: {[blockType: string]: vscode.SymbolKind} = {
	'describe': vscode.SymbolKind.Namespace,
	'context': vscode.SymbolKind.Event,
	'include_context': vscode.SymbolKind.Event,
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

		const blockGroup = Object.keys(blockType2SymbolKind).join('|');
		const blockRegex = new RegExp(`^(\\s*)(${blockGroup}) \'(.+)\'`);

		const hideBlockNameLabel = vscode.workspace.getConfiguration('vscode-rspec-outline').get('hideBlockNameLabel', false);

		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i).text;
			const match = line.match(blockRegex);

			if (!match) {
				continue;
			}

			const type = match[2];
			if (blockType2SymbolKind[type] === undefined) {
				continue;
			}

			const text = match[3];
			const kind = blockType2SymbolKind[type];
			if (kind === undefined) {
				continue;
			}

			let name = type + ' ' + text;
			let desc = ' '
			if (hideBlockNameLabel) {
				desc = name;
				name = text;
			}

			const indent = match[1].length;
			const range = new vscode.Range(i, indent, i, line.length);
			const symbol = new vscode.DocumentSymbol(name, ' ', kind, range, range);

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

	private findParentSymbol(currentSymbol: vscode.DocumentSymbol, allSymbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol | null {
		for (let i = allSymbols.length - 1; i >= 0; i--) {
			const parentSymbol = allSymbols[i];
			if (parentSymbol.range.start.character < currentSymbol.range.start.character) {
				return parentSymbol;
			}
		}
		return null;
	}
}
