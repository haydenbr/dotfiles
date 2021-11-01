"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const config_1 = require("./config");
const gzip = require("gzip-js");
const filesize = require("filesize.js");
class Statusbar {
    init() {
        this.initIcon();
        this.update();
        vscode.workspace.onDidChangeConfiguration(this.update.bind(this));
        //vscode.workspace.onDidSaveTextDocument(this.update.bind(this));
        vscode.workspace.onDidChangeTextDocument(this.update.bind(this));
        vscode.workspace.onDidOpenTextDocument(this.update.bind(this));
        vscode.workspace.onDidCloseTextDocument(this.update.bind(this));
    }
    initIcon() {
        const config = config_1.default.get();
        const alignment = config.alignment === 'left' ? vscode.StatusBarAlignment.Left : vscode.StatusBarAlignment.Right;
        this.icon = vscode.window.createStatusBarItem(alignment, -Infinity);
        //this.icon.command = '';
    }
    update() {
        this.config = config_1.default.get();
        let options = {
            level: this.config.level,
        };
        if (vscode.window.activeTextEditor) {
            this.icon.text = `$(file-zip) ${filesize(gzip.zip(vscode.window.activeTextEditor.document.getText(), options).length)}`;
            this.icon.show();
        }
        else {
            this.icon.hide();
        }
    }
}
const statusbar = new Statusbar();
exports.default = statusbar;
//# sourceMappingURL=statusbar.js.map