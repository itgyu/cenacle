import { Card } from "@/components/ui/card"
import { Shield, Check } from "lucide-react"

export function WhySection() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">왜 타운어스를 선택해야 할까요?</h2>
          <p className="text-muted-foreground text-balance">
            안전하고 효율적인 공간 관리 시스템으로 여러분의 커뮤니티를 관리하세요
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Card className="bg-slate-700 text-white p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-6">안전하고 편리한 관리</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>체계적인 공간 예약 시스템</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>효율적인 커뮤니티 관리</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>투명한 운영 시스템</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>실시간 알림 서비스</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
