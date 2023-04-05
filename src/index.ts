import http from 'http';
import { config } from './config';
import { startServer, stopServer } from './app';
import { ServerInfo } from './types/common';

export class Index {
  private _totalInfo: ServerInfo;

  set totalInfo(info: ServerInfo) {
    this._totalInfo = info;
  }

  get totalInfo() {
    return this._totalInfo;
  }

  get server() {
    return this._totalInfo.server as http.Server;
  }

  private constructor(port?: number) {
    this.init(port);
  }

  static async AsyncStart(port?: number) {
    const index = new Index();
    await index.init(port);
    return index;
  }

  static start(port?: number) {
    return new Index(port);
  }

  private async init(port?: number) {
    this.totalInfo = await startServer(port);
  }

  async stop() {
    await stopServer(this.totalInfo);
  }
}

if (!config.environment.test) {
  Index.start(config.host.port);
}
