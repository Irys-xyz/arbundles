export abstract class Signer {
  readonly publicKey: Buffer;
  readonly signatureType: number;
  readonly signatureLength: number;
  readonly ownerLength: number;
  readonly pem?: string | Buffer;

  abstract sign(message: Uint8Array): Promise<Uint8Array> | Uint8Array;
  static verify(_: string | Buffer): boolean {
    throw new Error("You must implement verify method on child");
  }
}
