import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'
import { productModel } from '~/models/productModel'
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const productImageFile = req.file

        const createProduct = await productService.createNew(req.body, productImageFile)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createProduct)

    } catch (error) {
        next(error)
    }
}
const getAllData = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const allData = await productModel.getAllData(req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(allData)

    } catch (error) {
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id
        const move = await productModel.deleteProduct(productId)
        res.status(StatusCodes.OK).json(move)
    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const productId = req.params.id
        const productImageFile = req.file

        const updatedProduct = await productService.update(productId, req.body, productImageFile)

        res.status(StatusCodes.OK).json(updatedProduct)
    } catch (error) {
        next(error)
    }
}

const getProductDetail = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const productId = req.params.id
        const productDetail = await productModel.getProductDetail(productId)
    
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(productDetail)

    } catch (error) {
        next(error)
    }
}

export const productController = {
    createNew,
    getAllData,
    deleteProduct,
    update,
    getProductDetail
}