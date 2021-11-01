"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfiguration_1 = require("./classes/AppConfiguration");
'use strict';
const vscode_1 = require("vscode");
const ts_simple_ast_1 = require("ts-simple-ast");
const MethodReferenceLens_1 = require("./classes/MethodReferenceLens");
const TSCodeRefProvider_1 = require("./providers/TSCodeRefProvider");
const TSCodeLensProvider_1 = require("./providers/TSCodeLensProvider");
const TSCodeHoverProvider_1 = require("./providers/TSCodeHoverProvider");
const Utils_1 = require("./classes/Utils");
function traceSymbolInfo(document, usedPositions, symbolInformation) {
    var index;
    var lineIndex = symbolInformation.location.range.start.line;
    do {
        var range = symbolInformation.location.range;
        var line = document.lineAt(lineIndex);
        index = line.text.lastIndexOf(symbolInformation.name);
        if (index > -1) {
            break;
        }
        lineIndex++;
    } while (lineIndex <= symbolInformation.location.range.end.line);
    if (symbolInformation.name == '<function>') {
        range = null;
    }
    else if (index == -1) {
        var line = document.lineAt(symbolInformation.location.range.start.line);
        index = line.firstNonWhitespaceCharacterIndex;
        lineIndex = range.start.line;
        range = new vscode_1.Range(lineIndex, index, lineIndex, 90000);
    }
    else {
        range = new vscode_1.Range(lineIndex, index, lineIndex, index + symbolInformation.name.length);
    }
    if (range) {
        var position = document.offsetAt(range.start);
        if (!usedPositions[position]) {
            usedPositions[position] = 1;
            return new MethodReferenceLens_1.MethodReferenceLens(new vscode_1.Range(range.start, range.end), document.uri, null, null, symbolInformation);
        }
    }
}
function provider(document, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const symbolInformations = yield vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
            var usedPositions = [];
            return Utils_1.Utils.symbolsAggregator(document, usedPositions, symbolInformations)
                .map(symbolInformation => {
                return traceSymbolInfo(document, usedPositions, symbolInformation);
            })
                .filter(item => !!item);
        }
        catch (error) {
            console.log(error);
            return Promise.resolve([]);
        }
    });
}
exports.provider = provider;
function activate(context) {
    const config = new AppConfiguration_1.AppConfiguration();
    const tsProvider = new TSCodeLensProvider_1.TSCodeLensProvider(config, provider, context);
    const refProvider = new TSCodeRefProvider_1.TSCodeRefProvider(provider, context);
    const hoverProvider = new TSCodeHoverProvider_1.TSCodeHoverProvider(config);
    function updateTextEditor() {
        const filePath = vscode_1.window.activeTextEditor.document.fileName;
        const file = config.project.getSourceFile(filePath);
        if (file) {
            // const del = [];
            // tsProvider.classCache.forEach((v, k, map) => {
            //   if (k.endsWith(filePath.replace(/\\/g, '/').substring(1))) {
            //     del.push(k);
            //   }
            // });
            // del.forEach(x => tsProvider.classCache.delete(x));
            file.refreshFromFileSystem().then(x => tsProvider.initInterfaces());
        }
        //refProvider.clearDecorations(refProvider.overrideDecorations);
    }
    const triggerCodeLensComputation = () => {
        // if (!window.activeTextEditor) return;
        // var end = window.activeTextEditor.selection.end;
        // window.activeTextEditor
        //   .edit(editbuilder => {
        //     editbuilder.insert(end, ' ');
        //   })
        //   .then(() => {
        //     commands.executeCommand('undo');
        //   });
    };
    const disposables = context.subscriptions;
    const self = this;
    disposables.push(
    //languages.registerCodeLensProvider({ pattern: '**/*.ts' }, navProvider),
    vscode_1.languages.registerCodeLensProvider({ pattern: '**/*.ts' }, tsProvider), vscode_1.languages.registerCodeLensProvider({ pattern: '**/*.ts' }, refProvider), vscode_1.languages.registerHoverProvider({ pattern: '**/*.ts' }, hoverProvider));
    disposables.push(vscode_1.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateTextEditor();
            tsProvider.updateDecorations(editor.document.uri);
        }
    }), vscode_1.workspace.onDidSaveTextDocument(updateTextEditor));
    disposables.push(vscode_1.commands.registerCommand('tslens.update', () => {
        updateTextEditor();
        //triggerCodeLensComputation();
    }));
    disposables.push(vscode_1.commands.registerCommand('tslens.gotoFile', (filePath, line) => {
        vscode_1.workspace.openTextDocument(filePath).then(doc => {
            vscode_1.window
                .showTextDocument(doc)
                .then(e => e.revealRange(new vscode_1.Range(line, 0, line + 1, 0), vscode_1.TextEditorRevealType.InCenter));
        });
    }));
    disposables.push(vscode_1.commands.registerCommand('tslens.showOverrides', () => __awaiter(this, void 0, void 0, function* () {
        var pos = vscode_1.window.activeTextEditor.selection.active;
        const f = config.project.getSourceFile(vscode_1.window.activeTextEditor.document.fileName);
        const symbols = Utils_1.Utils.symbolsAggregator(vscode_1.window.activeTextEditor.document, {}, yield vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', vscode_1.window.activeTextEditor.document.uri));
        const filtered = symbols.find(x => x.location.range.contains(pos));
        let m = [];
        if (filtered && filtered.kind === vscode_1.SymbolKind.Class) {
            const cl = f.getClass(filtered.name);
            let bc;
            if (cl) {
                bc = cl.getBaseClass();
                const methods = cl.getMethods().map(z => z.getName());
                const props = cl.getProperties().map(z => z.getName());
                if (bc) {
                    m.push(...bc
                        .getProperties()
                        .filter(x => !x.hasModifier(ts_simple_ast_1.SyntaxKind.PrivateKeyword) &&
                        props.indexOf(x.getName()) === -1)
                        .map(x => {
                        return { label: x.getName(), description: 'Property' };
                    }));
                    m.push(...bc
                        .getMethods()
                        .filter(x => !x.hasModifier(ts_simple_ast_1.SyntaxKind.PrivateKeyword) &&
                        methods.indexOf(x.getName()) === -1)
                        .map(x => {
                        return { label: x.getName(), description: 'Method' };
                    }));
                }
            }
            if (m.length > 0) {
                vscode_1.window
                    .showQuickPick(m)
                    .then((x) => {
                    if (x) {
                        if (x.description === 'Method') {
                            const method = bc.getMethod(x.label);
                            if (method) {
                                const params = method.getParameters().map(x => {
                                    return {
                                        name: x.getName(),
                                        type: x.getType().getText()
                                    };
                                });
                                const name = method.getName();
                                cl.addMethod({
                                    name: name,
                                    bodyText: `return super.${name}(${params
                                        .map(z => z.name)
                                        .join(', ')});`,
                                    parameters: params,
                                    returnType: method.getReturnType().getText()
                                });
                                f.save();
                            }
                        }
                        if (x.description === 'Property') {
                            const prop = bc.getProperty(x.label);
                            if (prop) {
                                const name = prop.getName();
                                cl.addProperty({
                                    name: name,
                                    type: prop.getType().getText()
                                });
                                f.save();
                            }
                        }
                    }
                });
            }
            else {
                vscode_1.window.showWarningMessage('No override candidates found for ' + filtered.name);
            }
        }
    })));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map