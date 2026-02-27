import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { projectName, location, area, rooms, bathrooms, concept, color } = await request.json();

    // 컨셉별 스타일 키워드
    const conceptStyles: Record<string, string> = {
      modern: '세련되고 현대적인',
      minimal: '심플하고 깔끔한',
      nordic: '따뜻하고 자연스러운 북유럽',
      luxury: '고급스럽고 화려한'
    };

    // 색상별 설명
    const colorDescriptions: Record<string, string> = {
      white: '밝고 깨끗한 화이트 톤으로 공간을 더욱 넓어 보이게',
      beige: '따뜻하고 부드러운 베이지 톤으로 아늑한 분위기를',
      gray: '차분하고 모던한 그레이 톤으로 세련된 느낌을',
      dark: '고급스러운 다크 톤으로 깊이 있는 공간을'
    };

    const selectedStyle = conceptStyles[concept] || conceptStyles.modern;
    const selectedColor = colorDescriptions[color] || colorDescriptions.white;

    // 블로그 콘텐츠 생성 (긴 형식)
    const blogContent = `${projectName} - ${selectedStyle} 인테리어 리모델링 프로젝트

${location}에 위치한 ${area}평형 주거 공간의 완벽한 변신을 소개합니다.

이번 프로젝트는 ${rooms}개의 방과 ${bathrooms}개의 욕실을 갖춘 공간을 ${selectedStyle} 스타일로 재탄생시켰습니다. ${selectedColor} 연출했으며, 시공 전후 비교를 통해 공간의 놀라운 변화를 확인할 수 있습니다.

주요 특징:
• ${selectedStyle} 디자인 컨셉 적용
• ${selectedColor.split('으로')[0]} 기반의 색상 구성
• 넓고 밝은 거실 공간 조성
• 실용적인 수납 공간 확보
• 자연광을 최대한 활용한 배치

시공 전에는 낡고 어두웠던 공간이 ${selectedStyle} 분위기로 완전히 변모했습니다. 특히 ${color} 컬러를 활용한 조명과 마감재 선택을 통해 공간감을 극대화했습니다.

이 프로젝트를 통해 일상이 더욱 편안하고 아름다워졌습니다.`;

    // 인스타그램 콘텐츠 생성 (짧은 형식 + 이모지)
    const instagramContent = `✨ ${projectName} 완성!

${location} ${area}평 ${selectedStyle} 인테리어 리모델링 프로젝트가 완성되었습니다 🏠

시공 전과 완전히 다른 모습으로 변신한 우리집! 😍
${selectedColor.replace('으로', '의')} 깔끔한 디자인으로 일상이 더욱 특별해졌어요 💫

Before & After를 직접 확인해보세요! 👆

#인테리어 #리모델링 #${concept}인테리어 #${color}톤`;

    // 컨셉별 해시태그
    const conceptHashtags: Record<string, string[]> = {
      modern: ['#모던인테리어', '#현대적인인테리어', '#모던스타일'],
      minimal: ['#미니멀인테리어', '#심플인테리어', '#미니멀리즘'],
      nordic: ['#북유럽인테리어', '#북유럽스타일', '#스칸디나비안'],
      luxury: ['#럭셔리인테리어', '#고급인테리어', '#프리미엄인테리어']
    };

    // 해시태그 생성
    const hashtags = [
      '#인테리어',
      '#리모델링',
      '#인테리어디자인',
      '#홈스타일링',
      '#집꾸미기',
      ...(conceptHashtags[concept] || conceptHashtags.modern),
      '#아파트인테리어',
      '#신혼집인테리어',
      '#before_after',
      '#집스타그램',
      '#interior',
      '#homedecor',
      '#renovation',
      `#${location}인테리어`,
      '#키스톤파트너스',
      '#keystonepartners'
    ].join(' ');

    return NextResponse.json({
      success: true,
      blog: blogContent,
      instagram: instagramContent,
      hashtags: hashtags
    });

  } catch (error) {
    console.error('AI 에디팅 오류:', error);
    return NextResponse.json(
      { success: false, error: 'AI 에디팅 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
