import { createData } from "../ar-data-create";
import Bundle from "../Bundle";
import DataItem from "../DataItem";
import { EthereumSigner } from "../signing";
import { bundleAndSignData } from "../../index";



describe("bundle", () => {
    describe("given we have dataItems", () => {
        let dataItems: DataItem[] = [];
        const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
        beforeEach(async () => {
            const numDataItems = 10;
            dataItems = [];
            for (let i = 0; i < numDataItems; ++i) {
                dataItems.push(createData(`loremIpsumData_{i}`, signer));
            }
        });

        describe("and given we have a bundle", () => {
            let bundle: Bundle;
            beforeEach(async () => {
                bundle = await bundleAndSignData(dataItems, signer);
            });
            it("should contain the data for every data item", () => {
                for (let i = 0; i < dataItems.length; ++i) {
                    const bundleDataItem = bundle.get(i).getRaw();
                    const orgDataItem = dataItems[i].getRaw();
                    expect(bundleDataItem).toEqual(orgDataItem);
                }
            });
        });

        describe("and given we have a bundle with a single data item", () => {
            let bundle: Bundle;
            beforeEach(async () => {
                bundle = await bundleAndSignData([dataItems[0]], signer);
            });
            it("should contain the data for every data item", () => {
                expect(bundle.get(0).getRaw()).toEqual(dataItems[0].getRaw());
            });
        });

        describe("and given we have a bundle with no data items", () => {
            let bundle: Bundle;
            beforeEach(async () => {
                bundle = await bundleAndSignData([], signer);
            });
            it("should contain the data for every data item", () => {
                expect(bundle.get(0)).toThrow();
            });
        });
    });
});
