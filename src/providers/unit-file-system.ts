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

export class UnitFS implements FileSystemProvider {
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
    const content = await this.connectToUnit(uri);

    return new TextEncoder().encode(content);
  }

  writeFile(
    uri: Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean }
  ): void | Thenable<void> {
    throw new Error('Method writeFile not implemented.');
  }

  async connectToUnit(uri: Uri): Promise<string> {
    const spawnOptions = {
      encoding: 'utf8',
      timeout: 1000 * 60 * 1, // 1 minute
    };
    const args = [
      '--silent',
      '--unix-socket',
      '/var/run/control.unit.sock',
      'http://localhost/config/',
    ];

    return new Promise((resolve, reject) => {
      // TODO: add abort signal
      const curl = spawn('curl', args, spawnOptions);

      curl.stdout.on('data', (data) => {
        resolve(data);
      });

      curl.stderr.on('data', (x) => {
        reject(x.toString());
      });

      curl.on('exit', (code) => {
        if (code !== 0) {
          reject(code);
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
