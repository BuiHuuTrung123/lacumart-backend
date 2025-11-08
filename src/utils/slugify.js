// ~/utils/slugify.js
import slugify from 'slugify'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import productModel from '~/models/productModel'


export const generateUniqueSlug = async (name, collectionName, excludeId = null) => {
    const db = GET_DB()
    
    let baseSlug = slugify(name, {
        lower: true,
        strict: true,
        locale: 'vi',
        remove: /[*+~.()'"!:@]/g
    })
    
    let slug = baseSlug
   
    let counter = 1
    
    while (true) {
        const query = { slug }
        if (excludeId) {
            query._id = { $ne: new ObjectId(excludeId) }
        }
        
        const existingProduct = await db.collection(collectionName).findOne(query)
        if (!existingProduct) break
        
        slug = `${baseSlug}-${counter}`
        counter++
    }
    
    return slug
}