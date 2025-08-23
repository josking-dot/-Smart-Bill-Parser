import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Create contents array with inline image data
    const contents = [
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      {
        text: `Please analyze this bill/receipt image and extract all items with their prices. Return the data in a structured JSON format like this:
        {
          "items": [
            {"name": "Item Name", "price": "0.00"},
            {"name": "Another Item", "price": "0.00"}
          ],
          "total": "0.00",
          "currency": "USD"
        }
        
        Only return the JSON data, no additional text.`
      }
    ];

    // Generate content with inline image data
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
    });

    const text = response.text;
    
    // Try to parse the JSON response
    let parsedData;
    try {
      // Remove any markdown formatting if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      // If JSON parsing fails, return raw text
      parsedData = { error: "Could not parse response", rawText: text };
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error processing bill:', error);
    return NextResponse.json(
      { error: 'Failed to process bill: ' + error.message }, 
      { status: 500 }
    );
  }
}
