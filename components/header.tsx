import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/cenacle_logo.png"
            alt="세나클디자인"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#intro"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            소개
          </Link>
          <Link
            href="#services"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            서비스
          </Link>
          <Link
            href="#portfolio"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            포트폴리오
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            문의하기
          </Link>
        </nav>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">상담 신청</Button>
      </div>
    </header>
  )
}
