import {
  ExtensionContext,
  Disposable,
  workspace,
  languages,
  commands,
  window,
} from 'vscode';
import UnitFS from './providers/unit-file-system';
import nameToURI from './utils/name-to-uri';

export function activate(context: ExtensionContext) {
  const unitFS = new UnitFS();

  const providerRegistrations = Disposable.from(
    workspace.registerFileSystemProvider(UnitFS.scheme, unitFS)
  );

  const eventRegistrations = Disposable.from(
    workspace.onDidOpenTextDocument((doc) => {
      if (doc.uri.scheme === UnitFS.scheme) {
        languages.setTextDocumentLanguage(doc, 'json');
      }
    })
  );

  const commandRegistrations = Disposable.from(
    commands.registerCommand('nginx-unit.open-config', async () => {
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

      window.showTextDocument(doc, { preview: false });
    })
  );

  context.subscriptions.push(
    // unitFS,
    providerRegistrations,
    eventRegistrations,
    commandRegistrations
  );
}
