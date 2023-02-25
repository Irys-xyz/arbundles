import DataItem from "../DataItem";

describe("DataItem", () => {
    describe("given we have a dataItem", () => {
        it("should return the correct data", () => {
            const data = "123";
            const u = createData
            const item = new DataItem(Buffer.from(data));
            expect(item.data).toEqual(data);
        });
    });
});