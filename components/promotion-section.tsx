import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PromotionSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-blue-100/50">
      <div className="container">
        <div className="mx-auto max-w-md">
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                신규 가입 이벤트
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold text-primary">5%</span>
              </div>
              <p className="text-xl font-bold mb-2">할인쿠폰</p>
              <p className="text-sm text-muted-foreground mb-6">첫 달 이용료 5% 할인 혜택</p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">쿠폰 받기</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
