import BundleError from "../error";

describe("given we have a BundleError instance", () => {
  let bundleError: BundleError;
  beforeEach(() => {
    bundleError = new BundleError("test");
  });
  describe("given we access name", () => {
    it("should return the name", () => {
      expect(bundleError.name).toEqual("BundleError");
    });
  });
  describe("given we access message", () => {
    it("should return the message", () => {
      expect(bundleError.message).toEqual("test");
    });
  });
  describe("given we throw the error", () => {
    it("should return the error", () => {
      expect(() => {
        throw bundleError;
      }).toThrowError("test");
    });
  });
});
