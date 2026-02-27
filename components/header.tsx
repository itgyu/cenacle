import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Townus</span>
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
            href="#help"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            도움센터
          </Link>
          <Link
            href="#blog"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            블로그
          </Link>
        </nav>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">무료 체험</Button>
      </div>
    </header>
  )
}
