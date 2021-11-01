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
const Utils_1 = require("./../classes/Utils");
const vscode_1 = require("vscode");
const ts_simple_ast_1 = require("ts-simple-ast");
const minimatch = require("minimatch");
const enu = require("linq");
const MethodReferenceLens_1 = require("../classes/MethodReferenceLens");
const TSDecoration_1 = require("../classes/TSDecoration");
const standardSymbolKindSet = [
    vscode_1.SymbolKind.Method,
    vscode_1.SymbolKind.Function,
    vscode_1.SymbolKind.Property,
    vscode_1.SymbolKind.Class,
    vscode_1.SymbolKind.Interface
];
const cssSymbolKindSet = [
    vscode_1.SymbolKind.Method,
    vscode_1.SymbolKind.Function,
    vscode_1.SymbolKind.Property,
    vscode_1.SymbolKind.Variable
];
class TSCodeLensProvider {
    constructor(config, provider, context) {
        this.config = config;
        this.provider = provider;
        this.context = context;
        this.overrideDecorations = new Map();
        this.classCache = new Map();
        this.recheckInterfaces = true;
        this.initInterfaces();
    }
    initInterfaces() {
        setTimeout(() => {
            this.interfaces = Utils_1.Utils.getInterfaces(this.config.project);
        }, 1000);
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
    setupCodeLens(codeLens, analyzeSymbols) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const file = this.config.project.getSourceFile(vscode_1.window.activeTextEditor.document.fileName);
                if (!file) {
                    return false;
                }
                TSCodeLensProvider.methods = new Map();
                const testName = vscode_1.window.activeTextEditor.document.getText(codeLens.range);
                let isChanged = codeLens.isChanged;
                let symbol = codeLens.symbolInfo;
                let locations;
                let symbols;
                if (analyzeSymbols) {
                    const res = yield Promise.all([
                        vscode_1.commands.executeCommand('vscode.executeReferenceProvider', codeLens.uri, codeLens.range.start),
                        vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', codeLens.uri)
                    ]);
                    locations = res[0];
                    symbols = Utils_1.Utils.symbolsAggregator(vscode_1.window.activeTextEditor.document, {}, res[1]);
                    if (this.recheckInterfaces) {
                        this.initInterfaces();
                        this.recheckInterfaces = false;
                    }
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
                    isChanged = Utils_1.Utils.checkInterfaces(this.config.project, [
                        ...nonBlackBoxedLocations.map(x => x.uri.fsPath),
                        ...file
                            .getImportDeclarations()
                            .map(x => {
                            const fp = x.getModuleSpecifierSourceFile();
                            return fp && fp.getFilePath();
                        })
                            .filter(x => !!x)
                    ]);
                    symbol = symbols.find(x => x.location.range.start.line === codeLens.range.start.line &&
                        testName === x.name);
                }
                if (this.config.project && symbol) {
                    if (symbol.kind === vscode_1.SymbolKind.Method ||
                        symbol.kind === vscode_1.SymbolKind.Field ||
                        symbol.kind === vscode_1.SymbolKind.Property) {
                        const ns = file.getNamespaces();
                        let parentClass;
                        if (ns.length > 0) {
                            parentClass = enu
                                .from(ns)
                                .select(x => x.getClass(symbol.containerName))
                                .where(x => !!x)
                                .firstOrDefault();
                        }
                        else {
                            parentClass = file.getClass(symbol.containerName);
                        }
                        if (parentClass) {
                            let members = [];
                            const key = `${parentClass.getName()}_${parentClass
                                .getSourceFile()
                                .getFilePath()}`;
                            if (this.classCache.has(key) && !isChanged) {
                                members = this.classCache.get(key);
                            }
                            else {
                                try {
                                    members = Utils_1.Utils.getClassMembers(this.interfaces, parentClass);
                                    this.classCache.set(key, members);
                                }
                                catch (error) {
                                    console.log(error);
                                }
                            }
                            // let members = Utils.getClassMembers(this.interfaces, parentClass);
                            const classMembers = members.filter(x => x instanceof ts_simple_ast_1.PropertyDeclaration ||
                                x instanceof ts_simple_ast_1.MethodDeclaration);
                            const interfaceMembers = members.filter(x => x instanceof ts_simple_ast_1.PropertySignature || x instanceof ts_simple_ast_1.MethodSignature);
                            const classInd = classMembers.filter(x => x.getName() === testName);
                            const interfaceInd = interfaceMembers.filter(x => x.getName() === testName);
                            const isClassed = classInd.length > 0;
                            const isInterface = interfaceInd.length > 0;
                            if (symbol.kind === vscode_1.SymbolKind.Method && isClassed) {
                                const key = `${symbol.location.uri.fsPath}_${symbol.location.range.start.line}`;
                                TSCodeLensProvider.methods.set(key, classInd[0].getText());
                            }
                            // if (force && !isClassed && !isInterface) {
                            //   const keysForDelete = [];
                            //   this.overrideDecorations.forEach((value, key, x) => {
                            //     if (
                            //       key.startsWith(codeLens.uri.fsPath) &&
                            //     key.endsWith(`${testM}`)
                            //     ) {
                            //       value.decoration.dispose();
                            //       keysForDelete.push(key);
                            //     }
                            //   });
                            //   keysForDelete.forEach(x => {
                            //     this.overrideDecorations.delete(x);
                            //   });
                            // }
                            if (isClassed || isInterface) {
                                codeLens.isClassed = isClassed;
                                codeLens.isInterface = isInterface;
                                codeLens.interfaceInd = interfaceInd;
                                codeLens.classInd = classInd;
                                codeLens.testName = testName;
                                codeLens.symbolInfo = symbol;
                                codeLens.isChanged = isChanged;
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        });
    }
    provideCodeLenses(document, token) {
        return this.provider(document, token).then((codeLenses) => __awaiter(this, void 0, void 0, function* () {
            if (!this.config.settings.showBaseMemberInfo) {
                return [];
            }
            var filterAsync = (array, filter) => Promise.all(array.map(entry => filter(entry))).then(bits => array.filter(entry => bits.shift()));
            const f = yield filterAsync(codeLenses, x => this.setupCodeLens(x, true));
            this.clearDecorations(this.overrideDecorations);
            return f;
        }));
    }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const isReady = yield this.setupCodeLens(codeLens);
                if (isReady) {
                    const isClassed = codeLens.isClassed;
                    const isInterface = codeLens.isInterface;
                    const symbol = codeLens.symbolInfo;
                    const testM = codeLens.testName;
                    const classInd = codeLens.classInd;
                    const interfaceInd = codeLens.interfaceInd;
                    if (isClassed || isInterface) {
                        var editor = vscode_1.window.activeTextEditor;
                        if (editor != null) {
                            const gutterType = isClassed
                                ? symbol.kind === vscode_1.SymbolKind.Method
                                    ? isInterface
                                        ? 'interfaceMethodEdit'
                                        : 'methodEdit'
                                    : isInterface
                                        ? 'interfaceFieldEdit'
                                        : 'fieldEdit'
                                : 'implementInterface';
                            const key = `${codeLens.uri.fsPath}_${codeLens.range.start.line}_${testM}`;
                            let overrideDecoration;
                            if (this.overrideDecorations.has(key)) {
                                overrideDecoration = this.overrideDecorations.get(key);
                                overrideDecoration.ranges = [codeLens.range];
                            }
                            else {
                                overrideDecoration = new TSDecoration_1.TSDecoration();
                                this.overrideDecorations.set(key, overrideDecoration);
                                overrideDecoration.decoration = vscode_1.window.createTextEditorDecorationType({
                                    backgroundColor: isClassed
                                        ? symbol.kind === vscode_1.SymbolKind.Method
                                            ? this.config.settings.methodOverrideColor
                                            : this.config.settings.fieldOverrideColor
                                        : this.config.settings.interfaceImplementationColor,
                                    gutterIconPath: this.context.asAbsolutePath(`images/${gutterType}.svg`)
                                });
                                overrideDecoration.ranges.push(codeLens.range);
                            }
                            var inheritInfo = '';
                            if (isClassed) {
                                inheritInfo = enu
                                    .from(classInd)
                                    .distinct()
                                    // tslint:disable-next-line:no-string-literal
                                    .select(x => x['baseClass'].getName())
                                    .toJoinedString(' < ');
                            }
                            if (isInterface) {
                                inheritInfo += isClassed ? ' : ' : '';
                                inheritInfo += enu
                                    .from(interfaceInd)
                                    .distinct()
                                    .select(x => {
                                    // tslint:disable-next-line:no-string-literal
                                    const intf = x['interface'];
                                    if (intf instanceof ts_simple_ast_1.InterfaceDeclaration) {
                                        return intf.getName();
                                    }
                                    if (intf instanceof ts_simple_ast_1.ExpressionWithTypeArguments) {
                                        return intf.getText();
                                    }
                                })
                                    .toJoinedString(' : ');
                            }
                            overrideDecoration.isClassMember = isClassed;
                            overrideDecoration.isInterfaceMember = isInterface;
                            overrideDecoration.inheritInfo = inheritInfo;
                            this.updateDecorations(codeLens.uri);
                            const ref = isClassed ? classInd[0] : interfaceInd[0];
                            const firstRef = isClassed ? ref["baseClass"] : ref['interface'];
                            const file = firstRef.getSourceFile();
                            return new vscode_1.CodeLens(codeLens.range, {
                                command: 'tslens.gotoFile',
                                arguments: [
                                    file.getFilePath(),
                                    file.getLineNumberAtPos(ref.getPos())
                                ],
                                title: overrideDecoration.inheritInfo
                            });
                        }
                    }
                }
                return new vscode_1.CodeLens(codeLens.range, {
                    command: '',
                    title: ''
                });
            }
        });
    }
    updateDecorations(uri) {
        var isSameDocument = uri === vscode_1.window.activeTextEditor.document.uri;
        if (isSameDocument) {
            this.overrideDecorations.forEach((overrideDecoration, key) => {
                if (key.startsWith(uri.fsPath)) {
                    var decoration = overrideDecoration.decoration;
                    var ranges = overrideDecoration.ranges;
                    vscode_1.window.activeTextEditor.setDecorations(decoration, ranges);
                }
            });
        }
    }
}
TSCodeLensProvider.methods = new Map();
exports.TSCodeLensProvider = TSCodeLensProvider;
//# sourceMappingURL=TSCodeLensProvider.js.map