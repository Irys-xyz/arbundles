import Rsa4096Pss from "./keys/Rsa4096Pss";
import { Signer } from "./Signer";
import Curve25519 from './keys/curve25519';

interface IndexToType {
  [key: number]: {
    new (...args: any[]): Signer;
    verify(
      pk: string | Uint8Array,
      message: Uint8Array,
      signature: Uint8Array
    ): Promise<boolean>;
  };
}

export const indexToType: IndexToType = {
  1: Rsa4096Pss,
  2: Curve25519
};
