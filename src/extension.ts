import {
  ExtensionContext,
  Disposable,
  workspace,
  languages,
  commands,
  window,
} from 'vscode';
import UnitFS from './providers/unit-file-system';
import { URI } from 'vscode-uri';
import nameToURI from './utils/name-to-uri';

export function activate(context: ExtensionContext) {
  const unitFS = new UnitFS();

  const providerRegistrations = Disposable.from(
    workspace.registerFileSystemProvider(UnitFS.scheme, unitFS)
  );

  const commandRegistration = commands.registerCommand(
    'nginx-unit.open-config',
    async () => {
      const config = workspace.getConfiguration('nginx-unit');
      const connections = config.get('connections') as ConfigConnection[];
      let connection;

      if (connections.length === 1) {
        connection = connections[0];
      } else {
        const value = await window.showQuickPick(
          connections.map((item) => item.name),
          {
            placeHolder: 'Select the connection to Nginx Unit',
          }
        );

        connection = connections.find((item) => item.name === value);

        if (!connection) {
          return;
        }
      }

      const doc = await workspace.openTextDocument(
        nameToURI(connection.name, 'config')
      );
      languages.setTextDocumentLanguage(doc, 'json');
      window.showTextDocument(doc, { preview: false });
    }
  );

  context.subscriptions.push(
    // unitFS,
    providerRegistrations,
    commandRegistration
  );
}
