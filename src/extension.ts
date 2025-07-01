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
          <html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #1e1e1e; color: #ccc; padding: 2em;">
            <h2>📂 No <code>prompts.json</code> found</h2>
            <p>Click below to choose a prompt folder.</p>
            <button onclick="changeFolder()" style="padding:10px 16px; background:#007acc; border:none; color:white; border-radius:6px;">Choose Folder</button>
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
            <button class="delete" onclick="deletePrompt(${i})">✖</button>
          </div>
        </div>
      `).join('');

      panel.webview.html = `
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 2em; color: #ddd; background: #1e1e1e; }
            .topbar { display: flex; justify-content: space-between; margin-bottom: 1.5em; }
            .prompt { border-bottom: 1px solid #444; padding: 0.5em 0; }
            .title { font-weight: 500; font-size: 1.05em; margin-bottom: 0.25em; }
            .buttons { display: flex; gap: 0.5em; }
            button {
              padding: 6px 12px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              font-size: 0.9em;
            }
            .delete { background: #ff5f56; color: white; }
            .copy { background: #007acc; color: white; }
            .addbar { margin-bottom: 1em; display: flex; gap: 1em; }
            input, textarea {
              background: #2a2a2a;
              color: white;
              border: 1px solid #555;
              border-radius: 6px;
              padding: 6px;
              width: 100%;
              font-family: inherit;
            }
            textarea { resize: vertical; min-height: 50px; }
          </style>
        </head>
        <body>
          <div class="topbar">
            <h2>📘 Prompt Dictionary</h2>
            <button onclick="changeFolder()">⚙️ Change Folder</button>
          </div>
          <div class="addbar">
            <input id="newTitle" placeholder="Prompt Title" />
            <textarea id="newPrompt" placeholder="Prompt Text"></textarea>
            <button onclick="addPrompt()" class="copy">➕ Add</button>
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
            function addPrompt() {
              const title = document.getElementById('newTitle').value;
              const prompt = document.getElementById('newPrompt').value;
              vscode.postMessage({ command: 'addPrompt', title, prompt });
              document.getElementById('newTitle').value = '';
              document.getElementById('newPrompt').value = '';
            }
          </script>
        </body>
        </html>`;
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
      } else if (message.command === 'addPrompt') {
        const existing = getPrompts();
        existing.push({ title: message.title || 'Untitled', prompt: message.prompt || '' });
        fs.writeFileSync(userPromptFilePath!, JSON.stringify(existing, null, 2), 'utf8');
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
