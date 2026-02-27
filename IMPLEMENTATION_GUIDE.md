# AI 인테리어 스타일링 기능 구현 가이드

이 문서는 Townus 사이트의 기능을 분석하여 Partners 프로젝트에 AI 인테리어 스타일링 기능을 구현한 과정을 담고 있습니다.

## 1. 핵심 시작점: wget을 활용한 전체 사이트 다운로드

### 왜 이 방법이 핵심인가?

웹사이트를 브라우저에서 보는 것만으로는 다음과 같은 한계가 있습니다:
- 큰 파일들을 전체적으로 분석하기 어려움
- 소스 코드 구조를 파악하기 어려움
- 컴포넌트 간 관계를 이해하기 어려움
- 여러 파일을 동시에 비교/분석하기 어려움

**해결책: wget으로 전체 사이트를 로컬에 다운로드**

```bash
# Townus 사이트 전체를 로컬로 다운로드
wget -r -np -k -E https://townus.vercel.app

# 또는 더 상세한 옵션으로:
wget --recursive \
     --no-parent \
     --convert-links \
     --page-requisites \
     --adjust-extension \
     --no-clobber \
     https://townus.vercel.app
```

**옵션 설명:**
- `-r` (--recursive): 재귀적으로 모든 링크 따라가기
- `-np` (--no-parent): 상위 디렉토리로 가지 않기
- `-k` (--convert-links): 로컬에서 작동하도록 링크 변환
- `-E` (--adjust-extension): HTML 파일에 .html 확장자 추가
- `--page-requisites`: CSS, 이미지 등 페이지 렌더링에 필요한 모든 파일 다운로드
- `--no-clobber`: 이미 존재하는 파일은 덮어쓰지 않기

### 이 방법의 장점

1. **전체 파일 구조 파악 가능**
   ```bash
   # 다운로드 후 파일 구조 확인
   cd townus.vercel.app
   tree -L 3
   ```

   이제 모든 페이지, 이미지, 스타일시트를 한눈에 볼 수 있습니다.

2. **대용량 파일 분석 가능**
   - Claude Code의 Read 도구로 큰 파일들을 오프셋/리밋 기능으로 분할 읽기
   - Grep으로 전체 코드베이스에서 특정 패턴 검색
   - 여러 파일을 동시에 열어 비교 분석

3. **실제 구현 코드 학습**
   ```bash
   # 특정 기능이 어떻게 구현되었는지 검색
   grep -r "스타일링" townus.vercel.app/
   grep -r "Before.*After" townus.vercel.app/
   ```

4. **리소스 경로 확인**
   - 이미지 파일들의 경로 구조
   - API 엔드포인트 확인
   - 컴포넌트 import 관계 파악

## 2. 다운로드한 사이트 분석 방법

### 2.1 Claude Code를 활용한 체계적 분석

다운로드 후 Claude Code에게 다음과 같이 요청할 수 있습니다:

```
"townus.vercel.app 폴더에서 프로젝트 상세 페이지가 어떻게 구현되어 있는지 분석해줘"
```

Claude Code가 할 수 있는 것:
- **Glob**: 파일 패턴으로 관련 파일들 찾기
  ```
  glob "townus.vercel.app/**/*project*.tsx"
  ```

- **Grep**: 특정 키워드로 코드 검색
  ```
  grep -r "AI" townus.vercel.app/ --type ts
  ```

- **Read**: 큰 파일을 부분적으로 읽기
  ```
  # 1000줄짜리 파일을 200줄씩 읽기
  read townus.vercel.app/page.tsx --offset 0 --limit 200
  read townus.vercel.app/page.tsx --offset 200 --limit 200
  ```

### 2.2 UI/UX 패턴 학습

다운로드한 HTML/CSS에서 다음을 학습할 수 있습니다:

1. **레이아웃 구조**
   - Grid vs Flexbox 사용 패턴
   - 반응형 breakpoint
   - 간격(spacing) 시스템

2. **컴포넌트 패턴**
   - 탭 컴포넌트 구조
   - 모달/다이얼로그 구현
   - 이미지 갤러리 레이아웃

3. **인터랙션**
   - 호버 효과
   - 트랜지션 타이밍
   - 로딩 상태 표시

## 3. 실제 구현 과정

### 3.1 Before/After 비교 슬라이더 구현

Townus 사이트 분석에서 발견한 Before/After 비교 UI를 참고하여 구현했습니다.

**핵심 기술: CSS clip-path**

```tsx
// StylingTab.tsx
<div className="relative w-full h-full">
  {/* After 이미지 (전체) */}
  <Image
    src={styledImage}
    alt="After"
    className="absolute inset-0"
  />

  {/* Before 이미지 (clip-path로 부분만 보이기) */}
  <Image
    src={originalImage}
    alt="Before"
    className="absolute inset-0"
    style={{
      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
    }}
  />

  {/* 슬라이더 */}
  <div
    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
    style={{ left: `${sliderPosition}%` }}
    onMouseDown={handleMouseDown}
  />
</div>
```

**왜 이 방식을 선택했나?**
- `clip-path`는 GPU 가속을 받아 부드러운 애니메이션
- 두 이미지를 겹쳐놓고 한쪽만 잘라내는 방식이 직관적
- 슬라이더 위치에 따라 실시간으로 비교 가능

**마우스 드래그 구현:**
```tsx
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.current) return;

  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;

  const x = e.clientX - rect.left;
  const percentage = (x / rect.width) * 100;
  setSliderPosition(Math.max(0, Math.min(100, percentage)));
};

useEffect(() => {
  if (isDragging.current) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging.current]);
```

### 3.2 대용량 컴포넌트 분리 전략

**문제**: Townus의 프로젝트 페이지는 1000줄이 넘는 거대한 파일이었습니다.

**해결책**: 탭별로 컴포넌트 분리

```
app/projects/[id]/
├── page.tsx                    # 메인 페이지 (라우팅, 상태 관리)
├── components/
│   ├── BeforeTab.tsx          # 시공 전 사진
│   ├── AfterTab.tsx           # 시공 후 사진
│   ├── StylingTab.tsx         # AI 스타일링
│   ├── EditingTab.tsx         # 이미지 편집
│   └── PhotoGallery.tsx       # 저장된 사진 갤러리
├── types/
│   └── index.ts               # TypeScript 타입 정의
└── constants/
    └── index.ts               # 상수 (스타일 옵션 등)
```

**상태 관리 패턴:**
```tsx
// page.tsx - 부모 컴포넌트
const [styledImages, setStyledImages] = useState<StyledImage[]>([]);

// 자식 컴포넌트에 콜백 전달
<StylingTab
  onSaveStyledImage={(img) => {
    setStyledImages(prev => [...prev, img]);
  }}
/>

<PhotoGallery
  images={styledImages}
  onDelete={(id) => {
    setStyledImages(prev => prev.filter(img => img.id !== id));
  }}
/>
```

### 3.3 TypeScript Union Type 처리

**문제**: AI API 응답이 성공/실패 케이스마다 다른 구조

```typescript
type StyleResponse =
  | { success: true; styledImage: string; style: string }
  | { success: false; error: string; needsApiKey?: boolean }
  | { success: false; error: string; modelLoading?: boolean };
```

**Type Guard 활용:**
```tsx
const response = await fetch('/api/style', { ... });
const data = await response.json();

// TypeScript가 자동으로 타입 좁히기
if (!data.success) {
  if (data.needsApiKey) {
    alert('API 키를 설정해주세요');
  } else if (data.modelLoading) {
    alert('AI 모델 로딩 중입니다');
  } else {
    alert(`오류: ${data.error}`);
  }
  return;
}

// 여기서는 data.styledImage가 확실히 존재
setStyledImage(data.styledImage);
```

### 3.4 localStorage를 임시 데이터베이스로 활용

**초기 구현 - Firebase**:
```typescript
// 문제: Firebase 설정 복잡, 비용 발생 가능
import { getFirestore, collection, addDoc } from 'firebase/firestore';
```

**개선 - localStorage**:
```typescript
// 간단하고 무료, 클라이언트 사이드에서 즉시 사용 가능
const saveStyledImage = (image: StyledImage) => {
  const saved = JSON.parse(localStorage.getItem('styledImages') || '[]');
  saved.push(image);
  localStorage.setItem('styledImages', JSON.stringify(saved));
};

const loadStyledImages = (): StyledImage[] => {
  return JSON.parse(localStorage.getItem('styledImages') || '[]');
};
```

**장점:**
- 설정 불필요
- 완전 무료
- 즉시 사용 가능
- 빠른 읽기/쓰기

**한계:**
- 브라우저당 5-10MB 제한
- 서버 간 동기화 불가
- 개발 단계나 MVP에 적합

## 4. AI API 선택 과정

### 4.1 시행착오: Replicate API

**1차 시도: ControlNet Interior Design**
```typescript
const output = await replicate.run(
  "jagilley/controlnet-interior-design:...",
  { input: { image, prompt } }
);
```
결과: 422 Permission Error (모델 접근 권한 없음)

**2차 시도: RossJillian ControlNet**
```typescript
const output = await replicate.run(
  "rossjillian/controlnet:...",
  { input: { image, prompt } }
);
```
결과: 422 Permission Error

**3차 시도: Stability AI SDXL**
```typescript
const output = await replicate.run(
  "stability-ai/sdxl:...",
  { input: { prompt } }
);
```
결과: 402 Payment Required (무료 크레딧 소진)

**문제점:**
- 무료 크레딧이 빠르게 소진됨
- ControlNet 모델은 유료 플랜 필요
- 결과물 나오기 전에 크레딧 소진

### 4.2 최종 해결: Hugging Face Inference API

**왜 Hugging Face인가?**
1. **완전 무료** - 회원가입만 하면 무제한 사용
2. **인증 간단** - Read 토큰만 있으면 됨
3. **Stable Diffusion XL 지원** - 고품질 이미지 생성
4. **공식 API** - 안정적인 서비스

**구현:**
```typescript
// app/api/style/route.ts
export const maxDuration = 60; // Vercel 타임아웃 설정

export async function POST(request: NextRequest) {
  const { image, style } = await request.json();
  const apiToken = process.env.HUGGINGFACE_API_TOKEN;

  // 스타일별 프롬프트 정의
  const stylePrompts: Record<string, {
    prompt: string;
    negative_prompt: string
  }> = {
    modern: {
      prompt: 'modern interior design, sleek contemporary furniture, minimalist decor, clean lines, neutral colors with accent pieces, large windows, natural light, open space, designer furniture, high-end finishes, polished surfaces, professional interior photography, 8k, high quality',
      negative_prompt: 'cluttered, messy, old-fashioned, dirty, dark, poor lighting, low quality, blurry, distorted, deformed'
    },
    // ... 다른 스타일들
  };

  // Hugging Face Inference API 호출
  const response = await fetch(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: stylePrompts[style].prompt,
        parameters: {
          negative_prompt: stylePrompts[style].negative_prompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 768,
        }
      })
    }
  );

  // 이미지를 base64로 변환
  const imageBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');

  return NextResponse.json({
    success: true,
    styledImage: `data:image/png;base64,${base64Image}`,
    style
  });
}
```

**에러 처리:**
```typescript
// 503: 모델 로딩 중
if (response.status === 503) {
  return NextResponse.json({
    success: false,
    error: 'AI 모델이 준비 중입니다. 20초 정도 후에 다시 시도해주세요.',
    modelLoading: true
  }, { status: 503 });
}

// 401: 인증 실패
if (error.message?.includes('authentication') || error.message?.includes('401')) {
  errorMessage = 'API 인증에 실패했습니다. API 키를 확인해주세요.';
}
```

### 4.3 한계점과 개선 방향

**현재 한계:**
- Text-to-image 방식이라 원본 이미지 구조 보존 안됨
- 완전히 새로운 공간이 생성됨
- 실제 시공 후 사진에 가구를 추가하는 것이 아님

**이상적인 솔루션: ControlNet**
```python
# ControlNet을 사용하면 구조 보존 가능 (로컬에서 실행 필요)
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel

controlnet = ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_seg")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet
)

# 원본 이미지의 구조를 유지하면서 스타일 적용
output = pipe(
    prompt="modern interior design",
    image=control_image,  # 원본 이미지
    controlnet_conditioning_scale=0.8
)
```

**대안:**
1. **Hugging Face img2img**: Text-to-image 대신 img2img 파이프라인 사용
2. **로컬 Stable Diffusion**: GPU가 있다면 로컬에서 ControlNet 실행
3. **Hybrid 방식**: 주요 요소는 보존하고 스타일만 변경

## 5. Vercel 배포

### 5.1 환경 변수 설정

**로컬 개발:**
```bash
# .env.local
HUGGINGFACE_API_TOKEN=hf_your_token_here
```

**Vercel 배포:**
```bash
# Vercel CLI로 환경 변수 추가
echo "hf_your_token_here" | vercel env add HUGGINGFACE_API_TOKEN production

# 환경 변수 확인
vercel env ls
```

### 5.2 배포 과정

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login
# 브라우저에서 인증 완료

# 3. 첫 배포
vercel --yes
# 프로젝트 설정 및 배포

# 4. 환경 변수 추가 후 재배포
vercel --prod
# 또는 git push로 자동 배포 트리거

# 5. 환경 변수 반영을 위한 빈 커밋
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push
```

### 5.3 Vercel 설정

```typescript
// app/api/style/route.ts
export const maxDuration = 60; // AI 생성은 시간이 걸리므로 60초 설정
```

**vercel.json** (선택사항):
```json
{
  "functions": {
    "app/api/style/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## 6. 개발 팁과 노하우

### 6.1 Claude Code 활용 패턴

**1. 큰 파일 탐색:**
```
"app/projects/[id]/page.tsx 파일이 너무 크니까 200줄씩 읽어서 AI 스타일링 관련 코드를 찾아줘"
```

**2. 패턴 기반 검색:**
```
"프로젝트 전체에서 'useState<StyledImage'를 검색해서 상태 관리 패턴을 보여줘"
```

**3. 컴포넌트 분리 요청:**
```
"StylingTab 컴포넌트가 너무 크니까 BeforeAfterModal 부분을 별도 컴포넌트로 분리해줘"
```

**4. 타입 추론:**
```
"이 API 응답 구조를 보고 TypeScript 타입을 정의해줘"
```

### 6.2 개발 서버 재시작

환경 변수가 변경되었을 때:
```bash
# Next.js 캐시 완전 삭제 후 재시작
rm -rf .next && npm run dev

# 또는 lock 파일만 삭제
rm -rf .next/dev/lock && npm run dev
```

### 6.3 Git 워크플로우

```bash
# 여러 커밋을 하나로 합치기 (깔끔한 히스토리)
git reset --soft HEAD~5  # 최근 5개 커밋 취소
git commit -m "feat: Add AI interior styling feature"

# 환경 변수 반영을 위한 빈 커밋
git commit --allow-empty -m "Trigger rebuild"
git push

# Vercel 자동 배포 확인
vercel inspect [deployment-url]
```

### 6.4 디버깅 팁

**Next.js 서버 로그 확인:**
```typescript
// app/api/style/route.ts
console.log('AI 스타일링 시작:', { style, imageLength: image.length });
console.log('Hugging Face API 응답:', response.status);
```

**브라우저 콘솔:**
```typescript
// 프론트엔드에서
console.log('API 요청:', { image: image.substring(0, 50), style });
```

**Vercel 로그:**
```bash
# 실시간 로그 확인
vercel logs [deployment-url] --follow
```

## 7. 핵심 교훈

### 완전 무료로 구현하기
- Firebase → localStorage
- Replicate → Hugging Face
- 유료 모델 → 무료 공개 모델

### 큰 파일 다루기
1. wget으로 전체 다운로드
2. Claude Code의 오프셋/리밋 기능 활용
3. 컴포넌트 분리로 관리 가능한 크기로 만들기

### 다른 사이트 분석하기
1. wget으로 전체 다운로드
2. 파일 구조 파악 (tree 명령어)
3. Grep으로 키워드 검색
4. Read로 파일 내용 상세 분석
5. UI 패턴과 코드 패턴 학습

### API 선택 기준
1. 무료 여부 확인
2. 사용량 제한 확인
3. 인증 방식의 복잡도
4. 응답 속도와 품질
5. 에러 처리와 문서화 수준

### TypeScript 활용
- Union type으로 다양한 응답 처리
- Type guard로 안전한 타입 좁히기
- 인터페이스 분리로 재사용성 높이기

## 8. 다음 단계

### 가능한 개선사항
1. **Image-to-Image 파이프라인 적용**
   - Hugging Face의 img2img 모델 탐색
   - 원본 구조를 더 잘 보존하는 방법

2. **캐싱 전략**
   - 같은 이미지+스타일 조합은 캐싱
   - localStorage에 최근 생성 이미지 저장

3. **배치 처리**
   - 여러 스타일을 한번에 생성
   - 진행률 표시

4. **품질 개선**
   - 프롬프트 엔지니어링
   - 더 구체적인 negative prompt
   - 이미지 전처리 (리사이징, 압축)

---

**작성자 노트:**
이 문서는 실제 구현 과정에서 겪은 시행착오와 해결책을 담고 있습니다. 특히 wget을 통한 전체 사이트 다운로드와 분석이 가장 핵심적인 기술이었으며, 이를 통해 대용량 파일도 체계적으로 분석할 수 있었습니다.
