// src/validations/orderValidation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

const PAYMENT_METHODS = {
  COD: 'cod',
  BANKING: 'banking'
}

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed', 
  REFUNDED: 'refunded'
}

const createNew = async (req, res, next) => {

  const correctCondition = Joi.object({
 
    
    customerInfo: Joi.object({
      fullName: Joi.string().required().min(2).max(50).trim().strict()
        .messages({
          'string.min': 'Họ tên phải có ít nhất 2 ký tự',
          'string.max': 'Họ tên không được vượt quá 50 ký tự'
        }),
      phone: Joi.string().required().pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/).messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ'
      }),
      email: Joi.string().email().optional().allow(''),
      paymentMethod: Joi.string().valid(PAYMENT_METHODS.COD, PAYMENT_METHODS.BANKING).required(),
      address: Joi.object({
        street: Joi.string().required().min(5).max(200).trim().strict(),
        ward: Joi.string().required().min(2).max(50).trim().strict(),
        district: Joi.string().required().min(2).max(50).trim().strict(),
        city: Joi.string().required().min(2).max(50).trim().strict(),
        note: Joi.string().allow('').max(500)
      }).required()
    }).required(),

    // // Thông tin thanh toán
    // payment: Joi.object({
    //   status: Joi.string().valid(...Object.values(PAYMENT_STATUS)).default(PAYMENT_STATUS.PENDING)
    // }).default({ status: PAYMENT_STATUS.PENDING }),

    // // Trạng thái đơn hàng
    // status: Joi.string().valid(...Object.values(ORDER_STATUS)).default(ORDER_STATUS.PENDING),

    // Các trường hệ thống
    orderCode: Joi.string().optional(), // Sẽ được generate tự động
    createdAt: Joi.forbidden(),
    updatedAt: Joi.forbidden(),
    _destroy: Joi.forbidden()
  })

  try {
    // Validate dữ liệu
    const validatedData = await correctCondition.validateAsync(req.body, { 
      abortEarly: false,  
      stripUnknown: true // Loại bỏ các trường không xác định
    })

    // Gán lại req.body với data đã được validate
    req.body = validatedData
  
    next()

  } catch (error) {

    
    if (error instanceof ApiError) {
      next(error)
    } else {
      const errorMessage = error.details ? 
        error.details.map(detail => detail.message).join(', ') : 
        error.message
      
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
      next(customError)
    }
  }
}

export const orderValidation = {
  createNew
}