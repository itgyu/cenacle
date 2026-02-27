import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f3ef] to-[#ebe7e0] py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm text-muted-foreground">공간의 가치를 디자인합니다</p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl text-[#3c3733]">
            당신의 공간,
            <br />
            세나클이
            <br />
            완성합니다.
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-balance">프로젝트 관리부터 완공까지, 체계적인 인테리어 서비스</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              상담 신청하기
            </Button>
            <Button size="lg" variant="outline" className="border-[#4b5840] text-[#4b5840] hover:bg-[#4b5840] hover:text-white">
              포트폴리오 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
