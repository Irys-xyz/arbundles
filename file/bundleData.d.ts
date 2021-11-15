import { Signer } from '../build/signing';
import FileBundle from './FileBundle';
import FileDataItem from './FileDataItem';
export declare function bundleAndSignData(dataItems: FileDataItem[], signer: Signer, dir?: string): Promise<FileBundle>;
