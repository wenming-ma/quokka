# Quokka

A VS Code / Cursor extension for C++ developer productivity.

![Quokka](resources/quokka.png)

## Features

### Jump to VS
Open the current file in Visual Studio at the same line position.

- Right-click in editor → `Quokka` → `Jump to VS`
- Requires Visual Studio to be running

### Switch Header/Source
Toggle between header and source files:
- `.h` / `.hpp` ↔ `.cpp` / `.c` / `.cc`

- Right-click in editor → `Quokka` → `Switch Header/Source`
- Searches the entire workspace
- Automatically skips build directories

### Copy File Name
Copy the current file name (with extension) to clipboard.

- Right-click in editor → `Quokka` → `Copy File Name`
- Example: `main.cpp`

## Installation

### From Release
1. Download `quokka-x.x.x.vsix` from [Releases](https://github.com/wenming-ma/quokka/releases)
2. In VS Code/Cursor: `Ctrl+Shift+P` → `Extensions: Install from VSIX`
3. Select the downloaded file

### From Source
```bash
git clone https://github.com/wenming-ma/quokka.git
cd quokka
npm install
npm run compile
npx vsce package
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `quokka.visualStudioVersion` | `VisualStudio.DTE.17.0` | VS DTE ProgID (use `16.0` for VS2019, `17.0` for VS2022) |
| `quokka.excludeFolders` | `["build", "out", "dist", ...]` | Folders to exclude when searching for header/source files |

### Example settings.json
```json
{
  "quokka.visualStudioVersion": "VisualStudio.DTE.16.0",
  "quokka.excludeFolders": ["build", "out", "dist", "node_modules", ".git", "bin", "obj"]
}
```

## Requirements

- VS Code 1.74.0+ or Cursor
- Windows (for Jump to VS feature)
- Visual Studio 2019/2022 (for Jump to VS feature)

## License

MIT
