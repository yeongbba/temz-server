import { connect, Connection, connection, ObjectId, Schema, set } from 'mongoose';

export class MongoDB {
  private connection: Connection;

  private constructor(private host: string, private dbName: string) {}

  static async createConnection(host: string, dbName: string) {
    const db = new MongoDB(host, dbName);
    await db.connect();
    return db;
  }

  private async connect() {
    set('strictQuery', true);
    try {
      await connect(this.host, {
        dbName: this.dbName,
      });
      this.connection = connection;
      console.log('create mongodb connection successfully');
      return this;
    } catch (err) {
      console.error(err);
    }
  }

  async close() {
    try {
      await this.connection.close();
      this.connection = null;
      console.log('close mongodb connection successfully');
    } catch (err) {
      console.error(err);
    }
  }

  static useVirtualId(schema: Schema) {
    schema.virtual('id').get(function () {
      return (this._id as ObjectId).toString();
    });
    schema.set('toJSON', { virtuals: true });
    schema.set('toObject', { virtuals: true });
  }

  static pre(schema: Schema, id: string) {
    schema.pre('save', function (next) {
      this[id] = this._id;
      next();
    });
  }
}
