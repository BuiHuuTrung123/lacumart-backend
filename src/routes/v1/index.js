import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/routes/v1/userRoute'

import { productRoute } from '~/routes/v1/productRoute'
import {cartRoute} from '~/routes/v1/cartRoute'
import { categoryRoute } from '~/routes/v1/categoryRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use' })
})

Router.use('/users', userRoute)
Router.use('/products', productRoute)
Router.use('/carts', cartRoute)
Router.use('/categories', categoryRoute)
export const APIs_v1 = Router  