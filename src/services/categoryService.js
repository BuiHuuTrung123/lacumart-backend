import {categoryModel} from '~/models/categoryModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody, categoryImageFile) => {
    try {
        let imageUrl = null;

        if (categoryImageFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(categoryImageFile.buffer, 'categories');
            imageUrl = uploadResult.secure_url;
        }


        const categoryData = {
            ...reqBody,
            image: imageUrl
            
        };

        const createdCategory = await categoryModel.createNew(categoryData)
        const getNewCategory = await categoryModel.findOneById(createdCategory.insertedId)

        return getNewCategory

    } catch (error) {
        throw error
    }
}
export const categoryService = {
    createNew
}