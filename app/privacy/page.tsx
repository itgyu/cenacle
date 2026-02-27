'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">
            개인정보처리방침
          </h1>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보의 처리 목적</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              Cenacle Design Studio(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를
              처리합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>• 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 회원자격 유지·관리</li>
              <li>• 서비스 제공: AI 인테리어 스타일링 서비스 제공, 프로젝트 관리</li>
              <li>• 고객 문의 응대: 민원처리, 고지사항 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>• 필수항목: 이름, 이메일 주소, 비밀번호</li>
              <li>• 선택항목: 회사명, 연락처</li>
              <li>• 자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>• 회원정보: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
              <li>• 프로젝트 데이터: 회원 탈퇴 시까지</li>
              <li>• 법령에 따른 보존: 관련 법령에서 정한 기간 동안 보존</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는
              예외로 합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 mt-2">
              <li>• 이용자가 사전에 동의한 경우</li>
              <li>
                • 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라
                수사기관의 요구가 있는 경우
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. 개인정보의 파기</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 mt-2">
              <li>• 전자적 파일 형태: 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
              <li>• 기타 기록물: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. 정보주체의 권리·의무</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>• 개인정보 열람 요구</li>
              <li>• 오류 등이 있을 경우 정정 요구</li>
              <li>• 삭제 요구</li>
              <li>• 처리정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. 개인정보의 안전성 확보조치</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>• 비밀번호 암호화: 비밀번호는 단방향 암호화하여 저장</li>
              <li>• 해킹 등에 대비한 기술적 대책: SSL 암호화 통신, 보안 프로그램 설치</li>
              <li>• 접근 권한 관리: 개인정보 접근 권한 최소화</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. 쿠키의 사용</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(cookie)를 사용합니다.
              이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에
              어려움이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. 개인정보 보호책임자</h2>
            <div className="text-gray-600 leading-relaxed space-y-1">
              <p>• 담당부서: 고객지원팀</p>
              <p>• 이메일: support@cenacledesign.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. 개인정보처리방침의 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              이 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가, 삭제 및
              수정이 있을 시에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통해 공지할
              것입니다.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
