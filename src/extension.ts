import {
  ExtensionContext,
  Disposable,
  workspace,
  languages,
  commands,
  Uri,
  window,
} from 'vscode';
import UnitProvider from './providers/unit';

export function activate(context: ExtensionContext) {
  const provider = new UnitProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(UnitProvider.scheme, provider)
    // languages.registerDocumentLinkProvider({ scheme: UnitProvider.scheme }, provider)
  );

  const commandRegistration = commands.registerCommand(
    'nginx-unit.open-config',
    async () => {
      const uri = Uri.parse(`${UnitProvider.scheme}:config`);
      const doc = await workspace.openTextDocument(uri);

      await window.showTextDocument(doc, { preview: false });
    }
  );

  context.subscriptions.push(
    provider,
    providerRegistrations,
    commandRegistration
  );
}
