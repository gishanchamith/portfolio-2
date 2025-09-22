import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET
    if (!bucket) {
      throw new Error("SUPABASE_STORAGE_BUCKET is not defined")
    }

    const supabase = createClient()
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin"
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = `uploads/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    const {
      data: { publicUrl },
      error: publicUrlError,
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    if (publicUrlError) {
      console.error("Supabase public URL error:", publicUrlError)
      return NextResponse.json({ error: "Failed to create public URL" }, { status: 500 })
    }

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const runtime = "nodejs"
