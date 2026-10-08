const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let memoryServer = null

async function connectMemoryDB() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create()
  }

  const uri = memoryServer.getUri()
  await mongoose.connect(uri)
  console.log('MongoDB connected successfully in local demo mode')
  return mongoose.connection
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
    console.warn('MONGODB_URI is not configured. Starting TechVerse in local demo mode with MongoDB memory storage.')
    return connectMemoryDB()
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
    return mongoose.connection
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message)
    console.warn('Falling back to local demo mode with MongoDB memory storage.')
    return connectMemoryDB()
  }
}

module.exports = connectDB
