import express from 'express'
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const Router = express.Router()
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
Router.route('/')
    .get(categoryController.getAllData)
    .post(multerUploadMiddleware.upload.single('image'), parseFormDataJson,authMiddleware.isAuthorized, categoryValidation.createNew, categoryController.createNew)

// .get(productController.getAllData)
// Router.route('/:id')
//     .get(authMiddleware.isAuthorized, cartController.getCartDetail)
//     .put(authMiddleware.isAuthorized, cartController.updateQualityItemToCart)
//     .delete(authMiddleware.isAuthorized, cartController.deleteProductInCart)
//multerUploadMiddleware.upload.single('image')
export const categoryRoute = Router