import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'
import { cartModel } from '~/models/cartModel'
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
       
        const createCart = await cartService.createNew(req.body)
        console.log('cons', createCart)

        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createCart)

    } catch (error) {
        next(error)
    }
}
const addItemToCart = async (req, res, next) => {
    try {

        const { productId } = req.body
        const userId = req.jwtDecoded._id

        // Lấy userId từ auth middleware
        const updatedCart = await cartService.addItemToCart(userId, productId)

        res.status(StatusCodes.OK).json(updatedCart)

    } catch (error) {
        next(error)
    }
}

const getCartDetail = async (req, res, next) => {
    try {
        const userId = req.params.id
        //Điều hướng dữ liệu sang tầng service
        const detailCart = await cartModel.getCartDetail(userId)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(detailCart)

    } catch (error) {
        next(error)
    }
}

const deleteProductInCart = async (req, res, next) => {
    try {

        const productId = req.params.id
          
        const { cartActiveId } = req.body
        

        const move = await cartModel.deleteProductInCart(productId, cartActiveId)
        res.status(StatusCodes.OK).json(move)
    } catch (error) {
        next(error)
    }
}

const updateQualityItemToCart = async (req, res, next) => {
    try {
        const productId = req.params.id
        const { cartActiveId, signal } = req.body.data
       

        const updatedQualityCart = await cartModel.updateQualityItemToCart(productId, cartActiveId, signal)
            console.log('updatedQualityCart',updatedQualityCart)
        res.status(StatusCodes.OK).json(updatedQualityCart)
    } catch (error) {
        next(error)
    }
}

export const cartController = {
    createNew,
    addItemToCart,
    getCartDetail,
    deleteProductInCart,
    updateQualityItemToCart
}