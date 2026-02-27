export function Footer() {
  return (
    <footer className="bg-[#3c3733] text-white py-12">
      <div className="container">
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">세나클디자인스튜디오</h3>
          <p className="text-sm text-gray-300">공간의 가치를 디자인합니다</p>
        </div>

        <div className="text-sm text-gray-300 space-y-1 mb-8">
          <p>이메일: cenacledesign@naver.com</p>
          <p>웹사이트: cenacledesign.com</p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-8">
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

        <div className="text-xs text-gray-400">© 2025 CENACLE DESIGN STUDIO. All rights reserved.</div>
      </div>
    </footer>
  )
}
