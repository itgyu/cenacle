import { Card, CardContent } from "@/components/ui/card"
import { FileText, Wrench, Calendar, MapPin, Cloud, Settings } from "lucide-react"

const services = [
  {
    icon: FileText,
    title: "간편 예약 시스템",
    description: "클릭 한 번으로 공간을 예약하세요",
  },
  {
    icon: Wrench,
    title: "시설물 관리",
    description: "체계적인 시설 유지보수 관리",
  },
  {
    icon: Calendar,
    title: "일정 관리",
    description: "효율적인 일정 조율 시스템",
  },
  {
    icon: MapPin,
    title: "위치 찾기",
    description: "쉽고 빠른 공간 위치 안내",
  },
  {
    icon: Cloud,
    title: "클라우드 저장",
    description: "안전한 데이터 보관 서비스",
  },
  {
    icon: Settings,
    title: "맞춤형 설정",
    description: "우리 동네에 맞는 커스터마이징",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">우리가 제공하는 서비스</h2>
          <p className="text-muted-foreground text-balance">
            타운어스가 제공하는 통합 커뮤니티 공간 관리 솔루션을 경험하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
