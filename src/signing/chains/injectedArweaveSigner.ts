import { Signer } from "..";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import Arweave from "arweave";
import base64url from "base64url";

const isString = (obj: any): boolean => {
  return Object.prototype.toString.call(obj) === "[object String]" ? true : false;
}

const checkArPermissions = async (windowArweaveWallet, permissions: string[] | string): Promise<void> => {
  let existingPermissions: string[] = []
  const checkPermissions = isString(permissions) ? [permissions] : permissions as string[]

  try {
    existingPermissions = await windowArweaveWallet.getPermissions()
  } catch {
    throw new Error("PLEASE_INSTALL_ARCONNECT")
  }

  if (checkPermissions.length === 0) {
    return
  }

  if (checkPermissions.some((permission: string) => {
    return !existingPermissions.includes(permission)
  })) {
    await windowArweaveWallet.connect(checkPermissions as never[])
  }
}

export default class InjectedArweaveSigner implements Signer {
  private signer: any;
  public publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.ARWEAVE].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.ARWEAVE].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.ARWEAVE;
 
  constructor(windowArweaveWallet: any) {
    this.signer = windowArweaveWallet;
  }

  async setPublicKey(): Promise<void> {
    try {
      await checkArPermissions(this.signer, ["ACCESS_PUBLIC_KEY"])
    } catch {
      throw new Error("ACCESS_PUBLIC_KEY_PERMISSION_NEEDED")
    }
    const arOwner = await this.signer.getActivePublicKey()
    this.publicKey = base64url.toBuffer(arOwner);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      await this.setPublicKey();
    }

    try {
      await checkArPermissions(this.signer, "SIGNATURE")
    } catch {
      throw new Error("SIGNATURE_PERMISSION_NEEDED")
    }

    const algorithm = {
      name: "RSA-PSS",
      saltLength: 0
    }

    try {
      const signature = await this.signer.signature(
        message,
        algorithm
      )
      const buf = new Uint8Array(Object.values(signature))
      return buf
    } catch {
      throw new Error("SIGNATURE_FAILED")
    }
  }

  static async verify(
    pk: string,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return await Arweave.crypto.verify(pk, message, signature);
  }
}
