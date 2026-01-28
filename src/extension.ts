import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

const headerExtensions = ['.h', '.hpp'];
const sourceExtensions = ['.cpp', '.c', '.cc'];

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "quokka" is now active');

    const jumpToVS = vscode.commands.registerCommand('quokka.jumpToVS', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const filePath = document.uri.fsPath;
        const lineNumber = editor.selection.active.line + 1;
        const columnNumber = editor.selection.active.character + 1;

        const scriptPath = path.join(context.extensionPath, 'scripts', 'open-in-vs.ps1');

        const config = vscode.workspace.getConfiguration('quokka');
        const dteVersion = config.get<string>('visualStudioVersion', 'VisualStudio.DTE.17.0');

        const psCommand = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -FilePath "${filePath}" -LineNumber ${lineNumber} -ColumnNumber ${columnNumber} -DTEVersion "${dteVersion}"`;

        exec(psCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                console.error('Stderr:', stderr);

                if (stderr.includes('No running Visual Studio instance found')) {
                    vscode.window.showErrorMessage('No running Visual Studio instance found. Please open Visual Studio first.');
                } else {
                    vscode.window.showErrorMessage(`Failed to open in Visual Studio: ${stderr || error.message}`);
                }
                return;
            }

            console.log('Output:', stdout);
            vscode.window.showInformationMessage(`Opened in Visual Studio: ${path.basename(filePath)}:${lineNumber}`);
        });
    });

    context.subscriptions.push(jumpToVS);

    // Switch Header/Source command
    const switchHeaderSource = vscode.commands.registerCommand('quokka.switchHeaderSource', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();
        const baseName = path.basename(filePath, ext);

        let targetExtensions: string[];

        if (headerExtensions.includes(ext)) {
            targetExtensions = sourceExtensions;
        } else if (sourceExtensions.includes(ext)) {
            targetExtensions = headerExtensions;
        } else {
            vscode.window.showWarningMessage('Current file is not a C/C++ header or source file');
            return;
        }

        // Get workspace root
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const config = vscode.workspace.getConfiguration('quokka');
        const excludeFolders = config.get<string[]>('excludeFolders', ['build', 'out', 'dist', 'node_modules', '.git', 'bin', 'obj', 'Debug', 'Release', 'x64', 'x86']);

        // Search for target file in workspace
        const targetFileName = baseName;
        const foundFile = await findFileInWorkspace(workspaceFolder.uri.fsPath, targetFileName, targetExtensions, excludeFolders);

        if (foundFile) {
            const doc = await vscode.workspace.openTextDocument(foundFile);
            await vscode.window.showTextDocument(doc);
        } else {
            vscode.window.showWarningMessage(`No corresponding file found for ${path.basename(filePath)}`);
        }
    });

    context.subscriptions.push(switchHeaderSource);

    // Copy File Name command
    const copyFileName = vscode.commands.registerCommand('quokka.copyFileName', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const fileName = path.basename(editor.document.uri.fsPath);
        await vscode.env.clipboard.writeText(fileName);
        vscode.window.showInformationMessage(`Copied: ${fileName}`);
    });

    context.subscriptions.push(copyFileName);
}

function findFileInWorkspace(rootPath: string, baseName: string, extensions: string[], excludeFolders: string[]): Promise<string | null> {
    return new Promise((resolve) => {
        const results: string[] = [];

        function searchDir(dirPath: string) {
            try {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);

                    if (entry.isDirectory()) {
                        if (!excludeFolders.includes(entry.name)) {
                            searchDir(fullPath);
                        }
                    } else if (entry.isFile()) {
                        const fileExt = path.extname(entry.name).toLowerCase();
                        const fileBaseName = path.basename(entry.name, fileExt);

                        if (fileBaseName === baseName && extensions.includes(fileExt)) {
                            results.push(fullPath);
                        }
                    }
                }
            } catch (err) {
                // Ignore permission errors
            }
        }

        searchDir(rootPath);

        // Return first match based on extension priority
        for (const ext of extensions) {
            const match = results.find(f => f.toLowerCase().endsWith(ext));
            if (match) {
                resolve(match);
                return;
            }
        }

        resolve(null);
    });
}

export function deactivate() {}
