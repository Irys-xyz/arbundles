import { BundleItem } from "../BundleItem";
describe("given we have the abstract class BundleItem", () => {
  describe("and given we call the static verify", () => {
    it("should throw", async () => {
      await expect(BundleItem.verify("")).rejects.toThrowError("You must implement `verify`");
    });
  });
});
