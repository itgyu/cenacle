'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ArrowRight, FolderOpen, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getProjects, deleteProject, Project } from '@/lib/projects-api';
import { AuthGuard } from '@/components/AuthGuard';
import { isAuthError } from '@/lib/errors';

interface DashboardStats {
  totalProjects: number;
  totalPhotos: number;
  totalStyled: number;
}

function DashboardContent() {
  const router = useRouter();
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [companyName] = useState('인테리어 프로젝트 관리');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalPhotos: 0,
    totalStyled: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; project: Project | null }>({
    show: false,
    project: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);

      const result = await getProjects();

      if (result.error) {
        // If authentication error, redirect to login
        if (isAuthError(result.error)) {
          router.replace('/auth/login');
          return;
        }

        setIsLoadingProjects(false);
        return;
      }

      if (result.data) {
        setProjects(result.data);

        // Calculate stats
        setStats({
          totalProjects: result.data.length,
          totalPhotos: 0, // Not available in current API response
          totalStyled: 0, // Not available in current API response
        });
      }

      setIsLoadingProjects(false);
    };

    loadProjects();
  }, [router]);

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!deleteConfirm.project) return;

    setIsDeleting(true);
    const result = await deleteProject(deleteConfirm.project.projectId);
    setIsDeleting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    // Remove from local state
    setProjects((prev) => prev.filter((p) => p.projectId !== deleteConfirm.project?.projectId));
    setStats((prev) => ({ ...prev, totalProjects: prev.totalProjects - 1 }));
    setDeleteConfirm({ show: false, project: null });
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
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
          {isLoadingProjects ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#4b5840] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-[#4b5840]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '첫 프로젝트를 시작해보세요'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {searchQuery ? (
                  '다른 검색어를 입력해주세요'
                ) : (
                  <>
                    새로운 인테리어 프로젝트로
                    <br />
                    완벽한 공간을 만들어보세요
                  </>
                )}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ show: true, project });
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="프로젝트 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            project.status === 'active'
                              ? 'bg-[#4b5840]'
                              : project.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-xs text-gray-500">
                          {project.status === 'active'
                            ? '진행중'
                            : project.status === 'completed'
                              ? '완료'
                              : '계획중'}
                        </span>
                      </div>
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

        {/* 삭제 확인 모달 */}
        <AnimatePresence>
          {deleteConfirm.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => !isDeleting && setDeleteConfirm({ show: false, project: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-xl"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trash2 size={24} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">프로젝트 삭제</h3>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-900">{deleteConfirm.project?.projectName}</strong>
                    <br />
                    프로젝트를 삭제하시겠습니까?
                    <br />
                    <span className="text-red-500">삭제된 데이터는 복구할 수 없습니다.</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, project: null })}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      '삭제'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
