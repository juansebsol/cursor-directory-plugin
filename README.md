Here’s your complete, copy-pasteable `README.md` — fully self-contained and professional:

---

````md
# Cursor Directory Plugin

A beautiful, minimal prompt picker built for [Cursor](https://www.cursor.sh) and VS Code.  
Easily access your most-used AI prompts through a sidebar or command palette — copy and paste them into Cursor chat with one click.

---

## ✨ Features

- 🔍 **Command Palette Search**: Type to search and select a prompt
- 🧱 **Sidebar Panel**: Insert prompts using clean UI buttons
- 📁 **Editable Prompt List**: Stored in a simple `src/prompts.json` file
- 📋 **Clipboard Injection**: Prompt is copied — you paste it into Cursor chat

---

## 📦 How to Install

### 1. Clone or Create This Project

If you’re starting from scratch:
```bash
npm install -g yo generator-code vsce
yo code  # Choose: New Extension (TypeScript)
````

Or if you have the project folder ready:

```bash
cd cursor-directory-plugin
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Compile the Extension

```bash
npm run compile
```

---

### 4. Package as VSIX

```bash
vsce package
```

This will create a file like:

```
cursor-directory-plugin-0.0.1.vsix
```

---

### 5. Install into Cursor

* Open Cursor
* Go to **Extensions** (Cmd+Shift+X)
* Click the `⋯` menu (top-right)
* Select **Install from VSIX...**
* Choose your `.vsix` file
* ✅ You’re done!

---

## 🧠 How to Use

### 🧭 Use the Command Palette

* Open it with `Cmd + Shift + P`
* Run `Prompt Dictionary: Insert from List`

→ This opens a searchable list of your saved prompts.

---

### 🧱 Use the Sidebar Panel

* Open Command Palette → `Prompt Dictionary: Open Sidebar`
* Browse your prompts visually
* Click “Insert” to copy it to your clipboard
* Paste into Cursor chat

---

## 📝 Customizing Prompts

All your prompts live in:

```
src/prompts.json
```

Example:

```json
[
  {
    "title": "Explain Code",
    "prompt": "Can you explain this code in simple terms?"
  },
  {
    "title": "Refactor",
    "prompt": "Can you optimize this code for readability and performance?"
  }
]
```

Edit this file to add or change your favorite prompts. No rebuild required.

---

## 📂 Folder Structure

```
cursor-directory-plugin/
├── src/
│   ├── extension.ts      # Main extension logic
│   └── prompts.json      # Your list of prompts
├── out/                  # Compiled JS after build
├── package.json          # Metadata and command declarations
├── README.md             # You're reading it
```

---

## 🛠 Built With

* TypeScript
* VS Code Extension API
* Webview for Sidebar UI
* Clipboard API
* Cursor IDE ❤️

---

## 🐛 Known Limitations

* Prompts are copied to your clipboard — you must paste them into Cursor manually (due to IDE sandboxing)
* Auto-paste into AI chat is not yet supported natively

---

## 📜 License

MIT © 2025 [Sebastian Solano](https://github.com/sebsol)

```

---