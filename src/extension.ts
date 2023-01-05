import {
  ExtensionContext,
  Disposable,
  workspace,
  languages,
  commands,
  window,
  Uri,
} from 'vscode';
import UnitFS from './providers/unit-file-system';

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
    commands.registerCommand(
      'nginx-unit.open.config',
      readPath.bind(null, 'config')
    ),
    commands.registerCommand(
      'nginx-unit.open.certificates',
      readPath.bind(null, 'certificates')
    ),
    commands.registerCommand(
      'nginx-unit.open.status',
      readPath.bind(null, 'status')
    )
  );

  context.subscriptions.push(
    providerRegistrations,
    eventRegistrations,
    commandRegistrations
  );
}

async function readPath(path: string) {
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

  const uri = Uri.parse(`${UnitFS.scheme}://${connection.name}/${path}`);
  const doc = await workspace.openTextDocument(uri);

  window.showTextDocument(doc, { preview: false });
}
