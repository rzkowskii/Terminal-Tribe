import { sha256 } from './archiveService';

export class ChecksumService {
  static sha256sum(content: string): string {
    return sha256(content);
  }
}


