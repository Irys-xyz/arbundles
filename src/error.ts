export default class BundleError extends Error {
  constructor(message) {
    super(message);
    this.name = "BundleError";
  }
}
