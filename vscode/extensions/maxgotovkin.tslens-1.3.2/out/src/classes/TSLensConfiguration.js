"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TSLensConfiguration {
    constructor() {
        this.tsConfigPath = '';
        this.showReferences = true;
        this.showBaseMemberInfo = true;
        this.basePreviewOnHover = false;
        this.blackbox = [];
        this.blackboxTitle = '<< called from blackbox >>';
        this.excludeself = true;
        this.singular = '{0} reference';
        this.plural = '{0} references';
        this.noreferences = 'no references found for {0}';
        this.unusedcolor = '#999';
        this.decorateunused = true;
        this.methodOverrideColor = 'rgba(209,0,0,0.35)';
        this.fieldOverrideColor = 'rgba(0, 123, 168, 0.35)';
        this.interfaceImplementationColor = 'rgba(144, 192, 2, 0.35)';
        this.referencesTypes = [
            vscode_1.SymbolKind.File,
            vscode_1.SymbolKind.Module,
            vscode_1.SymbolKind.Namespace,
            vscode_1.SymbolKind.Package,
            vscode_1.SymbolKind.Class,
            vscode_1.SymbolKind.Method,
            vscode_1.SymbolKind.Property,
            vscode_1.SymbolKind.Field,
            vscode_1.SymbolKind.Constructor,
            vscode_1.SymbolKind.Enum,
            vscode_1.SymbolKind.Interface,
            vscode_1.SymbolKind.Function,
            vscode_1.SymbolKind.Variable,
            vscode_1.SymbolKind.Constant,
            vscode_1.SymbolKind.String,
            vscode_1.SymbolKind.Number,
            vscode_1.SymbolKind.Boolean,
            vscode_1.SymbolKind.Array,
            vscode_1.SymbolKind.Object,
            vscode_1.SymbolKind.Key,
            vscode_1.SymbolKind.Null
        ];
    }
}
exports.TSLensConfiguration = TSLensConfiguration;
//# sourceMappingURL=TSLensConfiguration.js.map