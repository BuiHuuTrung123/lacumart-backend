import { cartModel } from '~/models/cartModel'
import { productModel } from '~/models/productModel'
const createNew = async (reqBody) => {
    try {

        // XÓA: không tạo slug nữa
        const cartData = {
            ...reqBody,

        };

        const createdCart = await cartModel.createNew(cartData)
        const getNewCart = await cartModel.findOneById(createdCart.insertedId)

        return getNewCart

    } catch (error) {
        throw error
    }
}

// const updateQualityItemToCart = async (productId, cartActiveId, signal) => {
//     try {


//         // Tạo object update data - chỉ những field có giá trị
//         const updateData = { ...reqBody };



//         // Gọi model update
//         const updateQualityItem = await cartModel.updateQualityItemToCart(productId, updateData);

//         return updateQualityItem;

//     } catch (error) {
//         throw error;
//     }
// }
// Trong service - xây dựng item hoàn chỉnh
const addItemToCart = async (userId, productId) => {
    // 1. Kiểm tra product tồn tại và lấy thông tin
    const product = await productModel.findOneById(productId)
    if (!product) throw new Error('Product not found')

    // 2. Xây dựng item hoàn chỉnh cho cart
    const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        quantity: 1
    }

    // 3. Gọi model xử lý (truyền cả userId và item)
    const result = await cartModel.addItemToCart(userId, cartItem)

    // 4. Trả về cart mới nhất

    return result
}


export const cartService = {
    createNew,
    addItemToCart,
    // updateQualityItemToCart
}