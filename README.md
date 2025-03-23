# Producto - AI 제품 이미지 생성 서비스

Producto는 AI 기술을 활용하여 제품 이미지를 생성하고 관리할 수 있는 웹 서비스입니다. 사용자가 제품 정보와 샘플 이미지를 업로드하면 AI가 전문적인 제품 이미지를 생성해주는 서비스를 제공합니다.

![Producto 메인 이미지](public/logo.svg)

## 주요 기능

### 1. AI 제품 이미지 생성
- 제품 정보(이름, 설명, 가격, 카테고리) 입력
- 다양한 각도의 제품 샘플 이미지 업로드
- AI를 활용한 고품질 제품 이미지 생성

### 2. 사용자 활동 히스토리
- 사용자의 이미지 생성 히스토리 조회
- 생성된 이미지 모아보기 및 확대 보기
- 생성된 이미지 ZIP 파일로 다운로드

### 3. 사용자 관리
- 계정 생성 및 로그인
- 개인 프로필 관리

### 4. 고객 지원
- 문의하기 기능을 통한 질문 제출
- QnA 관리 시스템

## 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **상태 관리**: React Context API

### 백엔드
- **데이터베이스**: Supabase
- **인증**: Supabase Auth
- **이미지 저장**: Supabase Storage
- **서버리스 함수**: Next.js API Routes

### 패키지 & 라이브러리
- **react-dropzone**: 이미지 업로드 UI
- **lucide-react**: 아이콘
- **jszip & file-saver**: 이미지 ZIP 다운로드

## 설치 및 실행 방법

### 필수 요구사항
- Node.js 16.x 이상
- npm 또는 yarn

### 설치 과정

1. 저장소 클론
```bash
git clone https://github.com/yourusername/producto.git
cd producto
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정합니다:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 데이터베이스 세팅

### Supabase 테이블 구조

프로젝트에서 사용하는 주요 테이블은 다음과 같습니다:

1. **users** - 사용자 정보
   - id (UUID, PK)
   - email (TEXT)
   - full_name (TEXT)
   - avatar_url (TEXT)
   - session_ids (ARRAY)
   - created_at (TIMESTAMP)

2. **products** - 제품 정보
   - id (UUID, PK)
   - user_id (UUID, FK)
   - name (TEXT)
   - description (TEXT)
   - price (TEXT)
   - category (TEXT)
   - image_urls (ARRAY)
   - created_at (TIMESTAMP)

3. **generate_session** - 이미지 생성 세션
   - id (UUID, PK)
   - user_id (UUID, FK)
   - product_name (TEXT)
   - product_description (TEXT)
   - product_price (TEXT)
   - product_category (TEXT)
   - sample_image_urls (ARRAY)
   - generated_image_urls (ARRAY)
   - status (TEXT)
   - created_at (TIMESTAMP)

4. **qna** - 문의 및 질문
   - id (UUID, PK)
   - user_id (UUID, FK)
   - name (TEXT)
   - email (TEXT)
   - question (TEXT)
   - answer (TEXT)
   - status (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - answered_at (TIMESTAMP)

### 테이블 생성 스크립트

`migrations` 폴더에 SQL 스크립트가 포함되어 있습니다. Supabase SQL 편집기에서 이 스크립트를 실행하여 필요한 테이블을 생성할 수 있습니다.

## 폴더 구조

```
producto/
├── app/                  # Next.js App Router
│   ├── api/              # API 라우트
│   ├── components/       # 리액트 컴포넌트
│   ├── context/          # 컨텍스트 API
│   ├── lib/              # 유틸리티 함수
│   └── ...               # 라우트 페이지
├── public/               # 정적 파일
├── migrations/           # DB 마이그레이션 스크립트
├── styles/               # 글로벌 스타일
└── ...                   # 설정 파일
```

## 주요 컴포넌트

- **FittingRoom**: 제품 이미지 생성 폼
- **ActivityHistory**: 사용자 활동 내역 표시
- **ContactModal**: 문의하기 양식
- **Navbar**: 네비게이션 바
- **Footer**: 푸터 및 문의하기 모달 연결

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

## 연락처

프로젝트 관련 문의는 다음 이메일로 부탁드립니다:
nex5turbo@gmail.com 