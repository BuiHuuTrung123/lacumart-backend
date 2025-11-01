// src/validations/categoryValidation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information
    name: Joi.string().required().min(2).max(100).trim().strict(),
    description: Joi.string().max(500).trim().strict().allow(''),
    
    // Display Settings
    displayOrder: Joi.number().default(0),
    isActive: Joi.boolean().default(true),
    
    // Media
      image: Joi.string().default(null),
    
    // System fields
    _destroy: Joi.boolean().default(false)
  })

  try {
    const validatedData = await correctCondition.validateAsync(req.body, { abortEarly: false })
    req.body = validatedData
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information
    name: Joi.string().min(2).max(100).trim().strict(),
    description: Joi.string().max(500).trim().strict().allow(''),
    
    // Display Settings
    displayOrder: Joi.number(),
    isActive: Joi.boolean(),
    
    // Media
    image: Joi.string().default(null),
    
    // System fields - KHÔNG cho phép update
    _id: Joi.forbidden(),
    _destroy: Joi.forbidden(),
    createdAt: Joi.forbidden(),
    updatedAt: Joi.forbidden()
  }).min(1)

  try {
    const validatedData = await correctCondition.validateAsync(req.body, { 
      abortEarly: false,
      stripUnknown: true
    })
    
    req.body = validatedData
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const categoryValidation = {
  createNew,
  update
}