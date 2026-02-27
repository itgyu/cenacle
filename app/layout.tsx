import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Keystone Partners",
  description: "토스 수준의 UX를 제공하는 Next.js 애플리케이션",
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <Script id="prevent-fullscreen" strategy="beforeInteractive">
          {`
            // 모바일 브라우저 전체화면 방지
            (function() {
              // 브라우저 전체화면 방지
              let scrollPosition = 0;
              let ticking = false;

              function preventFullscreen() {
                // iOS Safari 상단바 숨김 방지
                if (window.scrollY === 0) {
                  window.scrollTo(0, 1);
                  setTimeout(() => window.scrollTo(0, 0), 10);
                }
              }

              // 스크롤 이벤트 리스너
              function updateScrollPosition() {
                scrollPosition = window.scrollY;
                if (scrollPosition <= 2) {
                  preventFullscreen();
                }
                ticking = false;
              }

              function requestTick() {
                if (!ticking) {
                  requestAnimationFrame(updateScrollPosition);
                  ticking = true;
                }
              }

              // 페이지 로드 시 실행
              document.addEventListener('DOMContentLoaded', preventFullscreen);

              // 스크롤 이벤트
              window.addEventListener('scroll', requestTick, { passive: true });

              // 터치 이벤트
              document.addEventListener('touchstart', requestTick, { passive: true });

              // 페이지 포커스 시 실행
              window.addEventListener('focus', preventFullscreen);

              // 뷰포트 변경 감지
              window.addEventListener('resize', preventFullscreen);
            })();
          `}
        </Script>
      </head>
      <body className="font-sans antialiased prevent-fullscreen">
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
