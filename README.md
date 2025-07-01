# Cursor Prompt Directory

Prompt manager for Cursor and VSCode.  
Quickly browse, copy, and insert AI prompts all from a polished panel interface.

---

## Features

- **Searchable Prompt Picker** via Command Palette
- **Interactive Prompt Panel** with collapsible prompt previews
- **Add / Delete Prompts** with an intuitive UI modal
- **Editable JSON Storage** in a folder you select
- **Polished Apple-like UI** for the ultimate dev experience
- **Clipboard-First Workflow** — prompts are 1-click copy ready

---

## Quick Start

### Option 1: Install via Marketplace (No Build Required ✅)

> 🔗 **[Install via Extension Marketplace – Cursor Prompt Directory**  
Just search for `Cursor Prompt Directory` in Cursor or VS Code Extensions.

---

### Option 2: Manual Build

#### 1. Clone the Repo

```bash
git clone https://github.com/juansebsol/cursor-directory-plugin
cd cursor-directory-plugin
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Compile the Plugin

```bash
npm run compile
```

#### 4. Package the Extension

```bash
npx vsce package
```

This generates a `.vsix` file (e.g. `cursor-directory-plugin-0.0.1.vsix`)

#### 5. Install in Cursor

- Open Cursor (or VS Code)
- Open Extensions (`Cmd + Shift + X`)
- Click the `…` menu > **Install from VSIX**
- Select your `.vsix` file

✅ You're good to go.

---

## 🧠 How to Use

### Command Palette Prompt Access

- Open Command Palette (`Cmd + Shift + P`)
- Type `Prompt Dictionary: Open Panel`
- Browse, copy, and paste a prompt into Cursor

### Visual Prompt Panel

- See all prompts in a clean, collapsible list
- Click title to reveal the full prompt
- Use buttons to:
  - 📋 **Copy** to clipboard
  - ❌ **Delete** prompt
  - ➕ **Add** new prompt via modal
  - ⚙️ **Change folder** where `prompts.json` is saved

---

## 📂 Prompt Format

All prompts are stored in a simple `.json` file:

```json
[
  {
    "title": "Explain Code",
    "prompt": "Can you explain this code in simple terms?"
  },
  {
    "title": "Refactor",
    "prompt": "Can you improve this code for readability?"
  }
]
```

> You choose where this file lives (and you can change it anytime).

---

## Folder Structure

```
cursor-directory-plugin/
├── src/
│   └── extension.ts          # All main logic here
├── out/                      # Compiled output
├── package.json              # Extension manifest
├── README.md                 # You're reading it
```

---

## Built With

- TypeScript
- VS Code Extension API
- Webview
- Clipboard API

---

## Want to Contribute?

Ideas welcome! Potential enhancements:

- Prompt categories/tags
- Local encryption for secure prompts
- Cloud sync (Supabase / Firebase / SQLite)

Feel free to fork, PR, or suggest!

---

## Known Limitations

- Prompts copy to clipboard only (manual paste required)
- No auto-insert into Cursor chat (API sandbox limitation)

---

## License

MIT © 2025 [Sebastian Solano](https://github.com/sebsol)