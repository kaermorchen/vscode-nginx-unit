# VSCode Nginx Unit

This VSCode extension allows you to open and edit NGINX Unit config.

For edit Unit config open Command Palette (Ctrl+Shift+P) and write command `Nginx Unit: Open Config`. By default the extension uses default Nginx Unit unix socket params, but you can overwrite it in the extension settings or create a new connection. The extension uses `curl` under the hood and all connection params are curl arguments.

![demo](https://user-images.githubusercontent.com/11972062/210787099-1a5840a4-bf1c-495d-9213-9b4be8e0580a.gif)
