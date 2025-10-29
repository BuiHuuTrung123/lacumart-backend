import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

// Define Collection (name & schema)
const CART_COLLECTION_NAME = 'carts'
const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.any().required(), // ID người dùng
  items: Joi.array().items(
    Joi.object({
      productId: Joi.any().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      name: Joi.string().required(),
      images: Joi.string().default(null)
    })
  ).default([]),
  status: Joi.string().valid('active', 'completed', 'cancelled').default('active'),
  total: Joi.number().min(0).default(0),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CART_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdCart = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .insertOne(validData)

    return createdCart
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm cart active của user
const findActiveCartByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        userId,
        status: 'active',
        _destroy: false
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm sản phẩm vào cart
const addItemToCart = async (userId, cartItem) => {
  try {
    const userObjId = new ObjectId(userId)
    const simplifiedItem = {
      ...cartItem,
      price: cartItem.price.current,
    }

    // 1. Tìm cart active của user
    const activeCart = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        userId: userObjId,
        status: 'active',
        _destroy: false
      })

    // 2. Nếu chưa có cart active → tạo mới
    if (!activeCart) {
      const newCart = {
        userId: userObjId,
        items: [simplifiedItem],
        status: 'active',
        total: cartItem.price.current * cartItem.quantity,
        // signal: ['increase', 'reduce'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await createNew(newCart)

      const cartCurrent = await GET_DB()
        .collection(CART_COLLECTION_NAME)
        .findOne({
          userId: userObjId,
          status: 'active',
          _destroy: false

        })
      console.log('cartCurrent', cartCurrent)
      return cartCurrent
    }

    const existingItem = activeCart.items.find(item =>
      item.productId.toString() === simplifiedItem.productId.toString()
    )

    let newTotal = 0
    if (existingItem) {
      // 3A. Nếu ĐÃ tồn tại → tăng quantity
      newTotal = activeCart.total + existingItem.price // Total cũ + giá sản phẩm

      await GET_DB().collection('carts').updateOne(
        {
          _id: activeCart._id,
          'items.productId': simplifiedItem.productId
        },
        {
          $inc: { 'items.$.quantity': 1 },
          $set: {
            total: newTotal,
            updatedAt: new Date()
          }
        }
      )



    }
    else {
      newTotal = activeCart.total + (simplifiedItem.price * simplifiedItem.quantity)
      // Nếu chưa có -> thêm mới vào mảng
      await GET_DB().collection('carts').updateOne(
        { _id: activeCart._id },
        {
          $push: { items: simplifiedItem },
          $set: {
            total: newTotal,
            updatedAt: new Date()
          }
        },

      )

    }

    const cartCurrent = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        userId: userObjId,
        status: 'active',
        _destroy: false

      })


    return cartCurrent
  } catch (error) {
    throw new Error(error)
  }
}
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCartDetail = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({
      userId: new ObjectId(userId),
      status: 'active',
      _destroy: false
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}
const deleteProductInCart = async (productId, cartActiveId) => {
  try {
    const db = GET_DB().collection(CART_COLLECTION_NAME)

    // 1️ Tìm cart trước
    const cart = await findOneById(cartActiveId)
    if (!cart) throw new Error('Cart not found')

    // 2️ Tìm product trong cart
    const deletedItem = cart.items.find(item => item.productId.equals(new ObjectId(productId)))
    if (!deletedItem) throw new Error('Product not found in cart')

    // 3️ Xóa product khỏi mảng
    await db.updateOne(
      { _id: new ObjectId(cartActiveId) },
      {
        $pull: { items: { productId: new ObjectId(productId) } },

        $set: {
          total: cart.total - (deletedItem.price * deletedItem.quantity),
          updatedAt: new Date()
        }
      }
    )

    // 4️⃣ Trả về product đã xóa
    const updatedCart = await findOneById(cartActiveId)
    return updatedCart
  } catch (error) {
    throw new Error(error)
  }
}

const updateQualityItemToCart = async (productId, cartActiveId, signal) => {
  try {

    const cart = await findOneById(cartActiveId)
    if (!cart) throw new Error('Cart not found')

    const productInCart = cart.items.find(item => item.productId.equals(new ObjectId(productId)))
    if (!productInCart) throw new Error('Product not found in cart')


    if (signal === 'increase') {
      await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(cartActiveId),
          'items.productId': new ObjectId(productId)
        },
        {
          $inc: {
            'items.$.quantity': 1,
            total: productInCart.price
          },
          $set: { updatedAt: new Date() }
        }
      )
    }
    else if (signal === 'reduce') {
      if (productInCart.quantity <= 1) {
        await deleteProductInCart(productId, cartActiveId)
      } else {
        await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
          { _id: new ObjectId(cartActiveId), 'items.productId': new ObjectId(productId) },
          {
            $inc: { 'items.$.quantity': -1, total: -productInCart.price },

            $set: { updatedAt: new Date() }
          }
        )
      }
    }
    const updatedCart = await findOneById(cartActiveId)
    return updatedCart

  } catch (error) {

  }
}
export const cartModel = {
  createNew,
  findActiveCartByUserId,
  findOneById,
  addItemToCart,
  getCartDetail,
  deleteProductInCart,
  updateQualityItemToCart
}