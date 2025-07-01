import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let userPromptFilePath: string | undefined;

export async function activate(context: vscode.ExtensionContext) {
  const configKey = 'promptDictionary.promptFilePath';
  userPromptFilePath = context.globalState.get<string>(configKey);

  async function selectPromptDirectory(): Promise<void> {
    const uri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: 'Select prompt directory'
    });

    if (uri && uri.length > 0) {
      const folderPath = uri[0].fsPath;
      userPromptFilePath = path.join(folderPath, 'prompts.json');
      await context.globalState.update(configKey, userPromptFilePath);

      if (!fs.existsSync(userPromptFilePath)) {
        const samplePrompts = [
          { title: "Explain Code", prompt: "Can you explain this code in simple terms?" },
          { title: "Refactor", prompt: "Can you optimize this code for readability and performance?" }
        ];
        fs.writeFileSync(userPromptFilePath, JSON.stringify(samplePrompts, null, 2), 'utf-8');
        vscode.window.showInformationMessage('Sample prompts.json created!');
      }
    }
  }

  const openPromptPanel = async () => {
    if (!userPromptFilePath || !fs.existsSync(userPromptFilePath)) {
      await selectPromptDirectory();
    }

    const panel = vscode.window.createWebviewPanel(
      'promptDictionary',
      'Prompt Dictionary',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    const updatePanelContent = () => {
      if (!userPromptFilePath || !fs.existsSync(userPromptFilePath)) {
        panel.webview.html = `
          <html><body style="font-family: sans-serif; padding: 2em; background: #1e1e1e; color: #ccc;">
            <h2>📂 No <code>prompts.json</code> found</h2>
            <p>Please set a prompt directory by clicking the button below.</p>
            <button onclick="changeFolder()" style="padding:10px 16px; background:#007acc; border:none; color:white; border-radius:4px;">Choose Prompt Folder</button>
            <script>
              const vscode = acquireVsCodeApi();
              function changeFolder() {
                vscode.postMessage({ command: 'changePromptFolder' });
              }
            </script>
          </body></html>`;
        return;
      }

      const prompts = getPrompts();
      const promptHtml = prompts.map((p: any, i: number) => `
        <div class="prompt">
          <div class="title">${p.title}</div>
          <div class="buttons">
            <button onclick="copyPrompt(\`${p.prompt}\`)">📋 Copy</button>
            <button class="delete" onclick="deletePrompt(${i})">✖ Delete</button>
          </div>
        </div>
      `).join('');

      panel.webview.html = `
        <html><head><style>
          body { font-family: sans-serif; padding: 1em; color: #ddd; background: #1e1e1e; }
          .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em; }
          .prompt { border-bottom: 1px solid #444; padding: 0.5em 0; }
          .title { font-weight: bold; margin-bottom: 0.25em; font-size: 1.1em; }
          .buttons { display: flex; gap: 0.5em; }
          button {
            padding: 5px 12px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 0.9em;
          }
          button.delete {
            background: #ff5f56;
            color: white;
          }
          button:not(.delete) {
            background: #007acc;
            color: white;
          }
        </style></head>
        <body>
          <div class="topbar">
            <h2>📘 Prompt Dictionary</h2>
            <button onclick="changeFolder()">⚙️ Change Folder</button>
          </div>
          ${promptHtml || '<p>No prompts found in your prompts.json file.</p>'}
          <script>
            const vscode = acquireVsCodeApi();
            function copyPrompt(text) {
              vscode.postMessage({ command: 'insertPrompt', text });
            }
            function changeFolder() {
              vscode.postMessage({ command: 'changePromptFolder' });
            }
            function deletePrompt(index) {
              vscode.postMessage({ command: 'deletePrompt', index });
            }
          </script>
        </body></html>`;
    };

    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'insertPrompt') {
        vscode.env.clipboard.writeText(message.text);
        vscode.window.showInformationMessage('Prompt copied to clipboard.');
      } else if (message.command === 'changePromptFolder') {
        await selectPromptDirectory();
        updatePanelContent();
      } else if (message.command === 'deletePrompt') {
        const updated = getPrompts().filter((_: any, i: number) => i !== message.index);
        fs.writeFileSync(userPromptFilePath!, JSON.stringify(updated, null, 2), 'utf8');
        updatePanelContent();
      }
    });

    updatePanelContent();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('promptDictionary.openPanel', openPromptPanel)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promptDictionary.changePromptFolder', async () => {
      await selectPromptDirectory();
    })
  );
}

function getPrompts(): any[] {
  try {
    const data = fs.readFileSync(userPromptFilePath!, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function deactivate() {}
