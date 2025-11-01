import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { generateUniqueSlug } from '~/utils/slugify'
const PRODUCT_COLLECTION_NAME = 'products'

// Category Configuration
const MAIN_CATEGORIES = {
    WHEY_PROTEIN: 'Whey Protein',
    MASS_GAINER: 'Sữa tăng cân',
    BCAA_AMINO: 'BCAA Amino Acids',
    STRENGTH: 'Tăng sức mạnh',
    WEIGHT_LOSS: 'Hỗ trợ giảm cân',
    VITAMINS: 'Vitamin khoáng chất',
    FISH_OIL: 'Dầu cá',
    ACCESSORIES: 'Phụ kiện tập gym'
}

// ✅ CẬP NHẬT: Bỏ DISCONTINUED
const PRODUCT_STATUS = {
    IN_STOCK: 'in_stock',
    OUT_OF_STOCK: 'out_of_stock',
    LOW_STOCK: 'low_stock'
}

const SUB_CATEGORIES = {
    [MAIN_CATEGORIES.WHEY_PROTEIN]: [
        'Hydrolyzed Whey Protein',
        'Whey Protein Isolate',
        'Whey Protein Blend',
        'Casein Protein',
        'Meal Replacement',
        'Protein Bar'
    ],
    [MAIN_CATEGORIES.MASS_GAINER]: [],
    [MAIN_CATEGORIES.BCAA_AMINO]: [
        'Essential Amino Acids'
    ],
    [MAIN_CATEGORIES.STRENGTH]: [
        'Pre Workout',
        'Beta Alanine',
        'Creatine'
    ],
    [MAIN_CATEGORIES.WEIGHT_LOSS]: [
        'Fat Burn',
        'CLA',
        'L-Carnitine',
        'Yến mạch'
    ],
    [MAIN_CATEGORIES.VITAMINS]: [
        'MultiVitamin',
        'Astaxanthin',
        'Testosterone',
        'Xương khớp',
        'ZMA'
    ],
    [MAIN_CATEGORIES.FISH_OIL]: [],
    [MAIN_CATEGORIES.ACCESSORIES]: [
        'Bình lắc',
        'Dây kháng lực',
        'Phụ kiện riêng của lacu',
        'Phụ kiện Harbinger'
    ]
}

// Lấy tất cả subcategories để dùng trong validation
const ALL_SUB_CATEGORIES = Object.values(SUB_CATEGORIES).flat()

const BRANDS = [
    'Redcon1', 'BPI Sports', 'Ostrovit', 'Ultimate Nutrition', 'Labrada',
    'Optimum Nutrition', 'Quaker', 'VitaXtrong', 'Now Foods', 'JNX Sports',
    'Biotech USA', 'Puritan\'s Pride', 'Doctor\'s Best', 'Webber Naturals', 'Scivation'
]

// Price limits
const PRICE_LIMITS = {
    MIN: 0,
    MAX: 1000000000, // 1 tỷ VNĐ
}

// Schema Validation - ĐƠN GIẢN HÓA
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
    // Basic Information
    name: Joi.string().required().min(3).max(100).trim().strict(),
    slug: Joi.string().min(3).max(100).trim().strict(),
    description: Joi.string().required().min(10).max(1000).trim().strict(),
    // ✅ THÊM: Trường quantification
    quantification: Joi.string().required().min(1).max(100).trim().strict(),

    // Category System
    mainCategory: Joi.string().valid(...Object.values(MAIN_CATEGORIES)).required(),
    subCategory: Joi.string().valid(...ALL_SUB_CATEGORIES).when('mainCategory', {
        is: Joi.valid(MAIN_CATEGORIES.MASS_GAINER, MAIN_CATEGORIES.FISH_OIL),
        then: Joi.optional().allow('').allow(null),
        otherwise: Joi.required()
    }),

    // Brand
    brand: Joi.string().valid(...BRANDS).required(),

    // Price
    price: Joi.object({
        current: Joi.number()
            .min(PRICE_LIMITS.MIN)
            .max(PRICE_LIMITS.MAX)
            .required(),
        original: Joi.number()
            .min(PRICE_LIMITS.MIN)
            .max(PRICE_LIMITS.MAX)
            .default(Joi.ref('current')),
        discount: Joi.number().min(0).max(100).default(0)
    }).required(),

    // Inventory & Stock
    stock: Joi.object({
        quantity: Joi.number().min(0).required(),
        // ✅ CẬP NHẬT: Chỉ còn 3 status
        status: Joi.string().valid(...Object.values(PRODUCT_STATUS)).default(PRODUCT_STATUS.IN_STOCK)
    }).required(),

    // Media
    images: Joi.string().default(null),

    // Timestamps
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'slug']

// Validation
const validateBeforeCreate = async (data) => {
    return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        let slug = validData.slug
        if (!slug) {
            slug = await generateUniqueSlug(validData.name, PRODUCT_COLLECTION_NAME)
        }

        const newProductToAdd = {
            ...validData,
            slug,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const createProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(newProductToAdd)


        return createProduct
    } catch (error) {
        throw new Error(error)
    }
}
const findOneBySlug = async (slug) => {
    try {
        const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
            slug: slug
        })
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })


        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getAllData = async () => {
    try {
        const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({}).toArray()
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const deleteProduct = async (productId) => {
    try {
        const deleteResult = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndDelete({ _id: new ObjectId(productId) });

        return deleteResult
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (id, data) => {
    try {
        const condition = { _id: new ObjectId(id) }

        // Chỉ update những field có giá trị
        const updateData = { ...data }

        if (updateData.name && !updateData.slug) {
            const newSlug = await generateUniqueSlug(updateData.name, PRODUCT_COLLECTION_NAME, id)
            updateData.slug = newSlug
        }

        delete updateData._id // Không cho update _id

        const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
            condition,
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
        }

        return result
    } catch (error) {
        throw error
    }
}
const getProductDetail = async (productName) => {
    try {
        const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
            slug: productName
        })
        return result
        
    } catch (error) {
        throw new Error(error)
    }
}
export const productModel = {
    createNew,
    findOneById,
    getAllData,
    deleteProduct,
    getProductDetail,
    update,
    findOneBySlug

}