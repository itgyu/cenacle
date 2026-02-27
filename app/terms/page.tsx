'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">이용약관</h1>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 Cenacle Design Studio(이하 &quot;회사&quot;)가 제공하는 인테리어 디자인
              서비스(이하 &quot;서비스&quot;)의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및
              책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>
                1. &quot;서비스&quot;란 회사가 제공하는 AI 기반 인테리어 스타일링 및 관련 서비스를
                말합니다.
              </li>
              <li>
                2. &quot;회원&quot;이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은
                자를 말합니다.
              </li>
              <li>
                3. &quot;아이디(ID)&quot;란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고
                회사가 승인한 이메일 주소를 말합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>1. 이 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.</li>
              <li>
                2. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 이 약관을 변경할 수
                있습니다.
              </li>
              <li>3. 변경된 약관은 서비스 내 공지사항을 통해 공지함으로써 효력이 발생합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (서비스의 제공)</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>1. AI 기반 인테리어 스타일링 서비스</li>
              <li>2. 공간 사진 업로드 및 분석 서비스</li>
              <li>3. 맞춤형 인테리어 제안 서비스</li>
              <li>4. 프로젝트 관리 서비스</li>
              <li>5. 기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (회원가입)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>
                1. 서비스 이용을 원하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이
                약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </li>
              <li>
                2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는
                한 회원으로 등록합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (회원의 의무)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>
                1. 회원은 서비스 이용 시 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여
                공지한 주의사항을 준수하여야 합니다.
              </li>
              <li>
                2. 회원은 타인의 권리를 침해하거나 서비스 운영을 방해하는 행위를 하여서는 안 됩니다.
              </li>
              <li>3. 회원은 자신의 아이디와 비밀번호를 관리할 책임이 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (서비스 이용의 제한)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스
              이용을 제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (면책조항)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>
                1. 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로
                서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                3. AI가 제안하는 인테리어 스타일링은 참고용이며, 최종 결정은 회원의 판단에 따릅니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (분쟁해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는
              법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">본 약관은 2024년 1월 1일부터 시행됩니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
