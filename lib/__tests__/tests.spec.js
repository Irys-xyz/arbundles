"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const buffer_1 = require("buffer");
const __1 = require("..");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const wallet0 = JSON.parse(fs_1.readFileSync(path_1.default.join(__dirname, "test_key0.json")).toString());
describe("Creating and indexing a data item", function () {
    it("Create and get", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _d = {
                data: "tasty",
                target: "Math.randomgng(36).substring(30)",
                anchor: "Math.apt'#]gng(36).substring(30)"
            };
            const d = yield __1.createData(_d, wallet0);
            expect(buffer_1.Buffer.from(d.getData()).toString()).toBe("tasty");
            expect(d.getOwner()).toBe(wallet0.n);
            expect(d.getTarget()).toBe("Math.randomgng(36).substring(30)");
            expect(d.getAnchor()).toEqual("Math.apt'#]gng(36).substring(30)");
            expect(d.getTags()).toEqual([]);
            expect(__1.DataItem.verify(d.getRaw())).toEqual(true);
        });
    });
    it("Test Bundle", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _dataItems = [{
                    data: "tasty",
                    target: "Math.randomgng(36).substring(30)",
                    anchor: "Math.randomgng(36).substring(30)",
                    tags: [{ name: "x", value: "y" }]
                }];
            const bundle = yield __1.bundleAndSignData(_dataItems, wallet0);
            const dataItems = bundle.getAll();
            expect(bundle.length).toEqual(1);
            expect(dataItems.length).toEqual(1);
            expect(buffer_1.Buffer.from(dataItems[0].getData()).toString()).toBe("tasty");
            expect(dataItems[0].getOwner()).toBe(wallet0.n);
            expect(buffer_1.Buffer.from(dataItems[0].getTarget()).toString()).toBe("Math.randomgng(36).substring(30)");
            expect(dataItems[0].getAnchor()).toEqual("Math.randomgng(36).substring(30)");
            expect(dataItems[0].getTags()).toEqual([{ name: "x", value: "y" }]);
            expect(__1.DataItem.verify(dataItems[0].getRaw())).toEqual(true);
        });
    });
    it("Test bugs", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bundle = yield __1.bundleAndSignData([
                { data: "1984" },
                { data: "4242" },
            ], wallet0);
            console.log(bundle.get(1).getData());
            expect(bundle.get(1).getData()).toEqual(buffer_1.Buffer.from("4242"));
        });
    });
    it("Test encoding", function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(buffer_1.Buffer.from(base64url_1.default.decode("pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A", "hex"), "hex").length);
        });
    });
});
//# sourceMappingURL=tests.spec.js.map