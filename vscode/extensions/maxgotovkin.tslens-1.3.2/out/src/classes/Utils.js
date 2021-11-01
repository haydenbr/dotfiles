"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enu = require("linq");
class Utils {
    /**
     * Agreegates symbol information including children
     * @param document
     * @param usedPositions
     * @param symbolInformations
     * @param symbols
     */
    static symbolsAggregator(document, usedPositions, symbolInformations, symbols = [], parent = null) {
        symbolInformations.forEach(x => {
            if (parent) {
                x.containerName = parent;
            }
            symbols.push(x);
            Utils.symbolsAggregator(document, usedPositions, x['children'] || [], symbols, x.name);
        });
        return symbols;
    }
    /**
     * Gets all interfaces inside a project
     * @param project The source project
     */
    static getInterfaces(project) {
        // project.getFileSystem();
        const res = enu
            .from(project.getSourceFiles())
            .select(x => {
            try {
                const ns = x.getNamespaces();
                if (ns.length > 0) {
                    return [].concat.apply([], ns.map(m => m.getInterfaces()));
                }
                else {
                    return x.getInterfaces();
                }
            }
            catch (error) {
                console.warn(`Error occured while trying to get interfaces from ${x.getFilePath()}. ${error}`);
                return [];
            }
        })
            .where(x => x.length > 0)
            .selectMany(x => x)
            .toArray();
        return res;
    }
    /**
     * Finds an interface by expression declaration of a interface
     * @param interfaces Interfaces list
     * @param x Expression
     */
    static findInterfaceByName(interfaces, x) {
        const iname = this.getInterfaceName(x);
        return interfaces.find(z => {
            try {
                return z.getName() === iname;
            }
            catch (error) {
                return false;
            }
        });
    }
    /**
     * Checks the project for interfaces changes
     * @param project Source project
     * @param locations File path's to search in
     */
    static checkInterfaces(project, locations) {
        let isChanged = false;
        enu
            .from(locations)
            .distinct()
            .forEach(p => {
            const interfaces = this.getInterfacesAtPath(project, p);
            const path = p.replace(/\\/g, '/');
            if (!enu
                .from(interfaces)
                .any(x => x.getSourceFile().getFilePath() === path) &&
                interfaces.length > 0) {
                interfaces.push(...interfaces);
                isChanged = true;
            }
        });
        return isChanged;
    }
    /**
     * Gets implementations for class
     * @param interfaces Interfaces list
     * @param cl Class
     */
    static getClassImplements(interfaces, cl) {
        const impls = cl.getImplements().map(x => {
            const intf = this.findInterfaceByName(interfaces, x);
            if (intf) {
                const fi = [
                    intf,
                    ...intf
                        .getExtends()
                        .map(z => this.findInterfaceByName(interfaces, z))
                        .filter(z => !!z)
                ];
                let mem = [].concat.apply([], fi.map(z => z.getMembers()));
                // tslint:disable-next-line:no-string-literal
                mem.forEach(z => (z['interface'] = x));
                return mem;
            }
            return [];
        });
        return [].concat.apply([], impls);
    }
    /**
     *
     * @param interfaces Gets class members (methods, fields, props) including base class members
     * @param startClass Initial class to start search for
     * @param cl For internal use!
     * @param arr For internal use!
     */
    static getClassMembers(interfaces, startClass, cl, arr) {
        arr = arr || this.getClassImplements(interfaces, cl || startClass);
        const bc = (cl || startClass).getBaseClass();
        if (bc) {
            const methods = bc.getMembers();
            // tslint:disable-next-line:no-string-literal
            methods.forEach(x => (x['baseClass'] = bc));
            arr.push(...this.getClassImplements(interfaces, bc), ...methods, ...this.getClassMembers(interfaces, startClass, bc, methods));
            return arr;
        }
        else {
            return this.getClassImplements(interfaces, cl || startClass);
        }
    }
    /**
     * Gets the interface declarations for a file
     * @param project Source project
     * @param path Path to search in
     */
    static getInterfacesAtPath(project, path) {
        const file = project.getSourceFile(path);
        return file
            ? enu
                .from(file.getNamespaces())
                .select(x => x.getInterfaces())
                .selectMany(x => x)
                .concat(file.getInterfaces())
                .toArray()
            : [];
    }
    /**
     * Gets the interface name from an expression
     * @param f Expression
     */
    static getInterfaceName(f) {
        // tslint:disable-next-line:no-string-literal
        if (f.compilerNode.expression['name']) {
            // tslint:disable-next-line:no-string-literal
            return f.compilerNode.expression['name'].escapedText.trim();
            // tslint:disable-next-line:no-string-literal
        }
        else if (f.compilerNode.expression['escapedText']) {
            // tslint:disable-next-line:no-string-literal
            return f.compilerNode.expression['escapedText'].trim();
        }
        else {
            return f.compilerNode.expression.getText().trim();
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map