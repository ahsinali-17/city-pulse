import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    let buffer: Buffer;
    let mimeType = "image/jpeg";

    if (imageBase64 && imageBase64 !== "") {
      // Base64 provided directly from a local file upload
      // Assuming format "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      const parts = imageBase64.split(";base64,");
      if (parts.length === 2) {
        mimeType = parts[0].replace("data:", "");
        buffer = Buffer.from(parts[1], "base64");
      } else {
        buffer = Buffer.from(imageBase64, "base64");
      }
    } else {
      // URL provided (from sample photos)
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
      }
      const arrayBuffer = await imageResp.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = imageResp.headers.get("content-type") || "image/jpeg";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `You are an expert triage AI for a smart city hazard reporting system. Analyze the attached image and return a JSON object with the following schema:
    {
      "category": string (must be exactly one of: "Water Leak", "Pothole", "Power Outage", "Traffic Signal", "Tree Branch", "Sanitation"),
      "severity": number (1 to 5, where 5 is the most critical emergency),
      "title": string (A short, descriptive title of the issue),
      "confidence": number (0 to 100 representing your confidence in the assessment)
    }
    Return ONLY raw valid JSON, with no markdown code blocks or extra text.`;

    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process image with AI triage" }, { status: 500 });
  }
}
