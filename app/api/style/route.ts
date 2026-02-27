import { NextRequest, NextResponse } from 'next/server';

// Vercel 함수 타임아웃 설정 (60초)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { image, style } = await request.json();

    // API 키 확인 (Hugging Face는 무료지만 API 키 필요)
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({
        success: false,
        error: 'AI API 키가 설정되지 않았습니다. .env.local 파일에 HUGGINGFACE_API_TOKEN을 추가해주세요. https://huggingface.co/settings/tokens 에서 무료로 발급받을 수 있습니다.',
        needsApiKey: true
      }, { status: 400 });
    }

    // 스타일별 프롬프트 정의
    const stylePrompts: Record<string, { prompt: string; negative_prompt: string }> = {
      modern: {
        prompt: 'modern interior design, sleek contemporary furniture, minimalist decor, clean lines, neutral colors with accent pieces, large windows, natural light, open space, designer furniture, high-end finishes, polished surfaces, professional interior photography, 8k, high quality',
        negative_prompt: 'cluttered, messy, old-fashioned, dirty, dark, poor lighting, low quality, blurry, distorted, deformed'
      },
      minimal: {
        prompt: 'minimalist interior design, simple clean furniture, white and neutral tones, uncluttered space, functional design, natural materials, subtle textures, plenty of white space, organized, zen-like atmosphere, professional interior photography, 8k, high quality',
        negative_prompt: 'cluttered, busy, colorful, ornate, decorative, messy, dark, poor lighting, low quality, blurry'
      },
      nordic: {
        prompt: 'nordic scandinavian interior design, warm wooden furniture, natural materials, cozy textiles, neutral color palette with natural tones, hygge atmosphere, functional simplicity, natural light, plants, comfortable seating, professional interior photography, 8k, high quality',
        negative_prompt: 'dark, cluttered, artificial, plastic, messy, poor lighting, low quality, cold atmosphere, blurry'
      },
      classic: {
        prompt: 'classic luxury interior design, elegant traditional furniture, rich materials, sophisticated color palette, ornate details, high-quality finishes, timeless elegance, refined atmosphere, crystal lighting, expensive materials, professional interior photography, 8k, high quality',
        negative_prompt: 'cheap, modern, minimalist, cluttered, messy, poor lighting, low quality, dated, blurry'
      }
    };

    const selectedPrompts = stylePrompts[style] || stylePrompts.modern;

    console.log('AI 스타일링 시작 (Hugging Face):', { style, imageLength: image.length });

    // Hugging Face Inference API 호출 - Stable Diffusion XL (완전 무료)
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${selectedPrompts.prompt}`,
          parameters: {
            negative_prompt: selectedPrompts.negative_prompt,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 1024,
            height: 768,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API 오류:', response.status, errorText);

      // 모델이 로딩 중인 경우
      if (response.status === 503) {
        return NextResponse.json({
          success: false,
          error: 'AI 모델이 준비 중입니다. 20초 정도 후에 다시 시도해주세요.',
          modelLoading: true
        }, { status: 503 });
      }

      throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
    }

    // 이미지 데이터를 base64로 변환
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const styledImage = `data:image/png;base64,${base64Image}`;

    console.log('AI 스타일링 완료 (Hugging Face)');

    return NextResponse.json({
      success: true,
      styledImage: styledImage,
      style: style
    });

  } catch (error: any) {
    console.error('스타일링 API 오류:', error);

    // 에러 메시지 개선
    let errorMessage = 'AI 스타일링 처리 중 오류가 발생했습니다.';

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message?.includes('authentication') || error.message?.includes('401')) {
      errorMessage = 'API 인증에 실패했습니다. API 키를 확인해주세요.';
    } else if (error.message?.includes('503')) {
      errorMessage = 'AI 모델이 준비 중입니다. 잠시 후 다시 시도해주세요.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message
      },
      { status: 500 }
    );
  }
}
