import { getMongoDb } from "../db/mongo.js";
import type { SavedConfigurationRecord } from "./configurations.schemas.js";

const CONFIGURATIONS_COLLECTION = "configurations";

export class MongoConfigurationsRepository {
  async ensureIndexes() {
    const db = await getMongoDb();
    await db.collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION).createIndexes([
      { key: { id: 1 }, name: "configurations-id", unique: true },
      { key: { name: 1 }, name: "configurations-name" },
    ]);
  }

  async findAll() {
    const db = await getMongoDb();
    return db
      .collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION)
      .find({}, { sort: { createdAt: 1, name: 1 } })
      .toArray();
  }

  async findById(id: string) {
    const db = await getMongoDb();
    return db.collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION).findOne({ id });
  }

  async create(configuration: SavedConfigurationRecord) {
    const db = await getMongoDb();
    await db
      .collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION)
      .insertOne(configuration);
    return configuration;
  }

  async replace(configuration: SavedConfigurationRecord) {
    const db = await getMongoDb();
    await db
      .collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION)
      .replaceOne({ id: configuration.id }, configuration, { upsert: false });

    return configuration;
  }

  async deleteById(id: string) {
    const db = await getMongoDb();
    const result = await db
      .collection<SavedConfigurationRecord>(CONFIGURATIONS_COLLECTION)
      .deleteOne({ id });
    return result.deletedCount > 0;
  }
}
