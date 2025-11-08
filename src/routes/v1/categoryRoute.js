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
        
Router.route('/:id')

    .delete(authMiddleware.isAuthorized, categoryController.deleteCategory)
    .put(
        multerUploadMiddleware.upload.single('image'), // ← THÊM UPLOAD ẢNH CHO UPDATE
        parseFormDataJson,
        authMiddleware.isAuthorized,
        categoryValidation.update, // ← SỬ DỤNG VALIDATION UPDATE
        categoryController.update // ← THÊM CONTROLLER UPDATE
    )
export const categoryRoute = Router