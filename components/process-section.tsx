const steps = [
  {
    number: 1,
    title: "무료 가입하기",
    items: ["간단한 회원 가입", "이메일 인증 완료", "프로필 설정하기"],
  },
  {
    number: 2,
    title: "공간 선택 및 등록",
    items: ["우리 동네 찾기", "관리할 공간 등록하기", "공간 정보 입력하기"],
  },
  {
    number: 3,
    title: "예약 및 관리 시작",
    items: ["예약 시스템 활성화", "일정 관리 시작하기", "멤버 초대하기"],
  },
  {
    number: 4,
    title: "운영 및 분석",
    items: ["실시간 예약 현황", "이용 통계 확인", "피드백 수집하기"],
  },
]

export function ProcessSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">이렇게 진행됩니다</h2>
          <p className="text-muted-foreground text-balance">간단한 4단계로 시작하는 커뮤니티 공간 관리 시스템</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="relative flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <ul className="space-y-2">
                      {step.items.map((item, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
