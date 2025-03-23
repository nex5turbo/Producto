-- QnA 테이블 생성
CREATE TABLE IF NOT EXISTS public.qna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'answered', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS qna_user_id_idx ON public.qna(user_id);
CREATE INDEX IF NOT EXISTS qna_status_idx ON public.qna(status);
CREATE INDEX IF NOT EXISTS qna_created_at_idx ON public.qna(created_at);

-- RLS 정책 설정 (Row Level Security)
ALTER TABLE public.qna ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 문의만 조회 가능
CREATE POLICY "Users can view their own qna" ON public.qna
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 문의 생성 가능
CREATE POLICY "Users can create qna" ON public.qna
  FOR INSERT WITH CHECK (true);

-- 관리자만 모든 문의 조회 및 업데이트 가능 (여기서는 is_admin 필드가 있다고 가정)
-- CREATE POLICY "Admins can view all qna" ON public.qna
--   FOR SELECT USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));
-- 
-- CREATE POLICY "Admins can update qna" ON public.qna
--   FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- 함수 트리거 설정: 업데이트 시 updated_at 필드 갱신
CREATE OR REPLACE FUNCTION update_qna_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'answered' AND OLD.status != 'answered' THEN
    NEW.answered_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_qna_updated_at
BEFORE UPDATE ON public.qna
FOR EACH ROW
EXECUTE FUNCTION update_qna_updated_at(); 