"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TSLensConfiguration_1 = require("./TSLensConfiguration");
const ts_simple_ast_1 = require("ts-simple-ast");
const vscode = require("vscode");
const fs = require("fs");
class AppConfiguration {
    constructor() {
        if (vscode.workspace.rootPath) {
            let options = {
                tsConfigFilePath: this.settings.tsConfigPath || (vscode.workspace.rootPath + '/tsconfig.json'),
                addFilesFromTsConfig: true
            };
            const exists = fs.existsSync(options.tsConfigFilePath);
            if (exists) {
                this.project = new ts_simple_ast_1.default(options);
            }
            else {
                this.project = new ts_simple_ast_1.default();
            }
        }
        vscode.workspace.onDidChangeConfiguration(e => {
            this.cachedSettings = null;
        });
    }
    get extensionName() {
        return 'tslens';
    }
    get settings() {
        if (!this.cachedSettings) {
            var settings = vscode.workspace.getConfiguration(this.extensionName);
            this.cachedSettings = new TSLensConfiguration_1.TSLensConfiguration();
            for (var propertyName in this.cachedSettings) {
                if (settings.has(propertyName)) {
                    this.cachedSettings[propertyName] = settings.get(propertyName);
                }
            }
        }
        return this.cachedSettings;
    }
}
exports.AppConfiguration = AppConfiguration;
//# sourceMappingURL=AppConfiguration.js.map