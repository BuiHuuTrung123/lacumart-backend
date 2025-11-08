import { orderModel } from '~/models/orderModel'
import { cartModel } from '~/models/cartModel'
const createNew = async (reqBody, userId) => {
    try {
     
        const cartActive = await cartModel.findActiveCartByUserId(userId)
   
        if (!cartActive) {
            throw new Error('No active cart found for the user')
        }
          
        const createdOrder = await orderModel.createNew(userId, cartActive, reqBody.customerInfo) 
        const getNewOrder = await orderModel.findOneById(createdOrder.insertedId)

        return getNewOrder

    } catch (error) {
        throw error
    }
}
const getOrdersByUser = async (userId) => {
  try {
    return await orderModel.getOrdersByUserId(userId)
  } catch (error) {
    throw error
  }
}

const getOrderById = async (orderId) => {
  try {
    const order = await orderModel.findOneById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại')
    }
    return order
  } catch (error) {
    throw error
  }
}
export const orderService = {
    createNew,
    getOrdersByUser,
  getOrderById
}