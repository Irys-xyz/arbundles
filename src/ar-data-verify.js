"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyData = exports.verifyBundle = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
function verifyBundle(bundle) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        assert_1.default(bundle == bundle);
        return true;
    });
}
exports.verifyBundle = verifyBundle;
function verifyData(item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        assert_1.default(item == item);
        return true;
    });
}
exports.verifyData = verifyData;
//# sourceMappingURL=ar-data-verify.js.map