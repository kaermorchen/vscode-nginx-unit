import UnitFS from '../providers/unit-file-system';
import { URI, Utils } from 'vscode-uri';

export default function nameToURI(name: string, suffix?: string): URI {
  let uri = URI.parse(`${UnitFS.scheme}:/${name}`);

  if (suffix) {
    uri = Utils.joinPath(uri, suffix);
  }

  return uri;
}
