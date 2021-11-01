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
    constructor(context) {
        this.context = context;
        this.unusedDecorations = new Map();
        this.overrideDecorations = new Map();
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
            this.clearDecorations(this.overrideDecorations);
            // if (settings.decorateunused) {
            //   var unusedDecoration = new TSDecoration();
            //   this.unusedDecorations.set(
            //     editor.document.uri.fsPath,
            //     unusedDecoration
            //   );
            //   unusedDecoration.decoration = vscode.window.createTextEditorDecorationType(
            //     {
            //       color: settings.unusedcolor
            //     }
            //   );
            // }
        }
    }
    provideCodeLenses(document, token) {
        var settings = this.config.settings;
        if (!this.config.TSLensEnabled) {
            return;
        }
        this.reinitDecorations();
        return vscode_1.commands
            .executeCommand('vscode.executeDocumentSymbolProvider', document.uri)
            .then(symbolInformations => {
            var usedPositions = [];
            return symbolInformations
                .filter(symbolInformation => {
                var knownInterest = (SymbolKindInterst[document.languageId]);
                if (!knownInterest) {
                    knownInterest = standardSymbolKindSet;
                }
                return knownInterest.indexOf(symbolInformation.kind) > -1;
            })
                .map(symbolInformation => {
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
                        return new MethodReferenceLens_1.MethodReferenceLens(new vscode_1.Range(range.start, range.end), document.uri);
                    }
                }
            })
                .filter(item => item != null);
        });
    }
    getClassMembers(cl, arr) {
        arr = arr || [];
        const bc = cl.getBaseClass();
        if (bc) {
            const methods = bc.getMembers();
            methods.forEach(x => (x['baseClass'] = bc));
            arr.push(...methods, ...this.getClassMembers(bc, methods));
            return arr;
        }
        else {
            return [];
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
    getImplemetsMembers(locations, filters) {
        const allInterfaces = enu
            .from(locations)
            .select(x => x.uri.fsPath)
            .distinct()
            .select(p => {
            const interfaces = this.getInterfacesAtPath(p);
            return interfaces;
        })
            .selectMany(x => x)
            .distinct(x => x.getName());
        let members = allInterfaces
            .select(x => {
            let imembers = x.getMembers();
            imembers = imembers.filter(f => f instanceof ts_simple_ast_1.PropertySignature || f instanceof ts_simple_ast_1.MethodSignature);
            imembers.forEach(m => (m['interface'] = x));
            return imembers;
        })
            .selectMany(x => x);
        const names = filters.map(f => f.compilerNode.expression.getText().trim());
        // var includes = enu.from(members).where(x => names.indexOf((x['interface'] as InterfaceDeclaration).getName()) > -1)
        // .select(x => {
        //   const intf = x['interface'] as InterfaceDeclaration;
        //   return [intf.getName(), ...intf.getExtends().map(x => x.compilerNode.expression.getText().trim())]
        // })
        // .selectMany(x => x)
        // .distinct();
        var includes = allInterfaces
            .where(x => names.indexOf(x.getName()) > -1)
            .select(intf => {
            return [
                intf.getName(),
                ...intf
                    .getExtends()
                    .map(x => x.compilerNode.expression.getText().trim())
            ];
        })
            .selectMany(x => x)
            .distinct();
        members = members.where(x => {
            const intf = x['interface'];
            return includes.any(x => x === intf.getName());
        });
        return members.toArray();
    }
    // extractClassInfo(file: SourceFile, className: string) {
    //   var cl = file.getClass(className);
    //   if (cl) {
    //     const bm = this.getClassMembers(cl).filter(
    //       x =>
    //         x instanceof PropertyDeclaration ||
    //         x instanceof MethodDeclaration
    //     ) as Array<PropertyDeclaration | MethodDeclaration>;
    //     const names = bm.map(x => x.getName());
    //     const members = [];
    //     const impl = cl.getImplements();
    //     for (let index = 0; index < impl.length; index++) {
    //       const i = impl[index];
    //       enu
    //         .from(nonBlackBoxedLocations)
    //         .distinct(x => x.uri.fsPath)
    //         .forEach(p => {
    //           const interfaces = project
    //             .getSourceFile(p.uri.fsPath)
    //             .getInterfaces();
    //           interfaces.forEach(x => {
    //             const imembers = x.getMembers();
    //             imembers.forEach(m => (m['interface'] = x));
    //             members.push(...imembers);
    //           });
    //         });
    //     }
    //     const isInterface =
    //       members.map(x => x.getName()).indexOf(testM) > -1;
    //     const isClassed = names.indexOf(testM) > -1;
    //     if (!isClassed && !isInterface) {
    //       const keysForDelete = [];
    //       this.overrideDecorations.forEach((value, key, x) => {
    //         if (
    //           key.startsWith(codeLens.uri.fsPath) &&
    //           key.endsWith(testM)
    //         ) {
    //           value.decoration.dispose();
    //           keysForDelete.push(key);
    //         }
    //       });
    //       keysForDelete.forEach(x =>
    //         this.overrideDecorations.delete(x)
    //       );
    //     }
    // }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof MethodReferenceLens_1.MethodReferenceLens) {
                const file = this.config.project.getSourceFile(vscode_1.window.activeTextEditor.document.fileName);
                // const locations = await commands.executeCommand<Location[]>('vscode.executeReferenceProvider', codeLens.uri, codeLens.range.start);
                // const symbols = await commands.executeCommand<SymbolInformation[]>('vscode.executeDocumentSymbolProvider', vscode.window.activeTextEditor.document.uri);
                const res = yield Promise.all([
                    vscode_1.commands.executeCommand('vscode.executeReferenceProvider', codeLens.uri, codeLens.range.start),
                    vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', vscode_1.window.activeTextEditor.document.uri)
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
                let isInherited = false;
                let inheritedBase = '';
                const testM = vscode_1.window.activeTextEditor.document.getText(codeLens.range);
                const filtered = symbols.find(x => x.location.range.contains(codeLens.range) && testM === x.name);
                if (this.config.project) {
                    if (filtered.kind === vscode_1.SymbolKind.Method ||
                        filtered.kind === vscode_1.SymbolKind.Field ||
                        filtered.kind === vscode_1.SymbolKind.Property) {
                        var cl = file.getClass(filtered.containerName);
                        if (cl) {
                            const bm = this.getClassMembers(cl).filter(x => x instanceof ts_simple_ast_1.PropertyDeclaration ||
                                x instanceof ts_simple_ast_1.MethodDeclaration);
                            const names = bm.map(x => x.getName());
                            const impls = cl.getImplements();
                            const members = impls.length > 0
                                ? this.getImplemetsMembers(nonBlackBoxedLocations, impls)
                                : [];
                            const isInterface = members.map(x => x.getName()).indexOf(testM) > -1;
                            const isClassed = names.indexOf(testM) > -1;
                            if (!isClassed && !isInterface) {
                                const keysForDelete = [];
                                this.overrideDecorations.forEach((value, key, x) => {
                                    if (key.startsWith(codeLens.uri.fsPath) &&
                                        key.endsWith(`${codeLens.range.start.line}_${testM}`)) {
                                        value.decoration.dispose();
                                        keysForDelete.push(key);
                                    }
                                });
                                keysForDelete.forEach(x => {
                                    this.overrideDecorations.get(x).decoration.dispose();
                                    this.overrideDecorations.delete(x);
                                });
                            }
                            if (isClassed || isInterface) {
                                var editor = vscode_1.window.activeTextEditor;
                                if (editor != null) {
                                    const gutterType = isInterface
                                        ? 'implementInterface'
                                        : filtered.kind === vscode_1.SymbolKind.Method
                                            ? 'methodEdit'
                                            : 'fieldEdit';
                                    const key = `${codeLens.uri.fsPath}_${codeLens.range.start.line}_${testM}`;
                                    if (this.overrideDecorations.has(key)) {
                                        var decorationsForFile = this.overrideDecorations.get(key);
                                        decorationsForFile.ranges = [codeLens.range];
                                        // decorationsForFile.decoration.dispose();
                                        // this.overrideDecorations.delete(key);
                                    }
                                    else {
                                        var overrideDecoration = new TSDecoration();
                                        this.overrideDecorations.set(key, overrideDecoration);
                                        overrideDecoration.decoration = vscode_1.window.createTextEditorDecorationType({
                                            backgroundColor: isInterface
                                                ? 'rgba(144, 192, 2, 0.35)'
                                                : filtered.kind === vscode_1.SymbolKind.Method
                                                    ? 'rgba(209, 0, 0, 0.35)'
                                                    : 'rgba(0, 123, 168, 0.35)',
                                            gutterIconPath: this.context.asAbsolutePath(`images/${gutterType}.svg`)
                                        });
                                        overrideDecoration.ranges.push(codeLens.range);
                                    }
                                    isInherited = true;
                                    if (isInterface) {
                                        inheritedBase = enu
                                            .from(members
                                            .filter(x => x.getName() === testM)
                                            .map(x => x['interface'].getName()))
                                            .distinct()
                                            .toJoinedString(' < ');
                                    }
                                    else if (isClassed) {
                                        inheritedBase = enu
                                            .from(bm
                                            .filter(x => x.getName() === testM)
                                            .map(x => x['baseClass'].getName()))
                                            .distinct()
                                            .toJoinedString(' < ');
                                    }
                                }
                            }
                        }
                    }
                }
                //   let declar;
                //   switch(filtered.kind) {
                //     case SymbolKind.Class:
                //       declar = 'class';break;
                //       case SymbolKind.Interface:
                //       declar = 'interface';break;
                //       case SymbolKind.Method:
                //       declar = 'method';break;
                //   }
                //   const key = `${
                //     codeLens.uri.fsPath
                //   }_${codeLens.range.start.line}_${testM}`;
                //   if(declar && !this.overrideDecorations.has(key)) {
                //   var overrideDecoration = new TSDecoration();
                //   this.overrideDecorations.set(key, overrideDecoration);
                //   overrideDecoration.decoration = vscode.window.createTextEditorDecorationType(
                //     {
                //       gutterIconPath: context.asAbsolutePath(
                //         `images/${declar}.svg`
                //       )
                //     }
                //   );
                //   overrideDecoration.ranges.push(codeLens.range);
                // }
                if (isInherited) {
                    message += ' :: ' + inheritedBase;
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
            //this.clearDecorations(this.overrideDecorations);
            this.overrideDecorations.forEach((overrideDecoration, key) => {
                if (key.startsWith(uri.fsPath)) {
                    var decoration = overrideDecoration.decoration;
                    var overrideDecorations = overrideDecoration.ranges;
                    vscode_1.window.activeTextEditor.setDecorations(decoration, overrideDecorations);
                }
            });
        }
    }
}
exports.TSCodeLensProvider = TSCodeLensProvider;
//# sourceMappingURL=TSCodeLensProvider.js.map