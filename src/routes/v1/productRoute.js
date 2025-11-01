import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

import { authMiddleware } from '~/middlewares/authMiddleware'

import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const parseFormDataJson = (req, res, next) => {
    if (req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
        } catch (error) {
            return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid JSON data'));
        }
    }
    next();
};
const Router = express.Router()
Router.route('/')
    .get(productController.getAllData)
    .post(multerUploadMiddleware.upload.single('image'), parseFormDataJson, authMiddleware.isAuthorized, productValidation.createNew, productController.createNew)

Router.route('/:id')

    .delete(authMiddleware.isAuthorized, productController.deleteProduct)
    .put(
        multerUploadMiddleware.upload.single('image'), // ← THÊM UPLOAD ẢNH CHO UPDATE
        parseFormDataJson,
        authMiddleware.isAuthorized,
        productValidation.update, // ← SỬ DỤNG VALIDATION UPDATE
        productController.update // ← THÊM CONTROLLER UPDATE
    )
Router.route('/:productName')
    .get(productController.getProductDetail)
//multerUploadMiddleware.upload.single('image')
export const productRoute = Router