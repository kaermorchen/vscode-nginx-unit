# VSCode Nginx Unit

This VSCode extension allows you to open and edit NGINX Unit config.

For edit Unit config open Command Palette (Ctrl+Shift+P) and write command `Open Nginx Unit config`. By default the extension uses default Nginx Unit unix socket params, but you can overwrite it in the extension settings or create a new connection. The extension uses `curl` under the hood and all connection params are curl arguments.
