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
const AppConfiguration_1 = require("./AppConfiguration");
const MethodReferenceLens_1 = require("./MethodReferenceLens");
const ts_simple_ast_1 = require("ts-simple-ast");
const minimatch = require("minimatch");
const enu = require("linq");
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
const SymbolKindInterst = {
    scss: cssSymbolKindSet,
    less: cssSymbolKindSet,
    ts: standardSymbolKindSet,
    js: standardSymbolKindSet
};
class TSDecoration {
    constructor() {
        this.ranges = [];
    }
}
exports.TSDecoration = TSDecoration;
class TSCodeLensProvider {
    constructor(provider, context) {
        this.provider = provider;
        this.context = context;
        this.overrideDecorations = new Map();
        this.classCache = new Map();
        this.config = new AppConfiguration_1.AppConfiguration();
        this.interfaces = enu
            .from(this.config.project.getSourceFiles())
            .select(x => x.getInterfaces())
            .where(x => x.length > 0)
            .selectMany(x => x)
            .toArray();
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
            this.clearDecorations(this.overrideDecorations);
        }
    }
    setupCodeLens(codeLens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const file = this.config.project.getSourceFile(vscode_1.window.activeTextEditor.document.fileName);
                const res = yield Promise.all([
                    vscode_1.commands.executeCommand('vscode.executeReferenceProvider', codeLens.uri, codeLens.range.start),
                    vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', codeLens.uri)
                ]);
                const locations = res[0];
                const symbols = res[1];
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
                const testM = vscode_1.window.activeTextEditor.document.getText(codeLens.range);
                const isChanged = this.updateInterfaces([
                    ...nonBlackBoxedLocations.map(x => x.uri.fsPath),
                    ...file
                        .getImportDeclarations()
                        .map(x => x.getModuleSpecifierSourceFile().getFilePath())
                ]);
                const filtered = symbols.find(x => x.location.range.contains(codeLens.range) && testM === x.name);
                if (this.config.project) {
                    if (filtered.kind === vscode_1.SymbolKind.Method ||
                        filtered.kind === vscode_1.SymbolKind.Field ||
                        filtered.kind === vscode_1.SymbolKind.Property) {
                        var cl = file.getClass(filtered.containerName);
                        if (cl) {
                            let members = [];
                            const key = `${cl.getName()}_${cl.getSourceFile().getFilePath()}`;
                            if (this.classCache.has(key) && !isChanged) {
                                members = this.classCache.get(key);
                            }
                            else {
                                try {
                                    members = this.getClassMembers(cl);
                                    this.classCache.set(key, members);
                                }
                                catch (error) {
                                    console.log(error);
                                }
                            }
                            const classMembers = members.filter(x => x instanceof ts_simple_ast_1.PropertyDeclaration ||
                                x instanceof ts_simple_ast_1.MethodDeclaration);
                            const interfaceMembers = members.filter(x => x instanceof ts_simple_ast_1.PropertySignature || x instanceof ts_simple_ast_1.MethodSignature);
                            const classInd = classMembers
                                .filter(x => x.getName() === testM)
                                .map(x => x['baseClass'].getName());
                            const interfaceInd = interfaceMembers
                                .filter(x => x.getName() === testM)
                                .map(x => x['interface'].getName());
                            const isClassed = classInd.length > 0;
                            const isInterface = interfaceInd.length > 0;
                            if (!isClassed && !isInterface) {
                                const keysForDelete = [];
                                this.overrideDecorations.forEach((value, key, x) => {
                                    if (key.startsWith(codeLens.uri.fsPath) /*&&
                                  key.endsWith(`${codeLens.range.start.line}_${testM}`*/) {
                                        //value.decoration.dispose();
                                        keysForDelete.push(key);
                                    }
                                });
                                keysForDelete.forEach(x => {
                                    this.overrideDecorations.get(x).decoration.dispose();
                                    this.overrideDecorations.delete(x);
                                });
                            }
                            if (isClassed || isInterface) {
                                codeLens.isClassed = isClassed;
                                codeLens.isInterface = isInterface;
                                codeLens.interfaceInd = interfaceInd;
                                codeLens.classInd = classInd;
                                codeLens.testName = testM;
                                codeLens.symbolInfo = filtered;
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
            var filterAsync = (array, filter) => Promise.all(array.map(entry => filter(entry))).then(bits => array.filter(entry => bits.shift()));
            const f = filterAsync(codeLenses, x => this.setupCodeLens(x));
            return f;
        }));
    }
    findInterfaceByName(x) {
        const iname = this.getInterfaceName(x);
        return enu.from(this.interfaces).firstOrDefault(z => {
            try {
                return z.getName() === iname;
            }
            catch (error) {
                return false;
            }
        });
    }
    updateInterfaces(locations) {
        let isChanged = false;
        enu
            .from(locations)
            .distinct()
            .forEach(p => {
            const interfaces = this.getInterfacesAtPath(p);
            const path = p.replace(/\\/g, '/');
            if (!enu
                .from(this.interfaces)
                .any(x => x.getSourceFile().getFilePath() === path) && interfaces.length > 0) {
                this.interfaces.push(...interfaces);
                isChanged = true;
            }
        });
        return isChanged;
    }
    getClassImplements(cl) {
        return enu
            .from(cl.getImplements())
            .select(x => this.findInterfaceByName(x))
            .where(x => !!x)
            .select(x => {
            return [x, ...x.getExtends().map(z => this.findInterfaceByName(z))];
        })
            .selectMany(x => x)
            .where(x => !!x)
            .select(x => {
            let mem = x.getMembers();
            mem.forEach(z => (z['interface'] = x));
            return mem;
        })
            .selectMany(x => x)
            .toArray();
    }
    getClassMembers(cl, arr) {
        arr = arr || this.getClassImplements(cl);
        const bc = cl.getBaseClass();
        if (bc) {
            const methods = bc.getMembers();
            methods.forEach(x => (x['baseClass'] = bc));
            arr.push(...this.getClassImplements(bc), ...methods, ...this.getClassMembers(bc, methods));
            return arr;
        }
        else {
            return this.getClassImplements(cl);
        }
    }
    getInterfacesAtPath(path) {
        const file = this.config.project.getSourceFile(path);
        return enu
            .from(file.getNamespaces())
            .select(x => x.getInterfaces())
            .selectMany(x => x)
            .concat(file.getInterfaces())
            .toArray();
    }
    getInterfaceName(f) {
        if (f.compilerNode.expression['name']) {
            return f.compilerNode.expression['name'].escapedText.trim();
        }
        else if (f.compilerNode.expression['escapedText']) {
            return f.compilerNode.expression['escapedText'].trim();
        }
        else {
            return f.compilerNode.expression.getText().trim();
        }
    }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const ff = yield this.setupCodeLens(codeLens);
                if (ff) {
                    const isClassed = codeLens.isClassed;
                    const isInterface = codeLens.isInterface;
                    const filtered = codeLens.symbolInfo;
                    const testM = codeLens.testName;
                    const classInd = codeLens.classInd;
                    const interfaceInd = codeLens.interfaceInd;
                    if (isClassed || isInterface) {
                        var editor = vscode_1.window.activeTextEditor;
                        if (editor != null) {
                            const gutterType = isClassed
                                ? filtered.kind === vscode_1.SymbolKind.Method
                                    ? 'methodEdit'
                                    : 'fieldEdit'
                                : 'implementInterface';
                            const key = `${codeLens.uri.fsPath}_${codeLens.range.start.line}_${testM}`;
                            let overrideDecoration;
                            if (this.overrideDecorations.has(key)) {
                                overrideDecoration = this.overrideDecorations.get(key);
                                overrideDecoration.ranges = [codeLens.range];
                                // decorationsForFile.decoration.dispose();
                                // this.overrideDecorations.delete(key);
                            }
                            else {
                                overrideDecoration = new TSDecoration();
                                this.overrideDecorations.set(key, overrideDecoration);
                                overrideDecoration.decoration = vscode_1.window.createTextEditorDecorationType({
                                    backgroundColor: isClassed
                                        ? filtered.kind === vscode_1.SymbolKind.Method
                                            ? 'rgba(209, 0, 0, 0.35)'
                                            : 'rgba(0, 123, 168, 0.35)'
                                        : 'rgba(144, 192, 2, 0.35)',
                                    gutterIconPath: this.context.asAbsolutePath(`images/${gutterType}.svg`)
                                });
                                overrideDecoration.ranges.push(codeLens.range);
                            }
                            var inheritedBase = '';
                            if (isClassed) {
                                inheritedBase = enu
                                    .from(classInd)
                                    .distinct()
                                    .toJoinedString(' < ');
                            }
                            if (isInterface) {
                                inheritedBase += isClassed ? ' : ' : '';
                                inheritedBase += enu
                                    .from(interfaceInd)
                                    .distinct()
                                    .toJoinedString(' : ');
                            }
                            overrideDecoration.isClassMember = isClassed;
                            overrideDecoration.isInterfaceMember = isInterface;
                            overrideDecoration.inheritInfo = inheritedBase;
                            this.updateDecorations(codeLens.uri);
                            return new vscode_1.CodeLens(codeLens.range, {
                                command: 'tslens.showOverrides',
                                title: overrideDecoration.inheritInfo
                            });
                        }
                    }
                }
                return new vscode_1.CodeLens(codeLens.range, {
                    command: '',
                    title: ''
                });
                // const range = new Range(
                //   codeLens.range.start.line,
                //   codeLens.range.start.character,
                //   codeLens.range.end.line,
                //   codeLens.range.end.character
                // );
                // if (amount == 0 && filteredLocations.length != 0) {
                //   return new CodeLens(range, {
                //     command: '',
                //     title: settings.blackboxTitle
                //   });
                // } else if (amount > 0) {
                //   return new CodeLens(range, {
                //     command: 'editor.action.showReferences',
                //     title: message,
                //     arguments: [
                //       codeLens.uri,
                //       codeLens.range.start,
                //       nonBlackBoxedLocations
                //     ]
                //   });
                // } else {
                //   return new CodeLens(range, {
                //     command: 'editor.action.findReferences',
                //     title: message,
                //     arguments: [codeLens.uri, codeLens.range.start]
                //   });
                // }
            }
        });
    }
    updateDecorations(uri) {
        var isSameDocument = uri == vscode_1.window.activeTextEditor.document.uri;
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
exports.TSCodeLensProvider = TSCodeLensProvider;
//# sourceMappingURL=TSCodeLensProvider.js.map