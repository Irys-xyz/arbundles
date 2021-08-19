"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const buffer_1 = require("buffer");
const __1 = require("..");
const fs = tslib_1.__importStar(require("fs"));
const ar_data_verify_1 = require("../ar-data-verify");
const file_1 = require("../file");
const wallet0 = JSON.parse(fs_1.readFileSync(path_1.default.join(__dirname, 'test_key0.json')).toString());
describe('Creating and indexing a data item', function () {
    it('Create and get', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _d = {
                data: 'tasty',
                target: 'pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A',
                anchor: 'Math.apt\'#]gng(36).substring(30)',
            };
            const d = yield __1.createData(_d, wallet0);
            expect(buffer_1.Buffer.from(d.rawData).toString()).toBe('tasty');
            expect(d.owner).toBe(wallet0.n);
            expect(d.target).toBe('pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A');
            expect(d.anchor).toEqual('Math.apt\'#]gng(36).substring(30)');
            expect(d.tags).toEqual([]);
            expect(__1.DataItem.verify(d.getRaw())).toEqual(true);
        });
    });
    it('Test Bundle', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _dataItems = [{
                    data: 'tasty',
                    target: 'pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A',
                    anchor: 'Math.randomgng(36).substring(30)',
                    tags: [{ name: 'x', value: 'y' }],
                }];
            const bundle = yield __1.bundleAndSignData(_dataItems, wallet0);
            const dataItems = bundle.items;
            expect(bundle.length).toEqual(1);
            expect(dataItems.length).toEqual(1);
            expect(buffer_1.Buffer.from(dataItems[0].rawData).toString()).toBe('tasty');
            expect(dataItems[0].owner).toBe(wallet0.n);
            expect(buffer_1.Buffer.from(dataItems[0].target).toString()).toBe('pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A');
            expect(dataItems[0].anchor).toEqual('Math.randomgng(36).substring(30)');
            expect(dataItems[0].tags).toEqual([{ name: 'x', value: 'y' }]);
            expect(__1.DataItem.verify(dataItems[0].getRaw())).toEqual(true);
        });
    });
    it('Test bugs', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bundle = yield __1.bundleAndSignData([
                { data: '1984' },
                { data: '4242' },
            ], wallet0);
            console.log(bundle.get(1).rawData);
            expect(bundle.get(1).rawData).toEqual(buffer_1.Buffer.from('4242'));
        });
    });
    it('Test file verification', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const _d = {
                data: 'tasty',
                anchor: 'Math.apt\'#]gng(36).substring(30)',
            };
            const d = yield __1.createData(_d, wallet0);
            const binary = d.getRaw();
            fs.writeFileSync('test', binary);
            const fileBinary = fs.readFileSync('test');
            expect(fileBinary).toEqual(binary);
            expect(__1.DataItem.verify(fileBinary)).toEqual(true);
            expect(yield ar_data_verify_1.verifyDataItemInFile('test')).toEqual(true);
        });
    });
    it('Test failed file verification', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            fs.writeFileSync('test', buffer_1.Buffer.from('hi'));
            const fileBinary = fs.readFileSync('test');
            expect(__1.DataItem.verify(fileBinary)).toEqual(false);
            expect(yield ar_data_verify_1.verifyDataItemInFile('test')).toEqual(false);
        });
    });
    it('Test file helpers', function () {
        var e_1, _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bundle = yield __1.bundleAndSignData([
                { data: '1984', tags: [{ name: "gdf", value: "gfgdf" }] },
                { data: '4242' },
            ], wallet0);
            const filename = './testfile';
            fs.writeFileSync(filename, bundle.getRaw());
            const count = yield file_1.numberOfItems(filename);
            let cumulativeOffset = 32 + (64 * count);
            console.log(cumulativeOffset);
            try {
                for (var _b = tslib_1.__asyncValues(file_1.getHeaders(filename)), _c; _c = yield _b.next(), !_c.done;) {
                    const { offset } = _c.value;
                    console.log(offset);
                    console.log(yield __1.getTags(filename, { offset: cumulativeOffset }));
                    cumulativeOffset += offset;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    });
});
//# sourceMappingURL=tests.spec.js.map