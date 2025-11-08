import { StatusCodes } from 'http-status-codes'
import {categoryModel} from '~/models/categoryModel'
import { categoryService } from '~/services/categoryService'
const getAllData = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const allData = await categoryModel.getAllData()
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(allData)

    } catch (error) {
        next(error)
    }
}
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const categoryImageFile = req.file

        const createdCategory = await categoryService.createNew(req.body, categoryImageFile)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createdCategory)

    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const categoryId = req.params.id
        const categoryImageFile = req.file

        const updatedCategory = await categoryService.update(categoryId, req.body, categoryImageFile)

        res.status(StatusCodes.OK).json(updatedCategory)
    } catch (error) {
        next(error)
    }
}
const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id
        const move = await categoryModel.deleteCategory(categoryId)
        res.status(StatusCodes.OK).json(move)
    } catch (error) {
        next(error)
    }
}
export const categoryController = {
    getAllData,
    createNew, 
    update,
    deleteCategory
}