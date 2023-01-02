import {
  ExtensionContext,
  Disposable,
  workspace,
  languages,
  commands,
  window,
} from 'vscode';
import { UnitFS } from './providers/unit-file-system';
import { URI } from 'vscode-uri';

export function activate(context: ExtensionContext) {
  const unitFS = new UnitFS();

  const providerRegistrations = Disposable.from(
    workspace.registerFileSystemProvider('unitfs', unitFS)
  );

  const commandRegistration = commands.registerCommand(
    'nginx-unit.open-config',
    async () => {
      const doc = await workspace.openTextDocument(URI.parse('unitfs:/config'));

      languages.setTextDocumentLanguage(doc, 'json');
      window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(
    // unitFS,
    providerRegistrations,
    commandRegistration
  );
}
