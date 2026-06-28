import { getMongoDb } from "../db/mongo.js";
import type { MigrationProjectRecord } from "./projects.schemas.js";

const PROJECTS_COLLECTION = "projects";

export class MongoProjectsRepository {
  async ensureIndexes() {
    const db = await getMongoDb();
    await db.collection<MigrationProjectRecord>(PROJECTS_COLLECTION).createIndexes([
      { key: { id: 1 }, name: "projects-id", unique: true },
      { key: { slug: 1 }, name: "projects-slug", unique: true },
      { key: { name: 1 }, name: "projects-name" },
    ]);
  }

  async findAll() {
    const db = await getMongoDb();
    return db
      .collection<MigrationProjectRecord>(PROJECTS_COLLECTION)
      .find({}, { sort: { createdAt: 1, name: 1 } })
      .toArray();
  }

  async findById(id: string) {
    const db = await getMongoDb();
    return db.collection<MigrationProjectRecord>(PROJECTS_COLLECTION).findOne({ id });
  }

  async findBySlug(slug: string) {
    const db = await getMongoDb();
    return db.collection<MigrationProjectRecord>(PROJECTS_COLLECTION).findOne({ slug });
  }

  async count() {
    const db = await getMongoDb();
    return db.collection<MigrationProjectRecord>(PROJECTS_COLLECTION).countDocuments();
  }

  async create(project: MigrationProjectRecord) {
    const db = await getMongoDb();
    await db.collection<MigrationProjectRecord>(PROJECTS_COLLECTION).insertOne(project);
    return project;
  }

  async replace(project: MigrationProjectRecord) {
    const db = await getMongoDb();
    await db
      .collection<MigrationProjectRecord>(PROJECTS_COLLECTION)
      .replaceOne({ id: project.id }, project, { upsert: false });

    return project;
  }

  async deleteById(id: string) {
    const db = await getMongoDb();
    const result = await db
      .collection<MigrationProjectRecord>(PROJECTS_COLLECTION)
      .deleteOne({ id });
    return result.deletedCount > 0;
  }
}
