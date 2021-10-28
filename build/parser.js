"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTags = exports.tagsParser = exports.tagParser = void 0;
const tslib_1 = require("tslib");
const avro = tslib_1.__importStar(require("avsc"));
exports.tagParser = avro.Type.forSchema({
    type: "record",
    name: "Tag",
    fields: [
        { name: "name", type: "string" },
        { name: "value", type: "string" },
    ],
});
exports.tagsParser = avro.Type.forSchema({
    type: "array",
    items: exports.tagParser,
});
function serializeTags(tags) {
    if (tags.length == 0) {
        return new Uint8Array(0);
    }
    let tagsBuffer;
    try {
        tagsBuffer = exports.tagsParser.toBuffer(tags);
    }
    catch (e) {
        throw new Error("Incorrect tag format used. Make sure your tags are { name: string!, name: string! }[]");
    }
    return Uint8Array.from(tagsBuffer);
}
exports.serializeTags = serializeTags;
//# sourceMappingURL=parser.js.map