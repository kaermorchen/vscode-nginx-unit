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
} from 'vscode';
import getConnection from '../utils/get-connection';
import getSection from '../utils/get-section';

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

  async readFile(uri: Uri): Promise<Uint8Array> {
    const content = await this.requestToUnit(uri, ['-X', 'GET']);

    return new TextEncoder().encode(content);
  }

  async writeFile(uri: Uri, content: Uint8Array): Promise<void> {
    const str = new TextDecoder().decode(content);

    return this.requestToUnit(uri, ['-X', 'PUT', '-d', str]).then(() =>
      Promise.resolve()
    );
  }

  async requestToUnit(uri: Uri, curlArgs: string[]): Promise<string> {
    const connection = getConnection(uri);
    const section = getSection(uri);
    const spawnOptions = {
      encoding: 'utf8',
      timeout: 1000 * 60 * 1, // 1 minute
    };
    const args = [
      `http://localhost/${section}/`,
      '--silent',
      '--no-buffer',
      ...connection.params,
      ...curlArgs,
    ];

    return new Promise((resolve, reject) => {
      const curl = spawn('curl', args, spawnOptions);

      curl.stdout.on('data', (data) => {
        const result = JSON.parse(data.toString());

        if (result.error) {
          reject(new Error(`${result.error} ${result.detail}`));
        } else {
          resolve(data);
        }
      });

      curl.stderr.on('data', (x) => {
        reject(new Error(`curl error - ${x}`));
      });

      curl.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`The curl process has exited with a code ${code}`));
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
