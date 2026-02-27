import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    rating: 5,
    text: "타운어스 덕분에 우리 동네 커뮤니티 센터 관리가 정말 편해졌어요. 예약 시스템이 직관적이고 사용하기 쉬워서 주민들의 만족도가 높아졌습니다.",
    author: "박OO",
    role: "서울시 마포구 커뮤니티 센터",
  },
  {
    rating: 5,
    text: "공간 관리부터 예약, 결제까지 한 번에 해결할 수 있어서 업무 효율이 크게 향상되었습니다. 특히 실시간 알림 기능이 정말 유용해요.",
    author: "김OO",
    role: "경기도 성남시 문화센터",
  },
  {
    rating: 5,
    text: "처음에는 걱정했는데 설치부터 운영까지 모든 과정이 간단하고 명확했습니다. 고객 지원팀의 친절한 안내도 큰 도움이 되었어요.",
    author: "이OO",
    role: "부산시 해운대구 주민센터",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">타운어스를 경험한 고객들의 목소리</h2>
          <p className="text-muted-foreground text-balance">실제 사용자들이 전하는 타운어스 이용 후기를 확인해보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{testimonial.text}</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
