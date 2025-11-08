import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

const ORDER_COLLECTION_NAME = 'orders'

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

const ORDER_COLLECTION_SCHEMA = Joi.object({
  orderCode: Joi.string().required(),
  userId: Joi.any().required(),
  cartId: Joi.any().required(),

  items: Joi.array().items(
    Joi.object({
      productId: Joi.any().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      name: Joi.string().required(),
      images: Joi.string().default(null)
    })
  ).required(),

  subtotal: Joi.number().min(0).required(),
  shippingFee: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  total: Joi.number().min(0).required(),

  status: Joi.string().valid(...Object.values(ORDER_STATUS)).default(ORDER_STATUS.PENDING),

  // ✅ PAYMENT METHOD NẰM TRONG CUSTOMER INFO
  customerInfo: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email(),
    paymentMethod: Joi.string().valid(PAYMENT_METHODS.COD, PAYMENT_METHODS.BANKING).required(), // 👈 THÊM VÀO ĐÂY
    address: Joi.object({
      street: Joi.string().required(),
      ward: Joi.string().required(),
      district: Joi.string().required(),
      city: Joi.string().required(),
      note: Joi.string().allow('')
    }).required()
  }).required(),

  // ✅ PAYMENT OBJECT CHỈ CÒN STATUS
  payment: Joi.object({
    status: Joi.string().valid(...Object.values(PAYMENT_STATUS)).default(PAYMENT_STATUS.PENDING)
  }).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Generate order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `DH${timestamp}${random}`
}

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ✅ CẬP NHẬT: Chỉ nhận customerInfo (đã có paymentMethod bên trong)
const createNew = async (userId, cartData, customerInfo) => {
  try {
    const userObjId = new ObjectId(userId)
    const cartObjId = new ObjectId(cartData._id)

    const subtotal = cartData.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const shippingFee = subtotal > 500000 ? 0 : 30000
    const total = subtotal + shippingFee

    const orderData = {
      orderCode: generateOrderCode(),
      userId: userObjId,
      cartId: cartObjId,
      items: cartData.items,
      subtotal,
      shippingFee,
      total,
      customerInfo, // 👈 Đã chứa paymentMethod
      payment: {
        status: customerInfo.paymentMethod === PAYMENT_METHODS.COD ?
          PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const validData = await validateBeforeCreate(orderData)
    const createdOrder = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .insertOne(validData)

    return createdOrder
  } catch (error) {
    throw new Error(error)
  }
}

// Các hàm get giữ nguyên
const findOneById = async (orderId) => {
  try {
    const result = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(orderId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getOrdersByUserId = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .find({
        userId: new ObjectId(userId),
        _destroy: false
      })
      .sort({ createdAt: -1 })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAllOrders = async () => {
  try {
    const result = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .find({ _destroy: false })
      .sort({ createdAt: -1 })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const orderModel = {
  createNew,
  findOneById,
  getOrdersByUserId,
  getAllOrders,
  
}