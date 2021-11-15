"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleAndSignData = void 0;
const tslib_1 = require("tslib");
const tmp_promise_1 = require("tmp-promise");
const fs = tslib_1.__importStar(require("fs"));
const utils_1 = require("../build/utils");
const FileBundle_1 = tslib_1.__importDefault(require("./FileBundle"));
async function bundleAndSignData(dataItems, signer, dir) {
    const headerFile = await tmp_promise_1.file({ dir });
    const headerStream = fs.createWriteStream(headerFile.path);
    const files = new Array(dataItems.length);
    headerStream.write(utils_1.longTo32ByteArray(dataItems.length));
    for (const [index, item] of dataItems.entries()) {
        let dataItem;
        dataItem = item;
        if (!dataItem.isSigned()) {
            await dataItem.sign(signer);
        }
        files[index] = dataItem.filename;
        headerStream.write(Buffer.concat([utils_1.longTo32ByteArray(await dataItem.size()), dataItem.rawId]));
    }
    await new Promise((resolve) => headerStream.end(resolve));
    headerStream.close();
    return new FileBundle_1.default(headerFile.path, files);
}
exports.bundleAndSignData = bundleAndSignData;
//# sourceMappingURL=bundleData.js.map
