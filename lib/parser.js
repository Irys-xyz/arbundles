"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsParser = exports.tagParser = void 0;
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
//# sourceMappingURL=parser.js.map