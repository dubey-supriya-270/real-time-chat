require('dotenv').config() 
import { RekognitionClient, CreateCollectionCommand } from "@aws-sdk/client-rekognition"

console.log("Region:", process.env.AWS_REGION)
console.log("Collection ID:", process.env.REKOGNITION_COLLECTION_ID)

const client = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function createCollection() {
  const command = new CreateCollectionCommand({
    CollectionId: process.env.REKOGNITION_COLLECTION_ID!,
  })

  try {
    const response = await client.send(command)
    console.log("✅ Rekognition collection created:", response.CollectionArn)
  } catch (err) {
    console.error("❌ Failed to create collection:", err)
  }
}

createCollection()
