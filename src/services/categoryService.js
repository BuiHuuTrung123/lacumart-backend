import {categoryModel} from '~/models/categoryModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody, categoryImageFile) => {
    try {
        let imageUrl = null;

        if (categoryImageFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(categoryImageFile.buffer, 'categories');
            imageUrl = uploadResult.secure_url
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
// services/categoryService.js - FIX: Loại bỏ image nếu nó null
const update = async (categoryId, reqBody, categoryImageFile) => {
  try {

    const { image, ...cleanData } = reqBody;
    const updateData = { ...cleanData };
    
    // CHỈ update image khi có file mới
    if (categoryImageFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(categoryImageFile.buffer, 'categories');
      updateData.image = uploadResult.secure_url;
     
    } else {
    }

    // Xóa các field không cần thiết
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedCategory = await categoryModel.update(categoryId, updateData);
    return updatedCategory;

  } catch (error) {
    throw error;
  }
}
export const categoryService = {
    createNew,
    update
}