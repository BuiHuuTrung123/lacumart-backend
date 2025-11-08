import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { generateUniqueSlug } from '~/utils/slugify'

const CATEGORY_COLLECTION_NAME = 'categories'

// Schema Validation cho Category
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
    // Basic Information
    name: Joi.string().required().min(2).max(100).trim().strict(),
    slug: Joi.string().min(2).max(100).trim().strict(),
    description: Joi.string().max(500).trim().strict().allow(''),

    // Display Settings
    displayOrder: Joi.number().default(0),
    isActive: Joi.boolean().default(true),

    // Media
    image: Joi.string().default(null),

    // Timestamps
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

// Validation
const validateBeforeCreate = async (data) => {
    return await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        let slug = validData.slug
        if (!slug) {
            slug = await generateUniqueSlug(validData.name, CATEGORY_COLLECTION_NAME)
        }

        const newCategoryToAdd = {
            ...validData,
            slug,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const createCategory = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(newCategoryToAdd)

        return createCategory
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getAllData = async () => {
    try {
        const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME)
            .find({ _destroy: false })
            .sort({ displayOrder: 1, createdAt: -1 })
            .toArray()
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (categoryId, data) => {
    try {
        const condition = { _id: new ObjectId(categoryId) }

        // Chỉ update những field có giá trị
        const updateData = { ...data }

        if (updateData.name && !updateData.slug) {
            const newSlug = await generateUniqueSlug(updateData.name, CATEGORY_COLLECTION_NAME, categoryId)
            updateData.slug = newSlug
        }

        delete updateData._id // Không cho update _id

        const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOneAndUpdate(
            condition,
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
        }

        return result
    } catch (error) {
        throw error
    }
}
const deleteCategory = async (categoryId) => {
    try {
        const deleteResult = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOneAndDelete({ _id: new ObjectId(categoryId) });

        return deleteResult
    } catch (error) {
        throw new Error(error)
    }
}
export const categoryModel = {
    createNew,
    findOneById,
    getAllData,
    update,
    deleteCategory
}