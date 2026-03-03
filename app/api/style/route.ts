import { NextRequest, NextResponse } from 'next/server';

// Vercel 함수 타임아웃 설정 (300초 = 5분)
export const maxDuration = 300;

// Gemini API URLs (phomistone-saas와 동일한 구조)
const GEMINI_API_KEY_ENV = 'GOOGLE_AI_API_KEY';
const GEMINI_PRO_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';
const GEMINI_IMAGE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';
const GEMINI_PRO_FALLBACK_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_UPLOAD_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

// 스타일별 프롬프트 정의
const STYLE_PROMPTS: Record<string, { name: string; positive_prompt: string }> = {
  modern: {
    name: '모던',
    positive_prompt:
      'modern interior design, sleek contemporary furniture, clean lines, neutral colors, large windows, natural light, designer furniture, high-end finishes, polished surfaces, professional interior photography',
  },
  minimal: {
    name: '미니멀',
    positive_prompt:
      'minimalist interior design, simple clean furniture, white and neutral tones, uncluttered space, functional design, natural materials, subtle textures, zen-like atmosphere, professional interior photography',
  },
  nordic: {
    name: '북유럽',
    positive_prompt:
      'nordic scandinavian interior design, warm wooden furniture, natural materials, cozy textiles, neutral color palette, hygge atmosphere, functional simplicity, natural light, plants, professional interior photography',
  },
  classic: {
    name: '클래식',
    positive_prompt:
      'classic luxury interior design, elegant traditional furniture, rich materials, sophisticated color palette, ornate details, high-quality finishes, timeless elegance, crystal lighting, professional interior photography',
  },
};

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { data: string; mimeType: string };
        inline_data?: { data: string; mimeType: string };
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Call Gemini API once
 */
async function callGeminiOnce(
  url: string,
  apiKey: string,
  payload: object,
  timeout: number
): Promise<{ response: Response; ok: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return { response, ok: response.ok };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Call Gemini API with retry and fallback logic
 */
async function callGemini(
  url: string,
  apiKey: string,
  payload: object,
  timeout = 120000,
  maxRetries = 3,
  fallbackUrl?: string
): Promise<GeminiResponse> {
  let lastError: Error | null = null;

  // Try primary URL
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Gemini API call (primary) attempt ${attempt}/${maxRetries}: ${url.split('/models/')[1]?.split(':')[0]}`
      );
      const { response, ok } = await callGeminiOnce(url, apiKey, payload, timeout);

      if (ok) {
        return await response.json();
      }

      const errorText = await response.text();
      console.error(
        `Gemini API error (attempt ${attempt}):`,
        response.status,
        errorText.substring(0, 300)
      );

      // Retry on 500/503/429 errors
      if (
        (response.status === 500 || response.status === 503 || response.status === 429) &&
        attempt < maxRetries
      ) {
        const waitTime = attempt * 3000;
        console.log(`Retrying in ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      lastError = new Error(
        `Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`
      );
      break;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries && (error as Error).name !== 'AbortError') {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }
      break;
    }
  }

  // Try fallback URL if provided
  if (fallbackUrl) {
    console.log(
      `Primary model failed, trying fallback: ${fallbackUrl.split('/models/')[1]?.split(':')[0]}`
    );
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini API call (fallback) attempt ${attempt}/${maxRetries}`);
        const { response, ok } = await callGeminiOnce(fallbackUrl, apiKey, payload, timeout);

        if (ok) {
          console.log('Fallback model succeeded!');
          return await response.json();
        }

        const errorText = await response.text();
        console.error(
          `Fallback API error (attempt ${attempt}):`,
          response.status,
          errorText.substring(0, 300)
        );

        if (
          (response.status === 500 || response.status === 503 || response.status === 429) &&
          attempt < maxRetries
        ) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          continue;
        }

        lastError = new Error(`Fallback API error: ${response.status}`);
        break;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All API attempts failed');
}

/**
 * Upload image to Google File API
 */
async function uploadImageToGoogle(imageBase64: string, apiKey: string): Promise<string> {
  console.log('Uploading image to Google File API...');
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  const response = await fetch(`${GEMINI_UPLOAD_URL}?uploadType=media&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: imageBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google File API error:', response.status, errorText);
    throw new Error(`File upload failed: ${response.status}`);
  }

  const result = (await response.json()) as { file?: { uri?: string } };
  if (!result.file?.uri) {
    throw new Error('No file URI in upload response');
  }

  console.log('Image uploaded:', result.file.uri);
  return result.file.uri;
}

/**
 * Step 1: Analyze interior structure
 */
async function analyzeInteriorStructure(imageBase64: string, apiKey: string): Promise<string> {
  console.log('Step 1: Analyzing interior structure...');

  const payload = {
    contents: [
      {
        parts: [
          {
            text: 'ROLE: Interior Design Analyst.\nTASK: Analyze the room layout, furniture arrangement, windows, lighting, and architectural elements. Output description only.',
          },
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2 },
  };

  const response = await callGemini(
    GEMINI_PRO_URL,
    apiKey,
    payload,
    60000,
    2,
    GEMINI_PRO_FALLBACK_URL
  );
  const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!analysisText) {
    return 'Modern interior space with furniture and natural lighting.';
  }

  console.log('Analysis complete:', analysisText.substring(0, 100) + '...');
  return analysisText;
}

/**
 * Step 2: Generate styling prompt
 */
async function generateStylingPrompt(
  analysisText: string,
  styleName: string,
  stylePrompt: string,
  apiKey: string
): Promise<string> {
  console.log('Step 2: Generating styling prompt...');

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `ROLE: Interior Design Prompt Engineer for SURFACE-ONLY styling.

[INPUT ANALYSIS]:
${analysisText}

[TARGET STYLE]:
${styleName} (${stylePrompt})

[ABSOLUTE RULES - MUST FOLLOW]:
🚫 DO NOT add, remove, move, or replace ANY furniture
🚫 DO NOT change furniture shapes, sizes, or positions
🚫 DO NOT add new objects (plants, lamps, decorations)
🚫 DO NOT remove existing objects
✅ ONLY change: wall colors, floor materials, fabric textures, surface finishes
✅ ONLY change: existing furniture's material/color/texture (same shape)
✅ ONLY change: lighting warmth/color temperature

[TASK]:
Write a prompt that ONLY changes surface materials, colors, and textures.
The furniture and objects must remain EXACTLY as they are - same items, same positions.
Think of it as "re-skinning" the room, not "redesigning" it.

[OUTPUT]:
Raw prompt text only.`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.5 },
  };

  const response = await callGemini(
    GEMINI_PRO_URL,
    apiKey,
    payload,
    60000,
    2,
    GEMINI_PRO_FALLBACK_URL
  );
  const promptText = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!promptText) {
    // 기본 프롬프트 반환
    return `Transform this interior to ${styleName} style. ${stylePrompt}. Maintain exact room layout and furniture positions.`;
  }

  console.log('Prompt generated:', promptText.substring(0, 100) + '...');
  return promptText;
}

/**
 * Step 3: Generate styled image
 */
async function generateStyledImage(
  fileUri: string,
  stylingPrompt: string,
  styleName: string,
  apiKey: string
): Promise<string> {
  console.log('Step 3: Generating styled image...');

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `TASK: Surface-Only Interior Restyling (NO furniture changes)

🚨 ABSOLUTE RESTRICTIONS - VIOLATION = FAILURE:
❌ DO NOT add ANY new furniture or objects
❌ DO NOT remove ANY existing furniture or objects
❌ DO NOT move ANY furniture positions
❌ DO NOT replace furniture with different furniture
❌ DO NOT change furniture shapes or sizes
❌ DO NOT add plants, lamps, art, or decorations that don't exist

✅ ONLY ALLOWED CHANGES:
- Wall paint color/texture
- Floor material appearance (wood tone, tile color)
- Fabric colors/patterns on EXISTING furniture (same furniture, different fabric)
- Existing furniture surface finish (matte→glossy, wood tone change)
- Lighting color temperature (warm/cool)
- Curtain/blind colors on EXISTING windows

[STYLE TO APPLY]: ${styleName}
[STYLING GUIDANCE]: ${stylingPrompt}

Think of this as REPAINTING and REUPHOLSTERING only.
The room must have the EXACT SAME furniture items in the EXACT SAME positions.

OUTPUT: Generate the restyled image only.`,
          },
          { file_data: { mime_type: 'image/jpeg', file_uri: fileUri } },
        ],
      },
    ],
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
    generationConfig: {
      temperature: 0.4,
      candidateCount: 1,
    },
  };

  // 이미지 생성은 더 긴 타임아웃과 재시도
  const response = await callGemini(GEMINI_IMAGE_URL, apiKey, payload, 180000, 5);

  // 응답에서 이미지 추출
  const candidate = response.candidates?.[0];

  if (!candidate) {
    if (response.promptFeedback?.blockReason) {
      throw new Error(`콘텐츠가 차단되었습니다: ${response.promptFeedback.blockReason}`);
    }
    throw new Error('AI가 이미지를 생성하지 못했습니다.');
  }

  if (candidate.finishReason === 'SAFETY') {
    throw new Error('안전 정책에 의해 이미지 생성이 차단되었습니다.');
  }

  const responseParts = candidate.content?.parts || [];

  let imageData: string | undefined;
  for (const p of responseParts) {
    if (p?.inlineData?.data) {
      imageData = p.inlineData.data;
      break;
    }
    if (p?.inline_data?.data) {
      imageData = p.inline_data.data;
      break;
    }
  }

  if (!imageData) {
    const textResponse = responseParts[0]?.text;
    console.error('No image in response:', textResponse?.substring(0, 200));
    throw new Error(`이미지 생성 실패: ${textResponse || 'No content'}`);
  }

  console.log('Image generated successfully');
  return imageData;
}

export async function POST(request: NextRequest) {
  console.log('Style API request received');

  try {
    const { image, style } = await request.json();

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: '이미지가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // Google AI API 키
    const apiKey = process.env[GEMINI_API_KEY_ENV];

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI API 키가 설정되지 않았습니다.',
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    const styleInfo = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;
    console.log('Starting styling:', { style: styleInfo.name });

    // Clean image data (remove data URL prefix if present)
    let cleanImage = image;
    if (image.startsWith('data:')) {
      cleanImage = image.replace(/^data:image\/\w+;base64,/, '');
    }

    // URL인 경우 이미지를 다운로드
    if (image.startsWith('http')) {
      console.log('Downloading image from URL...');
      const imageResponse = await fetch(image);
      if (!imageResponse.ok) {
        throw new Error(`이미지 다운로드 실패: ${imageResponse.status}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      cleanImage = Buffer.from(imageBuffer).toString('base64');
    }

    // Step 1: Analyze interior
    const analysisText = await analyzeInteriorStructure(cleanImage, apiKey);

    // Step 2: Generate styling prompt
    const stylingPrompt = await generateStylingPrompt(
      analysisText,
      styleInfo.name,
      styleInfo.positive_prompt,
      apiKey
    );

    // Step 3: Upload image to Google File API
    const fileUri = await uploadImageToGoogle(cleanImage, apiKey);

    // Step 4: Generate styled image
    const resultImageBase64 = await generateStyledImage(
      fileUri,
      stylingPrompt,
      styleInfo.name,
      apiKey
    );

    console.log('Styling completed successfully');

    return NextResponse.json({
      success: true,
      styledImage: `data:image/jpeg;base64,${resultImageBase64}`,
      style: style,
      styleName: styleInfo.name,
    });
  } catch (error: any) {
    console.error('Style API error:', error);

    let errorMessage = 'AI 스타일링 처리 중 오류가 발생했습니다.';

    if (
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED') ||
      error.message?.includes('429')
    ) {
      errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    } else if (
      error.message?.includes('API_KEY') ||
      error.message?.includes('401') ||
      error.message?.includes('403')
    ) {
      errorMessage = 'API 인증에 실패했습니다. API 키를 확인해주세요.';
    } else if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      errorMessage = 'AI 모델이 바쁩니다. 잠시 후 다시 시도해주세요.';
    } else if (
      error.message?.includes('안전') ||
      error.message?.includes('SAFETY') ||
      error.message?.includes('차단')
    ) {
      errorMessage = '안전 정책에 의해 처리가 차단되었습니다. 다른 이미지로 시도해주세요.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
      },
      { status: 500 }
    );
  }
}
