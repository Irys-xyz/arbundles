"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ArweaveBundles = tslib_1.__importStar(require(".."));
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const buffer_1 = require("buffer");
const wallet0 = JSON.parse(fs_1.readFileSync(path_1.default.join(__dirname, "test_key0.json")).toString());
describe("Creating and indexing a data item", function () {
    it("Create and get", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _d = {
                data: "tasty",
                target: "Math.randomgng(36).substring(30)",
                anchor: "Math.apt'#]gng(36).substring(30)",
                tags: [{ name: "x", value: "y" }]
            };
            const d = yield ArweaveBundles.createData(_d, wallet0);
            expect(buffer_1.Buffer.from(d.getData()).toString()).toBe("tasty");
            expect(d.getOwner()).toBe(wallet0.n);
            expect(buffer_1.Buffer.from(d.getTarget()).toString()).toBe("Math.randomgng(36).substring(30)");
            expect(d.getAnchor()).toEqual(Uint8Array.from(buffer_1.Buffer.from("Math.apt'#]gng(36).substring(30)")));
            expect(d.getTags()).toEqual([{ name: "x", value: "y" }]);
        });
    });
    // TODO: Test whole process
    it("Test Bundle", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _dataItems = [{
                    data: "tasty",
                    target: "Math.randomgng(36).substring(30)",
                    anchor: "Math.randomgng(36).substring(30)",
                    tags: [{ name: "x", value: "y" }]
                }];
            const bundle = yield ArweaveBundles.bundleAndSignData(_dataItems, wallet0);
            const dataItems = bundle.getAll();
            console.log(bundle.get(0).getOwner());
            expect(bundle.length).toEqual(1);
            expect(dataItems.length).toEqual(1);
            expect(buffer_1.Buffer.from(dataItems[0].getData()).toString()).toBe("tasty");
            expect(dataItems[0].getOwner()).toBe(wallet0.n);
            expect(buffer_1.Buffer.from(dataItems[0].getTarget()).toString()).toBe("Math.randomgng(36).substring(30)");
            expect(dataItems[0].getAnchor()).toEqual(Uint8Array.from(buffer_1.Buffer.from("Math.randomgng(36).substring(30)")));
            expect(dataItems[0].getTags()).toEqual([{ name: "x", value: "y" }]);
        });
    });
});
//# sourceMappingURL=tests.spec.js.map