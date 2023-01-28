import { promises as fs } from 'fs';
import path from 'path';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { IPFSService } from '../../common/interfaces';

export class Web3StorageService implements IPFSService {
  private web3Storage: Web3Storage;

  constructor(token: string) {
    this.web3Storage = new Web3Storage({
      token,
    });
  }

  async publishJSON(name: string, content: object) {
    const tempPath = path.join('/tmp', `${name}.json`);

    // Temporarily write as file - web3.storage library support file read only
    await fs.writeFile(tempPath, JSON.stringify(content, null, 2));

    try {
      const files = await getFilesFromPath(tempPath);
      const rootCid = await this.web3Storage.put(files);

      const res = await this.web3Storage.get(rootCid);
      const resFiles = await res?.files();
      const cid = resFiles?.[0]?.cid;
      if (!cid) {
        throw new Error('Failed to fetch published file');
      }
      return cid;
    } finally {
      await fs.unlink(tempPath);
    }
  }
}
