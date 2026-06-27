import { MongoClient, type Db } from 'mongodb'

let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

function getRequiredEnv(name: 'MONGODB_URI' | 'MONGODB_DB_NAME') {
  const env = (
    globalThis as typeof globalThis & {
      process?: {
        env?: Record<string, string | undefined>
      }
    }
  ).process?.env
  const value = env?.[name]

  if (!value) {
    throw new Error(`${name} is required before the REVIVE API can connect to MongoDB.`)
  }

  return value
}

export async function connectToMongo() {
  if (mongoDb) {
    return mongoDb
  }

  mongoClient = new MongoClient(getRequiredEnv('MONGODB_URI'))
  await mongoClient.connect()
  mongoDb = mongoClient.db(getRequiredEnv('MONGODB_DB_NAME'))

  return mongoDb
}

export async function getMongoDb() {
  if (mongoDb) {
    return mongoDb
  }

  return connectToMongo()
}

export async function closeMongoConnection() {
  if (!mongoClient) {
    return
  }

  await mongoClient.close()
  mongoClient = null
  mongoDb = null
}
