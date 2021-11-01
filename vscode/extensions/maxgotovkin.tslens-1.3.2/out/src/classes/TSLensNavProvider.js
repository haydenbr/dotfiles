"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const AppConfiguration_1 = require("./AppConfiguration");
const MethodReferenceLens_1 = require("./MethodReferenceLens");
const enu = require("linq");
const TSCodeLensProvider_1 = require("./TSCodeLensProvider");
class TSLensNavProvider {
    constructor(provider, context) {
        this.provider = provider;
        this.context = context;
        this.config = new AppConfiguration_1.AppConfiguration();
    }
    findDecoration(lens) {
        let lensf;
        const decorators = TSCodeLensProvider_1.TSCodeLensProvider.overrideDecorations;
        decorators.forEach((v, k, map) => {
            if (k.startsWith(lens.uri.fsPath) && !lensf) {
                var ifDecoration = enu
                    .from(v.ranges)
                    .any(x => x.isEqual(lens.range));
                ifDecoration && (lensf = v);
            }
        });
        return lensf;
    }
    provideCodeLenses(document, token) {
        return this.provider(document, token).then(x => {
            return x; //x.filter(z => !!this.findDecoration(z));
        });
    }
    resolveCodeLens(codeLens, token) {
        if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
            const decorators = TSCodeLensProvider_1.TSCodeLensProvider.overrideDecorations;
            var lens = this.findDecoration(codeLens);
            if (lens) {
                return new vscode_1.CodeLens(codeLens.range, {
                    command: 'tslens.showOverrides',
                    title: lens.inheritInfo
                });
            }
        }
    }
}
exports.TSLensNavProvider = TSLensNavProvider;
//# sourceMappingURL=TSLensNavProvider.js.map