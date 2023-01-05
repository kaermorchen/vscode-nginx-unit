import { Uri, window, workspace } from 'vscode';

export default function getConnection(uri: Uri): ConfigConnection {
  const config = workspace.getConfiguration('nginx-unit');
  const connections = config.get('connections') as ConfigConnection[];
  const name = uri.authority;
  const connection = connections.find((item) => item.name === name);

  if (!connection) {
    const msg = "Connection's settings not found";
    window.showErrorMessage(msg);
    throw new Error(msg);
  }

  return connection;
}
