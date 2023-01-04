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

const unitSections = ['config', 'certificates', 'status'];

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
            placeHolder: 'Select the connection',
          }
        );

        connection = connections.find((item) => item.name === value);

        if (!connection) {
          return;
        }
      }

      const section = await window.showQuickPick(unitSections, {
        placeHolder: 'Select the section of Nginx Unit',
      });

      if (!section) {
        return;
      }

      const doc = await workspace.openTextDocument(
        nameToURI(connection.name, section)
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
