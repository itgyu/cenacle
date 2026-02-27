'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ArrowRight, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { getProjects } from '@/lib/projects-api';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [companyName, setCompanyName] = useState('인테리어 프로젝트 관리');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPhotos: 0,
    totalStyled: 0
  });

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      console.log('[Dashboard] Loading projects from API...');
      setIsLoadingProjects(true);

      const result = await getProjects();

      if (result.error) {
        console.error('[Dashboard] Failed to load projects:', result.error);

        // If authentication error, redirect to login
        if (result.error.includes('로그인') || result.error.includes('token') || result.error.includes('인증')) {
          console.log('[Dashboard] Authentication error, redirecting to login...');
          router.replace('/auth/login');
          return;
        }

        setIsLoadingProjects(false);
        return;
      }

      if (result.data) {
        console.log('[Dashboard] Projects loaded:', result.data.length);
        setProjects(result.data);

        // Calculate stats - Note: API returns minimal project data
        // For now, just set totalProjects
        setStats({
          totalProjects: result.data.length,
          totalPhotos: 0, // Not available in current API response
          totalStyled: 0  // Not available in current API response
        });
      }

      setIsLoadingProjects(false);
    };

    // Only load projects after authentication is confirmed
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, router]);

  // Auth check
  useEffect(() => {
    console.log('[Dashboard] Checking authentication...');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('[Dashboard] Token exists:', !!token);
    console.log('[Dashboard] User exists:', !!user);

    if (!token && !user) {
      console.log('[Dashboard] Not authenticated, redirecting to login...');
      router.replace('/auth/login');
      return;
    }

    console.log('[Dashboard] Authenticated! Loading dashboard...');
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4b5840] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full max-w-[430px] mx-auto bg-white">
          <div className="flex items-center h-14 px-2 gap-2">
            {/* 로고 */}
            <button
              onClick={() => window.location.reload()}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Image
                src="/images/cenacle_logo.png"
                alt="세나클디자인 로고"
                width={28}
                height={28}
                className="object-contain"
              />
            </button>

            {/* 검색창 */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="진행중인 프로젝트명을 입력"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 text-xs bg-gray-100 border-0 rounded-full placeholder-gray-400 placeholder:text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#4b5840] transition-colors"
              />
            </div>

            {/* 마이페이지 버튼 */}
            <button
              onClick={() => router.push('/mypage')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <User size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 컨테이너 */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-xl relative pt-14">
        {/* 헤더 - 파란색 그라데이션 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#4b5840] to-[#3c3733] text-white px-5 py-8"
        >
          <div className="mb-6">
            <p className="text-blue-100 text-sm mb-1">{companyName}</p>
            <h2 className="text-lg font-semibold">프로젝트 현황</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white block mb-1">{stats.totalProjects}</div>
              <span className="text-blue-100 text-sm">전체</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white block mb-1">{stats.totalPhotos}</div>
              <span className="text-blue-100 text-sm">사진 수</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white block mb-1">{stats.totalStyled}</div>
              <span className="text-blue-100 text-sm">스타일링</span>
            </motion.div>
          </div>
        </motion.div>

        {/* 프로젝트 리스트 */}
        <div className="px-5 py-4 pb-20 space-y-3">
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-[#4b5840]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                첫 프로젝트를 시작해보세요
              </h3>
              <p className="text-gray-600 leading-relaxed">
                새로운 인테리어 프로젝트로
                <br />
                완벽한 공간을 만들어보세요
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.projectId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/projects/${project.projectId}`)}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-100 hover:shadow-md transition-all cursor-pointer active:bg-blue-50"
                >
                  {/* 상단 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        project.status === 'active' ? 'bg-[#4b5840]' :
                        project.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {project.status === 'active' ? '진행중' :
                         project.status === 'completed' ? '완료' : '계획중'}
                      </span>
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>{project.location}</p>
                    <p>
                      {project.area}평 · 방 {project.rooms}개 · 욕실 {project.bathrooms}개
                    </p>
                  </div>

                  {/* 하단 */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center text-[#4b5840] text-sm font-medium">
                      <span>자세히 보기</span>
                      <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* 플로팅 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/create-project')}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-[#4b5840] to-[#3c3733] text-white font-semibold py-3 px-6 rounded-full shadow-xl border border-[#5e6e4d]/20 flex items-center justify-center gap-2 text-sm whitespace-nowrap hover:shadow-2xl transition-all"
        >
          새 프로젝트 시작
        </motion.button>
      </div>
    </div>
  );
}
