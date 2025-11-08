// src/validations/productValidation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Category Configuration
const MAIN_CATEGORIES = {
  WHEY_PROTEIN: 'Whey Protein',
  MASS_GAINER: 'Sữa tăng cân',
  BCAA_AMINO: 'BCAA Amino Acids',
  STRENGTH: 'Tăng sức mạnh',
  WEIGHT_LOSS: 'Hỗ trợ giảm cân',
  VITAMINS: 'Vitamin khoáng chất',
  FISH_OIL: 'Dầu cá',
  ACCESSORIES: 'Phụ kiện tập gym'
}

const SUB_CATEGORIES = {
  [MAIN_CATEGORIES.WHEY_PROTEIN]: [
    'Hydrolyzed Whey Protein',
    'Whey Protein Isolate',
    'Whey Protein Blend',
    'Casein Protein',
    'Meal Replacement',
    'Protein Bar'
  ],
  [MAIN_CATEGORIES.MASS_GAINER]: [],
  [MAIN_CATEGORIES.BCAA_AMINO]: [
    'Essential Amino Acids'
  ],
  [MAIN_CATEGORIES.STRENGTH]: [
    'Pre Workout',
    'Beta Alanine',
    'Creatine'
  ],
  [MAIN_CATEGORIES.WEIGHT_LOSS]: [
    'Fat Burn',
    'CLA',
    'L-Carnitine',
    'Yến mạch'
  ],
  [MAIN_CATEGORIES.VITAMINS]: [
    'MultiVitamin',
    'Astaxanthin',
    'Testosterone',
    'Xương khớp',
    'ZMA'
  ],
  [MAIN_CATEGORIES.FISH_OIL]: [],
  [MAIN_CATEGORIES.ACCESSORIES]: [
    'Bình lắc',
    'Dây kháng lực',
    'Phụ kiện riêng của lacu',
    'Phụ kiện Harbinger'
  ]
}

const BRANDS = [
  'Redcon1', 'BPI Sports', 'Ostrovit', 'Ultimate Nutrition', 'Labrada',
  'Optimum Nutrition', 'Quaker', 'VitaXtrong', 'Now Foods', 'JNX Sports',
  'Biotech USA', 'Puritan\'s Pride', 'Doctor\'s Best', 'Webber Naturals', 'Scivation'
]

const PRODUCT_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  LOW_STOCK: 'low_stock'
}
// Stock thresholds
const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,    // Dưới 10 là sắp hết
  OUT_OF_STOCK: 0   // Bằng 0 là hết hàng
}

const calculateStockStatus = (quantity) => {
  if (quantity <= STOCK_THRESHOLDS.OUT_OF_STOCK) return PRODUCT_STATUS.OUT_OF_STOCK
  if (quantity <= STOCK_THRESHOLDS.LOW_STOCK) return PRODUCT_STATUS.LOW_STOCK
  return PRODUCT_STATUS.IN_STOCK
}
// Price limits
const PRICE_LIMITS = {
  MIN: 0,
  MAX: 1000000000, // 1 tỷ VNĐ
}

// Get all subcategories for validation
const ALL_SUB_CATEGORIES = Object.values(SUB_CATEGORIES).flat()

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information
    name: Joi.string().required().min(3).max(100).trim().strict(),
    description: Joi.string().required().min(10).max(1000).trim().strict(),
    quantification: Joi.string().required().min(10).max(1000).trim().strict(),
    // Category System
    mainCategory: Joi.string().valid(...Object.values(MAIN_CATEGORIES)).required(),
   // Trong createNew validation
subCategory: Joi.string().valid(...ALL_SUB_CATEGORIES).when('mainCategory', {
  is: Joi.valid(MAIN_CATEGORIES.MASS_GAINER, MAIN_CATEGORIES.FISH_OIL),
  then: Joi.optional().allow('').allow(null), // ← CHO PHÉP EMPTY VÀ NULL
  otherwise: Joi.required()
}),

    // Brand
    brand: Joi.string().valid(...BRANDS).required(),

    // Price
    price: Joi.object({
      current: Joi.number()
        .min(PRICE_LIMITS.MIN)
        .max(PRICE_LIMITS.MAX)
        .required(),
      original: Joi.number()
        .min(PRICE_LIMITS.MIN)
        .max(PRICE_LIMITS.MAX)
        .default(Joi.ref('current')),
      discount: Joi.number().min(0).max(100).default(0)
    }).required(),

    // Inventory & Stock
    stock: Joi.object({
      quantity: Joi.number().min(0).required(),
    }).required(),
 images: Joi.string().default(null),
    
    _destroy: Joi.boolean().default(false)
  })

  try {
    const validatedData = await correctCondition.validateAsync(req.body, { abortEarly: false })
    if (validatedData.stock && validatedData.stock.quantity !== undefined) {
      validatedData.stock.status = calculateStockStatus(validatedData.stock.quantity)
    }

    // Gán lại req.body với data đã được tính toán
    req.body = validatedData
    next()
  } catch (error) {
    console.log('error',error)
    const errorMessage = new Error(error).message
    
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

  const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information - không required khi update
    name: Joi.string().min(3).max(100).trim().strict(),
    description: Joi.string().min(10).max(1000).trim().strict(),
    quantification: Joi.string().min(10).max(1000).trim().strict(),
    
    // Category System - không required khi update
    mainCategory: Joi.string().valid(...Object.values(MAIN_CATEGORIES)),
    subCategory: Joi.string().valid(...ALL_SUB_CATEGORIES).allow('', null), // ← CHO PHÉP EMPTY VÀ NULL

    // Brand - không required khi update
    brand: Joi.string().valid(...BRANDS),

    // Price - không required khi update
    price: Joi.object({
      current: Joi.number().min(PRICE_LIMITS.MIN).max(PRICE_LIMITS.MAX),
      original: Joi.number().min(PRICE_LIMITS.MIN).max(PRICE_LIMITS.MAX),
      discount: Joi.number().min(0).max(100).default(0)
    }),

    // Inventory & Stock - không required khi update
    stock: Joi.object({
      quantity: Joi.number().min(0),
    }),

    
    _id: Joi.forbidden(),
    _destroy: Joi.forbidden(),
    createdAt: Joi.forbidden(),
    updatedAt: Joi.forbidden()
  }).min(1) // Ít nhất 1 field được update

  try {
    const validatedData = await correctCondition.validateAsync(req.body, { 
      abortEarly: false,
      stripUnknown: true // ← QUAN TRỌNG: xóa các field không định nghĩa trong schema
    })
    
    // Tính toán stock status nếu có quantity
    if (validatedData.stock && validatedData.stock.quantity !== undefined) {
      validatedData.stock.status = calculateStockStatus(validatedData.stock.quantity)
    }

    req.body = validatedData
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  } 
}
export const productValidation = {
  createNew,
  update
}