'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Maximize2, Home } from 'lucide-react';
import { createProject as createProjectAPI } from '@/lib/projects-api';
import { isAuthenticated } from '@/lib/auth-api';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    step: 1,
    projectName: '',
    location: '',
    area: '',
    rooms: '',
    bathrooms: '',
    isLoading: false,
    error: '',
  });

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  // Mobile viewport height fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  const handleNext = () => {
    const { step, projectName, location, area, rooms, bathrooms } = formState;

    // Validation
    if (step === 1 && !projectName.trim()) {
      setFormState((prev) => ({ ...prev, error: '프로젝트명을 입력해주세요.' }));
      return;
    }
    if (step === 2 && !location.trim()) {
      setFormState((prev) => ({ ...prev, error: '위치를 입력해주세요.' }));
      return;
    }
    if (step === 3 && !area.trim()) {
      setFormState((prev) => ({ ...prev, error: '평수를 입력해주세요.' }));
      return;
    }
    if (step === 4 && (!rooms.trim() || !bathrooms.trim())) {
      setFormState((prev) => ({ ...prev, error: '방과 욕실 개수를 입력해주세요.' }));
      return;
    }

    if (step < 4) {
      setFormState((prev) => ({ ...prev, step: prev.step + 1, error: '' }));
    } else {
      createProject();
    }
  };

  const createProject = async () => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: '' }));

    console.log('[CreateProject] Creating project via API...');

    // Call API to create project
    const result = await createProjectAPI({
      projectName: formState.projectName.trim(),
      location: formState.location.trim(),
      area: formState.area,
      rooms: formState.rooms,
      bathrooms: formState.bathrooms,
    });

    // Handle API error
    if (result.error) {
      console.error('[CreateProject] API error:', result.error);

      // Check if it's an authentication error
      if (
        result.error.includes('로그인') ||
        result.error.includes('token') ||
        result.error.includes('인증')
      ) {
        console.log('[CreateProject] Authentication error, redirecting to login...');
        router.replace('/auth/login');
        return;
      }

      setFormState((prev) => ({
        ...prev,
        error: result.error,
        isLoading: false,
      }));
      return;
    }

    // Success - redirect to project detail page
    if (result.data) {
      console.log('[CreateProject] ✅ Project created successfully:', result.data);
      console.log('[CreateProject] Redirecting to:', `/projects/${result.data.projectId}`);
      router.replace(`/projects/${result.data.projectId}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const handleBack = () => {
    if (formState.step > 1) {
      setFormState((prev) => ({ ...prev, step: prev.step - 1, error: '' }));
    } else {
      router.push('/dashboard');
    }
  };

  const renderStep = () => {
    switch (formState.step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#4b5840] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">프로젝트명을 입력해주세요</h2>
              <p className="text-gray-600">어떤 공간을 만들어볼까요?</p>
            </div>
            <input
              type="text"
              placeholder="우리집 리모델링"
              value={formState.projectName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, projectName: e.target.value, error: '' }))
              }
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-4 text-lg h-14 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5840] focus:border-transparent transition-all ${
                formState.error ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
            {formState.error && (
              <p className="text-red-500 text-sm text-center">{formState.error}</p>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#4b5840] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">위치를 알려주세요</h2>
              <p className="text-gray-600">구/동 단위로 입력해주세요</p>
            </div>
            <input
              type="text"
              placeholder="강남구 역삼동"
              value={formState.location}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, location: e.target.value, error: '' }))
              }
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-4 text-lg h-14 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5840] focus:border-transparent transition-all ${
                formState.error ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
            {formState.error && (
              <p className="text-red-500 text-sm text-center">{formState.error}</p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#4b5840] rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">평수를 입력해주세요</h2>
              <p className="text-gray-600">전용면적 기준으로 입력해주세요</p>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="32"
                value={formState.area}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, area: e.target.value, error: '' }))
                }
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-4 text-lg h-14 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5840] focus:border-transparent transition-all ${
                  formState.error ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                평
              </span>
            </div>
            {formState.error && (
              <p className="text-red-500 text-sm text-center">{formState.error}</p>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#4b5840] rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">공간 구성을 알려주세요</h2>
              <p className="text-gray-600">방과 욕실 개수를 입력해주세요</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">방</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="3"
                    value={formState.rooms}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, rooms: e.target.value, error: '' }))
                    }
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-4 text-lg h-14 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5840] focus:border-transparent transition-all ${
                      formState.error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    개
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">욕실</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="2"
                    value={formState.bathrooms}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        bathrooms: e.target.value,
                        error: '',
                      }))
                    }
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-4 text-lg h-14 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5840] focus:border-transparent transition-all ${
                      formState.error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    개
                  </span>
                </div>
              </div>
            </div>
            {formState.error && (
              <p className="text-red-500 text-sm text-center">{formState.error}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[430px] mx-auto bg-white min-h-screen flex flex-col">
        {/* 상단 고정 헤더 */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="w-full max-w-[430px] mx-auto">
            <div className="flex items-center h-14 px-4">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  새 프로젝트 ({formState.step}/4)
                </h1>
              </div>
              <div className="w-8"></div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-[#4b5840] transition-all duration-300"
                style={{ width: `${(formState.step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content - 중앙 정렬 */}
        <div className="flex-1 flex items-center justify-center px-6 pt-16">
          <div className="w-full max-w-sm">{renderStep()}</div>
        </div>

        {/* Bottom button - 하단 고정 */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={formState.isLoading}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
              formState.isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#4b5840] text-white hover:bg-[#3c3733] shadow-lg hover:shadow-xl'
            }`}
          >
            {formState.isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                생성중...
              </div>
            ) : formState.step === 4 ? (
              '프로젝트 생성'
            ) : (
              '다음'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
