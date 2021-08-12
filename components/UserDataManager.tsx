import { getThumbnailDownloadURL, updateThumbnailURL, uploadThumbnail } from "../api/request/UserRequest"

export function updateThumbnail(uid: string, image: File): Promise<string> {
    return new Promise(resolve => {
        uploadThumbnail(uid, image).then(() => {
            const url = getThumbnailDownloadURL(uid)
            updateThumbnailURL(uid, url).then(() => resolve(url))
        }).catch(error => {
            throw new Error(error.message)
        })
    })
}