"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const TSCodeLensProvider_1 = require("./TSCodeLensProvider");
class TSCodeHoverProvider {
    constructor(config) {
        this.config = config;
    }
    provideHover(document, position, token) {
        if (!this.config.settings.basePreviewOnHover) {
            return null;
        }
        let hover = null;
        const key = `${document.uri.fsPath}_${position.line}`;
        if (TSCodeLensProvider_1.TSCodeLensProvider.methods.has(key)) {
            hover = new vscode_1.Hover({ language: 'typescript', value: TSCodeLensProvider_1.TSCodeLensProvider.methods.get(key) });
        }
        return hover;
    }
}
exports.TSCodeHoverProvider = TSCodeHoverProvider;
//# sourceMappingURL=TSCodeHoverProvider.js.map