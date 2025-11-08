import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'
import { orderModel } from '~/models/orderModel'
const createNew = async (req, res, next) => {
    try {

        const userId = req.jwtDecoded._id
        //Điều hướng dữ liệu sang tầng service
        const createdOrder = await orderService.createNew(req.body, userId)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createdOrder)

    } catch (error) {
        next(error)
    }
}
const getAllData = async (req, res, next) => {
    try {

        const allData = await orderModel.getAllData(req.body)

        res.status(StatusCodes.OK).json(allData)

    } catch (error) {
        next(error)
    }
}
const getOrdersByUserId = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const orderedByUserId = await orderModel.getOrdersByUserId(userId)

        res.status(StatusCodes.OK).json(orderedByUserId)

    } catch (error) {
        next(error)
    }
}

export const orderController = {
    createNew,
    getAllData,
    getOrdersByUserId

}