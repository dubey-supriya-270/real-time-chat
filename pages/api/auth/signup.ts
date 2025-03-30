import type { NextApiRequest, NextApiResponse } from "next";
import {
  RekognitionClient,
  IndexFacesCommand,
} from "@aws-sdk/client-rekognition";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { signToken } from "@/lib/jwt";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, email, password, image } = req.body;
  if (!username || !email || !password || !image)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const existing = await db.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: "Username exists" });

    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const faceId = uuidv4();

    const command = new IndexFacesCommand({
      CollectionId: process.env.REKOGNITION_COLLECTION_ID!,
      Image: { Bytes: buffer },
      ExternalImageId: faceId,
      DetectionAttributes: [],
    });

    await rekognition.send(command);

    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash: hash,
        rekognitionFaceId: faceId,
      },
    });
    const token = signToken({ id: user.id, username: user.username });

    return res.status(200).json({ message: "Signup successful", token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Signup failed" });
  }
}
