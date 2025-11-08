import express from 'express'
import { orderValidation } from '~/validations/orderValidation'
import { orderController } from '~/controllers/orderController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()
Router.route('/')
  .get(authMiddleware.isAuthorized,orderController.getOrdersByUserId)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, orderController.getAllData)

Router.route('/')
    .post(authMiddleware.isAuthorized, orderValidation.createNew, orderController.createNew)



export const orderRoute = Router