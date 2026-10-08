const mongoose = require('mongoose')

const getHealthStatus = (_request, response) => {
  const dbState = mongoose.connection.readyState
  const databaseStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown'

  response.status(200).json({
    status: 'ok',
    message: 'TechVerse core online',
    service: 'techverse-api',
    app: 'TechVerse',
    environment: process.env.NODE_ENV || 'development',
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  })
}

module.exports = {
  getHealthStatus,
}
