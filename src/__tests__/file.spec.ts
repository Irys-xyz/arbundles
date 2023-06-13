// import { fileToJson, signedFileStream, fileExportForTesting } from "../file/file";
// import FileDataItem from "../file/FileDataItem";
// import { EthereumSigner } from "../";
// import { createData } from "../ar-data-create";
// import fs from "fs";
// import { unlink, writeFile } from "fs/promises";
// import { tmpName } from "tmp-promise";
test.todo("stub");
// describe("given we have a FileDataItem", () => {
//   const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
//   let fileDataItem: FileDataItem;
//   const data = "loremIpsum";
//   beforeEach(async () => {
//     const item = createData(data, signer);
//     await item.sign(signer);
//     const path = await tmpName();
//     await writeFile(path, item.getRaw());
//     fileDataItem = new FileDataItem(path);
//   });

//   afterEach(async () => {
//     await unlink(fileDataItem.filename);
//   });
//   describe("given we have file", () => {
//     let file: fs.promises.FileHandle;
//     beforeEach(async () => {
//       file = await fs.promises.open(fileDataItem.filename, "r");
//     });
//     afterEach(async () => {
//       await file.close();
//     });
//     describe("given we use fileToFd", () => {
//       describe("and given we have a FileHandle", () => {
//         it("should return a file descriptor", async () => {
//           const fileDescriptor = await fileExportForTesting.fileToFd(file);
//           expect(fileDescriptor).toBeDefined();
//           expect(fileDescriptor).toEqual(file);
//         });
//       });
//       describe("and given we have a string", () => {
//         it("should return a file descriptor", async () => {
//           const fileDescriptor = await fileExportForTesting.fileToFd(fileDataItem.filename.toString());
//           expect(fileDescriptor).toBeDefined();
//           expect(fileDescriptor).not.toEqual(file);
//         });
//       });
//     });
//     describe("given we use fileToJson", () => {
//       it("should return a transaction", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction).toBeDefined();
//       });
//       it("should return a transaction with the correct id", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.id).toEqual(fileDataItem.id);
//       });
//       it("should return a transaction with the correct owner", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.owner).toEqual(await fileDataItem.owner());
//       });
//       it("should return a transaction with the correct target", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.target).toEqual(await fileDataItem.target());
//       });
//       it("should return a transaction with the tags", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.tags).toEqual(await fileDataItem.tags());
//       });
//       it("should return a transaction with the correct data_size", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.data_size).toEqual(await (await fileDataItem.rawData()).length);
//       });
//       it("should contain the right signature", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.signature).toEqual(await fileDataItem.signature());
//       });
//       it("should contain fees", async () => {
//         const transaction = await fileToJson(fileDataItem.filename.toString());
//         expect(transaction.fee).toBeDefined();
//       });
//     });
//     // describe("given we use numberOfItems()", () => {
//     //   it("should return the correct number of items", async () => {
//     //     const num = await numberOfItems(file);
//     //     expect(num).toEqual(1);
//     //   });
//     // });
//     // describe("given we use getHeaderAt()", () => {
//     //   it("should return the correct header", async () => {
//     //     const header = await getHeaderAt(file, 0);
//     //     expect(header).toBeDefined();
//     //     // TODO: Add more checks
//     //   });
//     // });
//     // describe("given we use getHeaders()", () => {
//     //   it("should return the correct headers", async () => {
//     //     const headers = await getHeaders(fileDataItem.filename.toString());
//     //     expect(headers).toBeDefined();
//     //   });
//     // });
//     // describe("given we use getId()", () => {
//     //   it("should return the correct id", async () => {
//     //     const id = await getId(file);
//     //     expect(base64url.encode(id)).toEqual(fileDataItem.id);
//     //   });
//     // });
//     // describe("given we use getSignature()", () => {
//     //   it("should return the correct signature", async () => {
//     //     const signature = await getSignature(file);
//     //     expect(base64url.encode(signature)).toEqual(await fileDataItem.signature());
//     //   });
//     // });
//     // describe("given we use getOwner()", () => {
//     //   it("should return the correct owner", async () => {
//     //     const owner = await getOwner(file);
//     //     expect(owner).toEqual(await fileDataItem.owner());
//     //   });
//     // });
//     // describe("given we use getTarget()", () => {
//     //   it("should return the correct target", async () => {
//     //     const target = await getTarget(file);
//     //     expect(target).toEqual(await fileDataItem.target());
//     //   });
//     // });
//     // describe("given we use getAnchor()", () => {
//     //   it("should return the correct anchor", async () => {
//     //     const anchor = await getAnchor(file);
//     //     expect(anchor).toEqual(await fileDataItem.anchor());
//     //   });
//     // });

//     // describe("given we use getTags()", () => {
//     //   it("should return the correct tags", async () => {
//     //     const tags = await getTags(file);
//     //     expect(tags).toEqual(await fileDataItem.tags());
//     //   });
//     // });
//     describe("given we use signedFileStream()", () => {
//       it("should return a stream", async () => {
//         const stream = await signedFileStream(fileDataItem.filename.toString(), signer);
//         expect(stream).toBeDefined();
//       });
//     });
//   });
// });
