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

  provideTextDocumentContent(uri: Uri): string {
    return 'Hello' + uri.path;
  }
}
