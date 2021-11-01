"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Config = {
    get() {
        return vscode.workspace.getConfiguration().get('gzip-status');
    }
};
exports.default = Config;
//# sourceMappingURL=config.js.map