import { Uri } from 'vscode';

export default function getSection(uri: Uri): string | undefined {
  if (typeof uri.path === 'string') {
    return uri.path.split('/').pop();
  }

  return undefined;
}
