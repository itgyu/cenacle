'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { login } from '@/lib/auth-api';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleEmailSubmit = () => {
    if (validateEmail()) {
      setError('');
      setStep(2);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // API 호출
      const result = await login({
        email,
        password,
      });

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.data) {
        // 로그인 상태 업데이트
        setUser(result.data.user);

        // 대시보드로 이동
        router.push('/dashboard');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        handleEmailSubmit();
      } else {
        handlePasswordSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#4b5840] flex flex-col shadow-2xl relative touch-manipulation">
        {/* 뒤로 가기 버튼 (Step 2에서만 표시) */}
        {step === 2 && (
          <button
            onClick={() => {
              setStep(1);
              setError('');
              setPassword('');
            }}
            className="absolute top-6 left-6 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        )}

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* 아이콘 & 제목 */}
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Mail size={32} className="text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">
                      이메일을 입력해주세요
                    </h2>
                    <p className="text-white/80">
                      세나클디자인 계정으로 로그인하세요
                    </p>
                  </div>

                  {/* 이메일 입력 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="example@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        onKeyPress={handleKeyPress}
                        className="w-full text-base h-12 px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:outline-none focus:border-white transition-all"
                        autoFocus
                        autoComplete="email"
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-300/50 rounded-xl p-3 backdrop-blur-sm"
                      >
                        <p className="text-white text-sm font-medium">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* 아이콘 & 제목 */}
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Lock size={32} className="text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">
                      비밀번호를 입력해주세요
                    </h2>
                    <p className="text-white/80">{email}</p>
                  </div>

                  {/* 비밀번호 입력 */}
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        onKeyPress={handleKeyPress}
                        className="w-full text-base h-12 px-4 py-3 pr-12 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:outline-none focus:border-white transition-all"
                        autoFocus
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-300/50 rounded-xl p-3 backdrop-blur-sm"
                      >
                        <p className="text-white text-sm font-medium">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 하단 버튼 */}
            <div className="space-y-4">
            <button
              onClick={step === 1 ? handleEmailSubmit : handlePasswordSubmit}
              disabled={isLoading || (step === 1 ? !email.trim() : !password.trim())}
              className="w-full h-14 text-lg bg-white text-[#4b5840] hover:bg-gray-50 border-0 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#4b5840] border-t-transparent rounded-full animate-spin" />
                  로그인 중...
                </div>
              ) : (
                step === 1 ? '다음' : '로그인'
              )}
            </button>

            <p className="text-center text-sm text-white/80">
              계정이 없으신가요?{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-white font-medium hover:underline"
              >
                회원가입
              </button>
            </p>
            </div>
          </div>
        </div>

        {/* Toast notification 영역 */}
        <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none">
          <div className="w-full max-w-[430px] mx-auto px-4"></div>
        </div>
      </div>
    </div>
  );
}
