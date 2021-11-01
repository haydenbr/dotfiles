"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TSLensConfiguration {
    constructor() {
        this.blackbox = [];
        this.blackboxTitle = '<< called from blackbox >>';
        this.excludeself = true;
        this.singular = '{0} reference';
        this.plural = '{0} references';
        this.noreferences = 'no references found for {0}';
        this.unusedcolor = '#999';
        this.decorateunused = true;
    }
}
exports.TSLensConfiguration = TSLensConfiguration;
//# sourceMappingURL=TSLensConfiguration.js.map