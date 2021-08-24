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
        { name: "value", type: "string" }
    ]
});
exports.tagsParser = avro.Type.forSchema({
    type: "array",
    items: exports.tagParser
});
async function serializeTags(tags) {
    if (tags.length == 0) {
        return new Uint8Array(0);
    }
    return Uint8Array.from(exports.tagsParser.toBuffer(tags));
}
exports.serializeTags = serializeTags;
//# sourceMappingURL=parser.js.map