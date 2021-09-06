import Rsa4096Pss from './keys/Rsa4096Pss';
import { Signer } from './Signer';

interface IndexToType {
  [key: number]: {
    new(...args: any[]): Signer;
    verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
  };
}

export const indexToType: IndexToType = {
  1: Rsa4096Pss
};
