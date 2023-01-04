import { spawn } from 'child_process';
import {
  Disposable,
  Event,
  FileChangeEvent,
  EventEmitter,
  FileStat,
  FileSystemProvider,
  FileType,
  Uri,
  workspace,
  window,
  languages,
} from 'vscode';
import getSection from '../utils/get-section';
import nameToURI from '../utils/name-to-uri';

export default class UnitFS implements FileSystemProvider {
  static scheme = 'nginx-unit';

  #emitter = new EventEmitter<FileChangeEvent[]>();
  onDidChangeFile: Event<FileChangeEvent[]> = this.#emitter.event;

  stat(): FileStat {
    return {
      type: FileType.File,
      ctime: Date.now(),
      mtime: Date.now(),
      size: 0,
    };
  }

  getConnection(uri: Uri): ConfigConnection {
    const config = workspace.getConfiguration('nginx-unit');
    const connections = config.get('connections') as ConfigConnection[];
    const connection = connections.find(
      (item) => nameToURI(item.name, 'config').toString() === uri.toString()
    );

    if (!connection) {
      const msg = "Connection's settings not found";

      window.showErrorMessage(msg);

      throw new Error(msg);
    }

    return connection;
  }

  async readFile(uri: Uri): Promise<Uint8Array> {
    const content = await this.requestToUnit(uri, ['-X', 'GET']);

    return new TextEncoder().encode(content);
  }

  async writeFile(uri: Uri, content: Uint8Array): Promise<void> {
    const str = new TextDecoder().decode(content);

    await this.requestToUnit(uri, ['-X', 'PUT', '-d', str]);
  }

  async requestToUnit(uri: Uri, curlArgs: string[]): Promise<string> {
    const connection = this.getConnection(uri);
    const section = getSection(uri);
    const spawnOptions = {
      encoding: 'utf8',
      timeout: 1000 * 60 * 1, // 1 minute
    };
    const args = [
      `http://localhost/${section}/`,
      '--silent',
      ...connection.params,
      ...curlArgs,
    ];

    return new Promise((resolve) => {
      const curl = spawn('curl', args, spawnOptions);

      curl.stdout.on('data', (data) => {
        resolve(data);
      });

      curl.stderr.on('data', (x) => {
        throw new Error(`curl error - ${x}`);
      });

      curl.on('exit', (code) => {
        if (code !== 0) {
          throw new Error(`curl process has exited with code ${code}`);
        }
      });
    });
  }

  watch(): Disposable {
    throw new Error('Method watch not implemented.');
  }

  readDirectory(): [string, FileType][] | Thenable<[string, FileType][]> {
    throw new Error('Method readDirectory not implemented.');
  }

  createDirectory(): void | Thenable<void> {
    throw new Error('Method createDirectory not implemented.');
  }

  delete(): void | Thenable<void> {
    throw new Error('Method delete not implemented.');
  }

  rename(): void | Thenable<void> {
    throw new Error('Method rename not implemented.');
  }
}
