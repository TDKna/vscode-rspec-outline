import * as vscode from 'vscode';
import { RspecDocumentSymbolProvider } from './rspecDocumentSymbolProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			{
				language: 'ruby',
				scheme: 'file',
				pattern: "**/*_spec.rb"
			},
			new RspecDocumentSymbolProvider()
		)
	);
}

export function deactivate() { }
