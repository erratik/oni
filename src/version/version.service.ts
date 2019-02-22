import { Injectable } from '@nestjs/common';

@Injectable()
export class VersionService {
  readonly version: string;

  constructor() {
    this.version = process.env.npm_package_version;
  }
}
