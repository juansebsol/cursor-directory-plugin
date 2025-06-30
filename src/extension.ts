// extension.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let userPromptFilePath: string | undefined;

export function activate(context: vscode.ExtensionContext) {
  const configKey = 'promptDictionary.promptFilePath';
  userPromptFilePath = context.globalState.get<string>(configKey);

  async function selectPromptDirectory() {
    const uri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: 'Select prompt directory'
    });

    if (uri && uri.length > 0) {
      const folderPath = uri[0].fsPath;
      userPromptFilePath = path.join(folderPath, 'prompts.json');

      // Save this path globally
      await context.globalState.update(configKey, userPromptFilePath);

      // If the file doesn't exist, create it with sample prompts
      if (!fs.existsSync(userPromptFilePath)) {
        const samplePrompts = [
          {
            title: "Explain Code",
            prompt: "Can you explain this code in simple terms?"
          },
          {
            title: "Refactor",
            prompt: "Can you optimize this code for readability and performance?"
          }
        ];
        fs.writeFileSync(userPromptFilePath, JSON.stringify(samplePrompts, null, 2), 'utf-8');
        vscode.window.showInformationMessage('Sample prompts.json created in selected folder.');
      }
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('promptDictionary.changePromptFolder', async () => {
      await selectPromptDirectory();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promptDictionary.openSidebar', async () => {
      if (!userPromptFilePath) {
        await selectPromptDirectory();
        if (!userPromptFilePath) return;
      }

      const panel = vscode.window.createWebviewPanel(
        'promptDictionarySidebar',
        'Prompt Dictionary',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      let prompts = [];
      try {
        const data = fs.readFileSync(userPromptFilePath, 'utf8');
        prompts = JSON.parse(data);
      } catch (err) {
        vscode.window.showErrorMessage('Failed to load prompts.json');
      }

      const promptHtml = prompts.map((p: any) => `
        <div class="prompt">
          <h3>${p.title}</h3>
          <button onclick="copyPrompt(\`${p.prompt}\`)">Insert</button>
        </div>
      `).join('');

      panel.webview.html = `
        <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 1em; }
            .prompt { border-bottom: 1px solid #ddd; margin-bottom: 1em; }
            .topbar { display: flex; justify-content: space-between; align-items: center; }
            .gear { cursor: pointer; font-size: 16px; }
            button {
              margin-top: 0.5em;
              background: #007acc;
              color: white;
              border: none;
              padding: 0.5em 1em;
              border-radius: 4px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="topbar">
            <h2>Prompt Dictionary</h2>
            <span class="gear" onclick="changePromptFolder()">⚙️</span>
          </div>
          ${promptHtml}
          <script>
            const vscode = acquireVsCodeApi();
            function copyPrompt(text) {
              vscode.postMessage({ command: 'insertPrompt', text });
            }
            function changePromptFolder() {
              vscode.postMessage({ command: 'changePromptFolder' });
            }
          </script>
        </body>
        </html>
      `;

      panel.webview.onDidReceiveMessage(
        async message => {
          if (message.command === 'insertPrompt') {
            vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('Prompt copied! Paste in Cursor chat.');
          } else if (message.command === 'changePromptFolder') {
            await selectPromptDirectory();
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promptDictionary.insertFromList', async () => {
      if (!userPromptFilePath) {
        await selectPromptDirectory();
        if (!userPromptFilePath) return;
      }

      let prompts = [];
      try {
        const data = fs.readFileSync(userPromptFilePath, 'utf8');
        prompts = JSON.parse(data);
      } catch (err) {
        vscode.window.showErrorMessage('Failed to load prompts.json');
      }

      type PromptPick = vscode.QuickPickItem & { value: string };

      const items: PromptPick[] = prompts.map((p: any) => ({
        label: p.title,
        detail: p.prompt,
        value: p.prompt
      }));

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Choose a prompt',
        matchOnDetail: true
      });

      if (picked) {
        vscode.env.clipboard.writeText(picked.value);
        vscode.window.showInformationMessage('Prompt copied to clipboard. Paste it in Cursor.');
      }
    })
  );
}

export function deactivate() {}
