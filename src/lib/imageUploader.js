import { supabase, LISTING_PHOTOS_BUCKET, PART_REQUEST_PHOTOS_BUCKET } from './supabaseClient'

// Redimensionne et compresse les photos d'annonces avant upload (exigence
// performance : images legeres pour la 3G), equivalent de App\Support\ImageUploader.
async function compressToWebp(file, maxWidth = 1600, quality = 0.8) {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)

    return await new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Compression image echouee'))),
            'image/webp',
            quality
        )
    })
}

export async function storeCompressedPhoto(file, directory) {
    const blob = await compressToWebp(file)
    const path = `${directory}/${crypto.randomUUID()}.webp`

    const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(path, blob, {
        contentType: 'image/webp',
        upsert: false,
    })

    if (error) throw error

    return path
}

export function photoUrl(path) {
    return supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteStoredPhoto(path) {
    await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([path])
}

// Photo jointe par un visiteur a une demande de piece — upload public, sans authentification.
export async function storePartRequestPhoto(file) {
    const blob = await compressToWebp(file)
    const path = `${crypto.randomUUID()}.webp`

    const { error } = await supabase.storage.from(PART_REQUEST_PHOTOS_BUCKET).upload(path, blob, {
        contentType: 'image/webp',
        upsert: false,
    })

    if (error) throw error

    return path
}

export async function storePartRequestPhotos(files) {
    return Promise.all(files.map((file) => storePartRequestPhoto(file)))
}

export function partRequestPhotoUrl(path) {
    return supabase.storage.from(PART_REQUEST_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl
}
