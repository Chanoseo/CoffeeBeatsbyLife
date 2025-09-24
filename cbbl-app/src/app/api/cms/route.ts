import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const section = formData.get("section") as string | null;

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const buttonText = formData.get("buttonText") as string | null;
    const content = formData.get("content") as string | null;
    const buttonTextOne = formData.get("buttonTextOne") as string | null;
    const buttonTextTwo = formData.get("buttonTextTwo") as string | null;
    const location = formData.get("location") as string | null;
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;

    const paymentNumber = formData.get("paymentNumber") as string | null;

    const file = formData.get("image") as File | null;

    const existing = await prisma.cMS.findFirst();

    let imageUrl: string | undefined;
    let publicId: string | undefined;

    // 🔥 Upload image
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name.split(".")[0];

      // ✅ Delete old if needed
      if (section === "two" && existing?.landingSecTwoImagePublicId) {
        await cloudinary.uploader.destroy(existing.landingSecTwoImagePublicId);
      }
      if (section === "payment" && existing?.qrCodeImagePublicId) {
        await cloudinary.uploader.destroy(existing.qrCodeImagePublicId);
      }
      if (
        (!section || section === "one") &&
        existing?.landingSecOneImagePublicId
      ) {
        await cloudinary.uploader.destroy(existing.landingSecOneImagePublicId);
      }

      const uploadResult: CloudinaryUploadResult = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cms", public_id: originalName, overwrite: true },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );
          stream.end(buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // ✅ CREATE if no row yet
    if (!existing) {
      const created = await prisma.cMS.create({
        data:
          section === "payment"
            ? {
                qrCodeImage: imageUrl ?? "",
                qrCodeImagePublicId: publicId ?? "",
                paymentNumber: paymentNumber ?? "",
              }
            : section === "two"
            ? {
                landingSecTwoImage: imageUrl ?? "",
                landingSecTwoImagePublicId: publicId ?? "",
                landingSecTwoTitle: title ?? "",
                landingSecTwoDesc: description ?? "",
                landingSecTwoContent: content ?? "",
              }
            : section === "three"
            ? {
                landingSecThreeTitle: title ?? "",
                landingSecThreeDesc: description ?? "",
                landingSecThreeButtonOne: buttonTextOne ?? "",
                landingSecThreeButtonTwo: buttonTextTwo ?? "",
              }
            : section === "four"
            ? {
                landingSecFourTitle: title ?? "",
                landingSecFourDesc: description ?? "",
                landingSecFourLocation: location ?? "",
                landingSecFourPhoneNum: phone ?? "",
                landingSecFourEmail: email ?? "",
              }
            : {
                landingSecOneImage: imageUrl ?? "",
                landingSecOneImagePublicId: publicId ?? "",
                landingSecOneTitle: title ?? "",
                landingSecOneDesc: description ?? "",
                landingSecOneButtonText: buttonText ?? "",
              },
      });
      return NextResponse.json(created, { status: 201 });
    }

    // ✅ UPDATE
    const updateData: Record<string, string> = {};

    if (section === "payment") {
      if (paymentNumber) updateData.paymentNumber = paymentNumber;
      if (imageUrl) updateData.qrCodeImage = imageUrl;
      if (publicId) updateData.qrCodeImagePublicId = publicId;
    } else if (section === "two") {
      if (title) updateData.landingSecTwoTitle = title;
      if (description) updateData.landingSecTwoDesc = description;
      if (content) updateData.landingSecTwoContent = content;
      if (imageUrl) updateData.landingSecTwoImage = imageUrl;
      if (publicId) updateData.landingSecTwoImagePublicId = publicId;
    } else if (section === "three") {
      if (title) updateData.landingSecThreeTitle = title;
      if (description) updateData.landingSecThreeDesc = description;
      if (buttonTextOne) updateData.landingSecThreeButtonOne = buttonTextOne;
      if (buttonTextTwo) updateData.landingSecThreeButtonTwo = buttonTextTwo;
    } else if (section === "four") {
      if (title) updateData.landingSecFourTitle = title;
      if (description) updateData.landingSecFourDesc = description;
      if (location) updateData.landingSecFourLocation = location;
      if (phone) updateData.landingSecFourPhoneNum = phone;
      if (email) updateData.landingSecFourEmail = email;
    } else {
      if (title) updateData.landingSecOneTitle = title;
      if (description) updateData.landingSecOneDesc = description;
      if (buttonText) updateData.landingSecOneButtonText = buttonText;
      if (imageUrl) updateData.landingSecOneImage = imageUrl;
      if (publicId) updateData.landingSecOneImagePublicId = publicId;
    }

    const updated = await prisma.cMS.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("POST /api/cms error:", error);
    return NextResponse.json(
      { error: "Failed to update CMS entry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const existing = await prisma.cMS.findFirst();
    return NextResponse.json(existing || {});
  } catch (error) {
    console.error("GET /api/cms error:", error);
    return NextResponse.json({ error: "Failed to fetch CMS" }, { status: 500 });
  }
}
