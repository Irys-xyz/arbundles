import { Signer } from "./Signer";
import ArweaveSigner from './chains';

interface IndexToType {
  [key: number]: {
    new (...args: any[]): Signer;
    verify(
      pk: string | Buffer,
      message: Uint8Array,
      signature: Uint8Array
    ): Promise<boolean>;
  };
}

export const indexToType: IndexToType = {
  1: ArweaveSigner,
};
