import { Uri, window, workspace } from 'vscode';
import getSection from './get-section';
import nameToURI from './name-to-uri';

export default function getConnection(uri: Uri): ConfigConnection {
  const config = workspace.getConfiguration('nginx-unit');
  const connections = config.get('connections') as ConfigConnection[];
  const section = getSection(uri);
  const connection = connections.find(
    (item) => nameToURI(item.name, section).toString() === uri.toString()
  );

  if (!connection) {
    const msg = "Connection's settings not found";
    window.showErrorMessage(msg);
    throw new Error(msg);
  }

  return connection;
}
