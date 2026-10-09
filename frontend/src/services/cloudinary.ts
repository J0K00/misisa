export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo"
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "genealogie_unsigned"

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload vers Cloudinary")
  }

  const data = await response.json()
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  }
}
