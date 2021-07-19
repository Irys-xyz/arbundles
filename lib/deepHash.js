"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashStream = void 0;
const tslib_1 = require("tslib");
// In TypeScript 3.7, could be written as a single type:
// `type DeepHashChunk = Uint8Array | DeepHashChunk[];`
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const crypto = tslib_1.__importStar(require("crypto"));
const stream_1 = require("stream");
const promises_1 = require("stream/promises");
function deepHash(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (typeof data[Symbol.asyncIterator] === 'function') {
            const _data = data;
            const context = crypto.createHash('sha384');
            let length = 0;
            yield promises_1.pipeline(stream_1.Transform.from(_data), function (chunkedSource) {
                var chunkedSource_1, chunkedSource_1_1;
                var e_1, _a;
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    try {
                        for (chunkedSource_1 = tslib_1.__asyncValues(chunkedSource); chunkedSource_1_1 = yield chunkedSource_1.next(), !chunkedSource_1_1.done;) {
                            const chunk = chunkedSource_1_1.value;
                            length += chunk.byteLength;
                            context.update(chunk);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (chunkedSource_1_1 && !chunkedSource_1_1.done && (_a = chunkedSource_1.return)) yield _a.call(chunkedSource_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            });
            const tag = arweave_1.default.utils.concatBuffers([
                arweave_1.default.utils.stringToBuffer('blob'),
                arweave_1.default.utils.stringToBuffer(length.toString()),
            ]);
            console.log(yield hashStream(_data));
            const taggedHash = arweave_1.default.utils.concatBuffers([
                yield arweave_1.default.crypto.hash(tag, 'SHA-384'),
                context.digest(),
            ]);
            return yield arweave_1.default.crypto.hash(taggedHash, 'SHA-384');
        }
        else if (Array.isArray(data)) {
            const tag = arweave_1.default.utils.concatBuffers([
                arweave_1.default.utils.stringToBuffer('list'),
                arweave_1.default.utils.stringToBuffer(data.length.toString()),
            ]);
            return yield deepHashChunks(data, yield arweave_1.default.crypto.hash(tag, 'SHA-384'));
        }
        const _data = data;
        const tag = arweave_1.default.utils.concatBuffers([
            arweave_1.default.utils.stringToBuffer('blob'),
            arweave_1.default.utils.stringToBuffer(_data.byteLength.toString()),
        ]);
        console.log(yield arweave_1.default.crypto.hash(_data, 'SHA-384'));
        const taggedHash = arweave_1.default.utils.concatBuffers([
            yield arweave_1.default.crypto.hash(tag, 'SHA-384'),
            yield arweave_1.default.crypto.hash(_data, 'SHA-384'),
        ]);
        return yield arweave_1.default.crypto.hash(taggedHash, 'SHA-384');
    });
}
exports.default = deepHash;
function deepHashChunks(chunks, acc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (chunks.length < 1) {
            return acc;
        }
        const hashPair = arweave_1.default.utils.concatBuffers([
            acc,
            yield deepHash(chunks[0]),
        ]);
        const newAcc = yield arweave_1.default.crypto.hash(hashPair, 'SHA-384');
        return yield deepHashChunks(chunks.slice(1), newAcc);
    });
}
function hashStream(stream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const context = crypto.createHash('sha384');
        yield promises_1.pipeline(stream_1.Transform.from(stream), function (chunkedSource) {
            var chunkedSource_2, chunkedSource_2_1;
            var e_2, _a;
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    for (chunkedSource_2 = tslib_1.__asyncValues(chunkedSource); chunkedSource_2_1 = yield chunkedSource_2.next(), !chunkedSource_2_1.done;) {
                        const chunk = chunkedSource_2_1.value;
                        console.log(chunk);
                        context.update(chunk);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (chunkedSource_2_1 && !chunkedSource_2_1.done && (_a = chunkedSource_2.return)) yield _a.call(chunkedSource_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            });
        });
        return context.digest();
    });
}
exports.hashStream = hashStream;
//# sourceMappingURL=deepHash.js.map