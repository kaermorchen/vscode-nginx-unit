import { spawn } from 'child_process';
import {
  Uri,
  EventEmitter,
  TextDocumentContentProvider,
  window,
  Disposable,
  workspace,
} from 'vscode';

export default class UnitProvider implements TextDocumentContentProvider {
  static scheme = 'nginx-unit';

  config: unknown;

  #onDidChange = new EventEmitter<Uri>();
  // #documents = new Map<string, ReferencesDocument>();
  // #editorDecoration = window.createTextEditorDecorationType({
  //   textDecoration: 'underline',
  // });
  // #subscriptions: Disposable;

  constructor() {
    // this.#subscriptions = workspace.onDidCloseTextDocument((doc) =>
    //   this.#documents.delete(doc.uri.toString())
    // );
  }

  dispose() {
    // this.#subscriptions.dispose();
    // this.#documents.clear();
    // this.#editorDecoration.dispose();
    this.#onDidChange.dispose();
  }

  get onDidChange() {
    return this.#onDidChange.event;
  }

  async provideTextDocumentContent(uri: Uri): Promise<string> {
    try {
      await this.connectToUnit();
    } catch (error) {
      console.error(error);
    }

    const text = JSON.stringify(this.config, null, 2);

    return text;
  }

  async connectToUnit() {
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
        const config = JSON.parse(data);

        this.config = config;
        resolve(0);
      });

      curl.stderr.on('data', (x) => {
        reject(x.toString());
      });

      curl.on('exit', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(code);
        }
      });
    });
  }
}
