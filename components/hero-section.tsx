import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100/50 py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm text-muted-foreground">✨ 우리 동네 공간 관리</p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            회기는 끝이 아니라,
            <br />
            새로운 공간을 위한
            <br />
            시작입니다.
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-balance">효과적인 동네 커뮤니티 공간 관리!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              무료 체험하기
            </Button>
            <Button size="lg" variant="outline">
              자세히 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
