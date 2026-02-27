export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container">
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">타운어스 (Townus)</h3>
          <p className="text-sm text-gray-400">우리 동네, 우리가 만드는 공간 &gt;</p>
        </div>

        <div className="text-sm text-gray-400 space-y-1 mb-8">
          <p>이메일: contact@townus.co.kr</p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-8">
          <a href="#" className="hover:text-white transition-colors">
            개인정보처리방침
          </a>
          <a href="#" className="hover:text-white transition-colors">
            이용약관
          </a>
          <a href="#" className="hover:text-white transition-colors">
            고객센터
          </a>
        </div>

        <div className="text-xs text-gray-500">© 2025 Townus. All rights reserved.</div>
      </div>
    </footer>
  )
}
