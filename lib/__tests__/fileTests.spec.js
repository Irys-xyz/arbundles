"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const file_1 = require("../file");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const ArweaveSigner_1 = tslib_1.__importDefault(require("../signing/chains/arweave/ArweaveSigner"));
const wallet0 = JSON.parse(fs_1.readFileSync(path_1.default.join(__dirname, 'test_key0.json')).toString());
describe("file tests", function () {
    it("should get all correct data", async function () {
        const signer = new ArweaveSigner_1.default(wallet0);
        const d = { data: "hi" };
        const data = await file_1.createData(d, signer);
        expect(data.signatureType).toEqual(1);
        expect(data.owner).toEqual(wallet0.n);
        expect(data.anchor).toEqual("");
        expect(data.tags).toEqual([]);
        expect(data.target).toEqual("");
        expect(data.rawData.toString()).toEqual("hi");
    });
    it("should bundle correctly", async function () {
        const signer = new ArweaveSigner_1.default(wallet0);
        const d = [{ data: "hi" }];
        const bundle = await file_1.bundleAndSignData(d, signer);
        console.log(bundle);
    });
});
//# sourceMappingURL=fileTests.spec.js.map