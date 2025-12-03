import { getDatabase } from "./mongodb"
import type { ObjectId } from "mongodb"

export interface ProductDB {
  _id?: ObjectId
  id: number
  nombre: string
  categoria: string
  precioCompra: number
  precioOriginal: number
  precioFinal: number
  descripcion: string
  imagen: string
  etiqueta: string | null
  stock: number
}

export async function getAllProducts(): Promise<ProductDB[]> {
  const db = await getDatabase()
  const products = await db.collection<ProductDB>("products").find({}).toArray()
  return products.map((p) => ({
    ...p,
    _id: undefined,
  }))
}

export async function getProductById(id: number): Promise<ProductDB | null> {
  const db = await getDatabase()
  return db.collection<ProductDB>("products").findOne({ id })
}

export async function getProductsByCategory(category: string): Promise<ProductDB[]> {
  const db = await getDatabase()
  const products = await db.collection<ProductDB>("products").find({ categoria: category }).toArray()
  return products.map((p) => ({
    ...p,
    _id: undefined,
  }))
}

export async function searchProducts(query: string): Promise<ProductDB[]> {
  const db = await getDatabase()
  const regex = new RegExp(query, "i")
  const products = await db
    .collection<ProductDB>("products")
    .find({
      $or: [{ nombre: regex }, { categoria: regex }, { descripcion: regex }],
    })
    .toArray()
  return products.map((p) => ({
    ...p,
    _id: undefined,
  }))
}

export async function createProduct(product: Omit<ProductDB, "_id" | "id">): Promise<ProductDB> {
  const db = await getDatabase()
  const lastProduct = await db.collection<ProductDB>("products").findOne({}, { sort: { id: -1 } })
  const newId = lastProduct ? lastProduct.id + 1 : 1

  const newProduct: ProductDB = {
    ...product,
    id: newId,
  }

  await db.collection<ProductDB>("products").insertOne(newProduct)
  return { ...newProduct, _id: undefined }
}

export async function updateProduct(id: number, updates: Partial<ProductDB>): Promise<ProductDB | null> {
  const db = await getDatabase()
  const { _id, ...updateData } = updates

  await db.collection<ProductDB>("products").updateOne({ id }, { $set: updateData })

  return getProductById(id)
}

export async function deleteProduct(id: number): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection<ProductDB>("products").deleteOne({ id })
  return result.deletedCount === 1
}

export async function getCategories(): Promise<string[]> {
  const db = await getDatabase()
  const categories = await db.collection<ProductDB>("products").distinct("categoria")
  return categories
}

export async function getProductsCount(): Promise<number> {
  const db = await getDatabase()
  return db.collection<ProductDB>("products").countDocuments()
}
