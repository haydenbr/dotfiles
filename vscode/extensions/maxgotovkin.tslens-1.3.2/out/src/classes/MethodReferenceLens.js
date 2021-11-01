"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class MethodReferenceLens extends vscode_1.CodeLens {
    constructor(range, uri, command, decoration, symbol) {
        super(range, command);
        this.uri = uri;
        this.decoration = decoration;
        this.symbolInfo = symbol;
    }
}
exports.MethodReferenceLens = MethodReferenceLens;
//# sourceMappingURL=MethodReferenceLens.js.map