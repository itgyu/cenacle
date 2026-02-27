# CenacleDesign 검증 체크리스트

## 보안 검증

### CORS 설정

- [x] Lambda 함수들이 특정 도메인만 허용하도록 설정됨
- [x] 개발 환경에서만 localhost 허용
- [x] OPTIONS preflight 요청 처리

### JWT 인증

- [x] JWT_SECRET 환경변수 필수화
- [x] 기본값 fallback 제거
- [x] 프로덕션에서 기본값 사용 시 에러 발생

### 로깅

- [x] 민감 정보(토큰) 로깅 제거
- [x] 환경 기반 조건부 로깅 적용
- [x] 프로덕션에서 debug 로그 비활성화

---

## 코드 품질 검증

### 타입 안정성

- [x] Dashboard 페이지 `any[]` 제거
- [ ] Projects 페이지 `as any` 캐스팅 제거 (추가 작업 필요)
- [x] API 응답 타입 정의

### ESLint

```bash
npm run lint
# 에러 0개 목표
```

### Prettier

```bash
npm run format:check
# 모든 파일 통과 목표
```

---

## 기능 검증

### 인증 기능

- [x] 회원가입 성공 시나리오
- [x] 회원가입 중복 이메일 에러
- [x] 로그인 성공 시나리오
- [x] 로그인 실패 에러 메시지
- [x] 로그아웃 기능
- [x] 미인증 사용자 리다이렉트

### 프로젝트 관리

- [x] 프로젝트 목록 조회
- [x] 프로젝트 생성
- [x] 프로젝트 상세 조회
- [x] 탭 전환 기능
- [ ] 프로젝트 삭제 (API 미구현)

### 사진 업로드

- [x] Presigned URL 생성
- [x] S3 직접 업로드
- [x] DynamoDB 메타데이터 저장

---

## 테스트 검증

### E2E 테스트 실행

```bash
npm run test:e2e

# 예상 결과:
# ✓ auth.spec.ts (6 tests)
# ✓ project.spec.ts (4 tests)
# ✓ photo.spec.ts (3 tests)
```

### 단위 테스트 실행

```bash
npm test

# 커버리지 목표: 70%+
```

---

## 성능 검증

### 번들 크기

```bash
npm run build
# .next/analyze 확인
```

### Lighthouse 점수

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## 배포 전 체크리스트

### 환경변수 확인

- [ ] `JWT_SECRET` 설정됨
- [ ] `TABLE_NAME` 설정됨
- [ ] `AWS_REGION` 설정됨

### Lambda 배포

- [ ] 공통 모듈 Lambda Layer로 배포
- [ ] 모든 Lambda 함수 업데이트
- [ ] API Gateway 설정 확인

### 프론트엔드 배포

- [ ] Vercel 환경변수 설정
- [ ] Preview 배포 테스트
- [ ] Production 배포

---

## 검증 결과 요약

| 카테고리    | 상태      | 비고                          |
| ----------- | --------- | ----------------------------- |
| 보안 강화   | ✅ 완료   | CORS, JWT, 로깅 개선          |
| 타입 안정성 | 🟡 진행중 | Dashboard 완료, Projects 일부 |
| 테스트 구축 | ✅ 완료   | E2E 테스트 구조 및 시나리오   |
| 문서화      | ✅ 완료   | PDCA 문서 생성                |

**총 진행률: 90%**

### 남은 작업

1. Projects 페이지 `as any` 캐스팅 제거
2. 프로젝트 삭제 API 구현
3. 단위 테스트 추가
4. AI 스타일링 E2E 테스트
