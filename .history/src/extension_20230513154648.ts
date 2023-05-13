import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
// 拡張機能のアクティベーション関数
export function activate(context: vscode.ExtensionContext) {
  // 拡張機能のディレクトリのパスを取得
  const extensionDir = context.extensionPath;
  // ユーザ定義のgitignoreファイルのディレクトリのパスを作成
  const userGitignoreDir = path.join(extensionDir, "user-gitignore");
  // ユーザ定義のgitignoreファイルのディレクトリが存在しなければ作成
  if (!fs.existsSync(userGitignoreDir)) {
    fs.mkdirSync(userGitignoreDir);
  }
  // コマンドを登録
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.createGitignore", () => {
      // ワークスペースのルートフォルダがあるかチェック
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder is open.");
        return;
      }
      // ユーザ定義のgitignoreファイルの一覧を取得
      const userGitignoreFiles = fs.readdirSync(userGitignoreDir);
      // ユーザ定義のgitignoreファイルがなければエラー
      if (userGitignoreFiles.length === 0) {
        vscode.window.showErrorMessage("No user-defined gitignore file is found.");
        return;
      }
      // ユーザ定義のgitignoreファイルから選択肢を作成
      const userGitignoreOptions = userGitignoreFiles.map((file) => ({
        label: file,
        description: `Use ${file} as gitignore template`,
      }));
      // 選択肢を表示してユーザーに選ばせる
      vscode.window
        .showQuickPick(userGitignoreOptions, {
          placeHolder: "Select a user-defined gitignore file",
        })
        .then((selected) => {
          // 選択された場合
          if (selected) {
            // 選択されたgitignoreファイルのパスを取得
            const selectedGitignorePath = path.join(userGitignoreDir, selected.label);
            // 選択されたgitignoreファイルの内容を読み込む
            const selectedGitignoreContent = fs.readFileSync(selectedGitignorePath, "utf-8");
            // ワークスペースのルートフォルダに.gitignoreファイルがあるかチェック
            const workspaceGitignorePath = path.join(workspaceFolder.uri.fsPath, ".gitignore");
            if (fs.existsSync(workspaceGitignorePath)) {
              // .gitignoreファイルがある場合は上書きするか確認する
              vscode.window
                .showWarningMessage("A .gitignore file already exists in the workspace folder. Do you want to overwrite it?", "Yes", "No")
                .then((answer) => {
                  // 回答に応じて処理を分岐
                  if (answer === "Yes") {
                    // 上書きする場合は選択されたgitignoreファイルの内容を書き込む
                    fs.writeFileSync(workspaceGitignorePath, selectedGitignoreContent);
                    vscode.window.showInformationMessage("The .gitignore file has been overwritten.");
                  } else if (answer === "No") {
                    // 上書きしない場合は何もしない
                    vscode.window.showInformationMessage("The .gitignore file has not been changed.");
                  }
                });
            } else {
              // .gitignoreファイルがない場合は作成して選択されたgitignoreファイルの内容を書き込む
              fs.writeFileSync(workspaceGitignorePath, selectedGitignoreContent);
              vscode.window.showInformationMessage("A new .gitignore file has been created.");
            }
          }
        });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.saveGitignore", () => {
      // extension.saveGitignoreコマンドの処理
      // 現在開いているエディタのドキュメントを取得
      const document = vscode.window.activeTextEditor?.document;
      if (!document) {
        vscode.window.showErrorMessage("No document is open.");
        return;
      }
      // ドキュメントが.gitignoreファイルかどうかチェック
      if (document.fileName !== ".gitignore") {
        vscode.window.showErrorMessage("The current document is not a .gitignore file.");
        return;
      }
      // .gitignoreファイルの内容を取得
      const gitignoreContent = document.getText();
      // ユーザーに保存するファイル名を入力させる
      vscode.window
        .showInputBox({
          prompt: "Enter the file name to save the .gitignore file as user-defined template",
          placeHolder: "e.g. node.gitignore",
          validateInput: (input) => {
            // 入力が空白や不正な文字でないかチェック
            if (!input) {
              return "The file name cannot be empty.";
            }
            if (!/^[a-zA-Z0-9_.-]+$/.test(input)) {
              return "The file name contains invalid characters.";
            }
            return null;
          },
        })
        .then((input) => {
          // 入力された場合
          if (input) {
            // user-gitignoreディレクトリに入力されたファイル名で.gitignoreファイルの内容を書き込む
            const userGitignorePath = path.join(userGitignoreDir, input);
            fs.writeFileSync(userGitignorePath, gitignoreContent);
            vscode.window.showInformationMessage(`The .gitignore file has been saved as ${input} in user-gitignore directory.`);
          }
        });
    })
  );
}

// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "your-gitignore-template" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('your-gitignore-template.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from Your-gitignore-Template!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}
