const mongoose = require('mongoose')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

const ensureDatabaseReady = (response) => {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({
      status: 'error',
      message: 'MongoDB is not connected. Add your Atlas URI to backend/.env before continuing.',
    })
    return false
  }

  return true
}

const registerUser = async (request, response) => {
  try {
    if (!ensureDatabaseReady(response)) {
      return
    }

    const { name, email, password, confirmPassword } = request.body

    if (!name || !email || !password || !confirmPassword) {
      response.status(400).json({
        status: 'error',
        message: 'Please fill in all required fields',
      })
      return
    }

    if (!validateEmail(email)) {
      response.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address',
      })
      return
    }

    if (password.length < 6) {
      response.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long',
      })
      return
    }

    if (password !== confirmPassword) {
      response.status(400).json({
        status: 'error',
        message: 'Passwords do not match',
      })
      return
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      response.status(409).json({
        status: 'error',
        message: 'An account with this email already exists',
      })
      return
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      placementCompleted: false,
    })

    const token = generateToken(user._id)

    response.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        placementCompleted: user.placementCompleted,
        role: user.role,
        badges: user.badges,
      },
    })
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: 'Unable to create account right now. Please try again.',
    })
  }
}

const loginUser = async (request, response) => {
  try {
    if (!ensureDatabaseReady(response)) {
      return
    }

    const { email, password } = request.body

    if (!email || !password) {
      response.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      response.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      })
      return
    }

    const isPasswordCorrect = await user.matchPassword(password)

    if (!isPasswordCorrect) {
      response.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      })
      return
    }

    const token = generateToken(user._id)

    response.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        placementCompleted: user.placementCompleted,
        role: user.role,
        badges: user.badges,
      },
    })
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: 'Unable to complete login right now. Please try again.',
    })
  }
}

const getCurrentUser = async (request, response) => {
  try {
    const user = await User.findById(request.user._id).select('-password')

    if (!user) {
      response.status(404).json({
        status: 'error',
        message: 'User not found',
      })
      return
    }

    response.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        placementCompleted: user.placementCompleted,
        role: user.role,
        badges: user.badges,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: 'Unable to load your profile right now.',
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
}
