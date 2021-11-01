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
const vscode_1 = require("vscode");
const minimatch = require("minimatch");
const AppConfiguration_1 = require("../classes/AppConfiguration");
const MethodReferenceLens_1 = require("../classes/MethodReferenceLens");
class TSCodeRefProvider {
    constructor(provider, context) {
        this.provider = provider;
        this.context = context;
        this.unusedDecorations = new Map();
        this.config = new AppConfiguration_1.AppConfiguration();
    }
    clearDecorations(set) {
        var editor = vscode_1.window.activeTextEditor;
        if (editor != null) {
            var keys = [];
            set.forEach((overrideDecoration, key) => {
                if (key.startsWith(editor.document.uri.fsPath)) {
                    var decoration = overrideDecoration.decoration;
                    var ranges = overrideDecoration.ranges;
                    if (ranges.length > 0 && decoration) {
                        decoration.dispose();
                        decoration = null;
                        keys.push(key);
                    }
                }
            });
            keys.forEach(x => set.delete(x));
        }
    }
    reinitDecorations() {
        var settings = this.config.settings;
        var editor = vscode_1.window.activeTextEditor;
        if (editor != null) {
            this.clearDecorations(this.unusedDecorations);
        }
    }
    provideCodeLenses(document, token) {
        return this.config.settings.showReferences ? this.provider(document, token).then(x => {
            return x.filter(f => !!this.config.settings.referencesTypes.find(z => z === f.symbolInfo.kind));
        }) : [];
    }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const locations = yield vscode_1.commands.executeCommand('vscode.executeReferenceProvider', codeLens.uri, codeLens.range.start);
                var settings = this.config.settings;
                var filteredLocations = locations;
                if (settings.excludeself) {
                    filteredLocations = locations.filter(location => !location.range.isEqual(codeLens.range));
                }
                const blackboxList = this.config.settings.blackbox || [];
                const nonBlackBoxedLocations = filteredLocations.filter(location => {
                    const fileName = location.uri.path;
                    return !blackboxList.some(pattern => {
                        return new minimatch.Minimatch(pattern).match(fileName);
                    });
                });
                var isSameDocument = codeLens.uri == vscode_1.window.activeTextEditor.document.uri;
                var message;
                var amount = nonBlackBoxedLocations.length;
                if (amount == 0) {
                    message = settings.noreferences;
                    var name = isSameDocument
                        ? vscode_1.window.activeTextEditor.document.getText(codeLens.range)
                        : '';
                    message = message.replace('{0}', name + '');
                }
                else if (amount == 1) {
                    message = settings.singular;
                    message = message.replace('{0}', amount + '');
                }
                else {
                    message = settings.plural;
                    message = message.replace('{0}', amount + '');
                }
                if (amount == 0 &&
                    filteredLocations.length == 0 &&
                    isSameDocument &&
                    settings.decorateunused) {
                    if (this.unusedDecorations.has(codeLens.uri.fsPath)) {
                        var decorationsForFile = this.unusedDecorations.get(codeLens.uri.fsPath);
                        decorationsForFile.ranges.push(codeLens.range);
                    }
                }
                this.updateDecorations(codeLens.uri);
                const range = new vscode_1.Range(codeLens.range.start.line, codeLens.range.start.character, codeLens.range.end.line, codeLens.range.end.character);
                if (amount == 0 && filteredLocations.length != 0) {
                    return new vscode_1.CodeLens(range, {
                        command: '',
                        title: settings.blackboxTitle
                    });
                }
                else if (amount > 0) {
                    return new vscode_1.CodeLens(range, {
                        command: 'editor.action.showReferences',
                        title: message,
                        arguments: [
                            codeLens.uri,
                            codeLens.range.start,
                            nonBlackBoxedLocations
                        ]
                    });
                }
                else {
                    return new vscode_1.CodeLens(range, {
                        command: 'editor.action.findReferences',
                        title: message,
                        arguments: [codeLens.uri, codeLens.range.start]
                    });
                }
            }
        });
    }
    updateDecorations(uri) {
        var isSameDocument = uri == vscode_1.window.activeTextEditor.document.uri;
        if (isSameDocument) {
            if (this.unusedDecorations.has(uri.fsPath)) {
                var unusedDecoration = this.unusedDecorations.get(uri.fsPath);
                var decoration = unusedDecoration.decoration;
                var unusedDecorations = unusedDecoration.ranges;
                vscode_1.window.activeTextEditor.setDecorations(decoration, unusedDecorations);
            }
        }
    }
}
exports.TSCodeRefProvider = TSCodeRefProvider;
//# sourceMappingURL=TSCodeRefProvider.js.map