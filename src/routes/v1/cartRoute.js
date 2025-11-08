import express from 'express'
import { cartValidation } from '~/validations/cartValidation'
import { cartController } from '~/controllers/cartController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()
Router.route('/')
    .post(authMiddleware.isAuthorized, cartValidation.addItemToCart, cartController.addItemToCart)
// .get(productController.getAllData)
Router.route('/:id')
    .get(authMiddleware.isAuthorized, cartController.getCartDetail)
    .put(authMiddleware.isAuthorized, cartController.updateQualityItemToCart)
    .delete(authMiddleware.isAuthorized, cartController.deleteProductInCart)
    .patch(authMiddleware.isAuthorized, cartController.patchStatusCart)
//multerUploadMiddleware.upload.single('image')
export const cartRoute = Router