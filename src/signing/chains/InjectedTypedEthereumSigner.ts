import { verifyTypedData } from "ethers/lib/utils";
import InjectedEthereumSigner from "./injectedEthereumSigner";

export default class InjectedTypedEthereumSigner extends InjectedEthereumSigner {
  private address: string;
  constructor(signer: any) {
    super(signer);
  }

  async ready(): Promise<void> {
    this.address = await this.signer.getAddress();
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const s = await this.signer._signTypedData(domain, types, {
      address: this.address,
      message,
    });

    const btest = Buffer.from(s.slice(2), "hex");
    return btest;
    // const hash = _TypedDataEncoder.hash(domain, types, { address: this.address, message });
    // console.log({ hash });
    // const sig = await super.sign(Buffer.from(hash.slice(2), "hex"));
    // return sig;
  }

  static verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): boolean {
    // get the hash of the primary type
    // const typeHash = keccak256(MESSAGE);
    // const c = new AbiCoder();
    // c.encode(
    //     typeHash,
    //     [
    //         keccak256(domain.name),
    //         keccak256(domain.version),

    //     ]

    // );
    const address = pk; // pk *is* address for this weird type. /* "0x" + keccak256(pk.slice(1)).slice(-20).toString("hex"); */
    // const hash = _TypedDataEncoder.hash(domain, types, { address, message });

    // // errecover to check address
    // const addr = ethers.utils.recoverAddress(Buffer.from(hash.slice(2), "hex"), signature);
    const addr = verifyTypedData(
      domain,
      types,
      { address, message },
      signature,
    );
    return address === addr;
  }
}

export const domain = {
  name: "Bundlr",
  version: "1",
};
export const types = {
  Message: [
    { name: "message", type: "bytes" },
    { name: "address", type: "address" },
  ],
};

export const MESSAGE = "Message(bytes message,address address)";
export const DOMAIN = "EIP712Domain(string name,string version)";

// export const typedData = {
//     types: {
//         EIP712Domain: [
//             { name: "name", type: "string" },
//             { name: "version", type: "string" }
//         ],
//         DataItem: [
//             { name: "hash", type: "bytes" },
//             { name: "owner", type: "string" }
//         ]
//     },
//     primaryType: "DataItem",
//     domain: {
//         name: "Bundlr",
//         version: "1",
//     },
//     message: {
//         hash: [0, 12, 152],
//         address: "0x.."
//     },
// };

// function encodeType(primaryType) {
//     // Get dependencies primary first, then alphabetical
//     let deps = dependencies(primaryType);
//     deps = deps.filter(t => t != primaryType);
//     deps = [primaryType].concat(deps.sort());

//     // Format as a string with fields
//     let result = '';
//     for (let type of deps) {
//         result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`;
//     }
//     return result;
// }

// // Recursively finds all the dependencies of a type
// function dependencies(primaryType, found = []) {
//     if (found.includes(primaryType)) {
//         return found;
//     }
//     if (types[primaryType] === undefined) {
//         return found;
//     }
//     found.push(primaryType);
//     for (let field of types[primaryType]) {
//         for (let dep of dependencies(field.type, found)) {
//             if (!found.includes(dep)) {
//                 found.push(dep);
//             }
//         }
//     }
//     return found;
// }
