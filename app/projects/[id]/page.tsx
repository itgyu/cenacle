'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderOpen, Settings, Home, X, Trash2, Building2 } from 'lucide-react';
import type { Project } from './types';
import { TABS, DEFAULT_SPACES } from './constants';
import BeforeTab from './components/BeforeTab';
import AfterTab from './components/AfterTab';
import StylingTab from './components/StylingTab';
import EditingTab from './components/EditingTab';
import ReleaseTab from './components/ReleaseTab';
import PhotoGallery from './components/PhotoGallery';
import { getProject, uploadPhoto } from '@/lib/projects-api';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [showAfterGuide, setShowAfterGuide] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({
    living: false,
    kitchen: false,
    bedroom: false,
    bathroom: false
  });
  const [showStylingGuide, setShowStylingGuide] = useState(false);
  const [showEditingGuide, setShowEditingGuide] = useState(false);
  const [showReleaseGuide, setShowReleaseGuide] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  // 스타일링 관련 상태
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [isStyling, setIsStyling] = useState(false);

  // 에디팅 관련 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSelectedPhoto, setEditingSelectedPhoto] = useState<string | null>(null);
  const [editingSelectedPhotoId, setEditingSelectedPhotoId] = useState<string | null>(null);
  const [editingConcept, setEditingConcept] = useState<string>('modern');
  const [editingColor, setEditingColor] = useState<string>('white');
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const loadProject = async () => {
      const projectId = params?.id as string;
      if (!projectId) {
        router.push('/dashboard');
        return;
      }

      console.log('[ProjectDetail] Loading project:', projectId);

      const result = await getProject(projectId);

      if (result.error) {
        console.error('[ProjectDetail] Failed to load project:', result.error);

        // If authentication error, redirect to login
        if (result.error.includes('로그인') || result.error.includes('token') || result.error.includes('인증')) {
          console.log('[ProjectDetail] Authentication error, redirecting to login...');
          router.replace('/auth/login');
          return;
        }

        // Otherwise, go back to dashboard
        router.push('/dashboard');
        return;
      }

      if (result.data) {
        console.log('[ProjectDetail] Project loaded:', result.data);
        setProject(result.data as any);
      } else {
        router.push('/dashboard');
      }

      setIsLoading(false);
    };

    loadProject();
  }, [params, router]);

  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  // 시공 전 사진 업로드
  const handleBeforePhotoUpload = async (spaceId: string, shotId: string, file: File) => {
    if (!project) return;

    try {
      console.log('[PhotoUpload] Uploading before photo:', { spaceId, shotId, fileName: file.name, fileSize: file.size });

      // Presigned URL 방식으로 S3에 직접 업로드
      const result = await uploadPhoto(project.projectId, file, 'before', spaceId, shotId);

      if (result.error) {
        console.error('[PhotoUpload] API error:', result.error);
        alert(`사진 업로드 실패: ${result.error}`);
        return;
      }

      // 업로드된 S3 URL로 프로젝트 상태 업데이트
      const updatedProject = {
        ...project,
        beforePhotos: {
          ...project.beforePhotos,
          [spaceId]: {
            ...(project.beforePhotos[spaceId] || {}),
            [shotId]: result.data // S3 URL
          }
        },
        updatedAt: new Date().toISOString()
      };

      console.log('[PhotoUpload] Updated project:', updatedProject);
      setProject(updatedProject);
      console.log('[PhotoUpload] Photo uploaded successfully to S3:', result.data);
    } catch (error) {
      console.error('사진 업로드 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    }
  };

  // 시공 후 사진 업로드
  const handleAfterPhotoUpload = async (spaceId: string, shotId: string, file: File) => {
    if (!project) return;

    try {
      console.log('[PhotoUpload] Uploading after photo:', { spaceId, shotId, fileName: file.name, fileSize: file.size });

      // Presigned URL 방식으로 S3에 직접 업로드
      const result = await uploadPhoto(project.projectId, file, 'after', spaceId, shotId);

      if (result.error) {
        console.error('[PhotoUpload] API error:', result.error);
        alert(`사진 업로드 실패: ${result.error}`);
        return;
      }

      // 업로드된 S3 URL로 프로젝트 상태 업데이트
      const updatedProject = {
        ...project,
        afterPhotos: {
          ...project.afterPhotos,
          [spaceId]: {
            ...(project.afterPhotos[spaceId] || {}),
            [shotId]: result.data // S3 URL
          }
        },
        updatedAt: new Date().toISOString()
      };

      console.log('[PhotoUpload] Updated project:', updatedProject);
      setProject(updatedProject);
      console.log('[PhotoUpload] Photo uploaded successfully to S3:', result.data);
    } catch (error) {
      console.error('사진 업로드 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    }
  };

  // 사진 삭제
  const handleDeletePhoto = (type: 'before' | 'after', spaceId: string, shotId: string) => {
    if (!project) return;

    console.log('[PhotoDelete] Deleting photo:', { type, spaceId, shotId });

    const updatedProject = {
      ...project,
      [type === 'before' ? 'beforePhotos' : 'afterPhotos']: {
        ...project[type === 'before' ? 'beforePhotos' : 'afterPhotos'],
        [spaceId]: {
          ...(project[type === 'before' ? 'beforePhotos' : 'afterPhotos'][spaceId] || {}),
          [shotId]: undefined
        }
      },
      updatedAt: new Date().toISOString()
    };

    setProject(updatedProject);
    console.log('[PhotoDelete] Photo deleted successfully (local state only)');

    // TODO: API로 DynamoDB 업데이트하는 기능 추가 필요
  };

  // AI 에디팅 생성
  const handleAIEdit = async () => {
    if (!project) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: project.projectName,
          location: project.location,
          area: project.area,
          rooms: project.rooms,
          bathrooms: project.bathrooms,
          concept: editingConcept,
          color: editingColor
        })
      });

      const data = await response.json();
      console.log('API 응답:', data);

      if (data.success) {
        const updatedProject = {
          ...project,
          editingContent: {
            blog: data.blog,
            instagram: data.instagram,
            hashtags: data.hashtags
          },
          updatedAt: new Date().toISOString()
        };

        console.log('[AIEdit] Updated project:', updatedProject);
        setProject(updatedProject);
        console.log('[AIEdit] Project state updated successfully (local state only)');

        // TODO: API로 DynamoDB 업데이트하는 기능 추가 필요
      } else {
        console.error('[AIEdit] API 응답 실패:', data);
      }
    } catch (error) {
      console.error('AI 에디팅 오류:', error);
      alert('AI 에디팅 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 복사 기능
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다.');
  };

  // 프로젝트 삭제 기능
  const handleDeleteProject = () => {
    if (!project) return;

    // TODO: API로 프로젝트 삭제 기능 구현 필요
    alert('프로젝트 삭제 기능은 아직 구현되지 않았습니다.\n서버 API를 통한 삭제 기능을 추가해야 합니다.');
  };

  // AI 스타일링 처리
  const handleAIStyling = async () => {
    if (!project || !selectedPhoto || !selectedStyle) return;

    setIsStyling(true);

    try {
      // 실제 AI API 호출
      const response = await fetch('/api/style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedPhoto,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      // API 키가 설정되지 않은 경우
      if (data.needsApiKey) {
        alert('AI API 키가 설정되지 않았습니다.\n\n.env.local 파일에 HUGGINGFACE_API_TOKEN을 추가해주세요.\n\nAPI 토큰은 https://huggingface.co/settings/tokens 에서 무료로 발급받을 수 있습니다.\n\n완전 무료이며, 회원가입 후 바로 사용 가능합니다!');
        return;
      }

      if (!data.success) {
        throw new Error(data.error || '스타일링 처리 실패');
      }

      // AI가 생성한 이미지 URL 사용
      const styledImage = data.styledImage;

      // 스타일링된 이미지를 프로젝트에 저장 (Before/After 정보 포함)
      const photoId = `${selectedSpace}_${Date.now()}`;
      const updatedProject = {
        ...project,
        stylingPhotos: {
          ...project.stylingPhotos,
          [photoId]: {
            originalPhoto: selectedPhoto,
            styledPhoto: styledImage,
            style: selectedStyle,
            createdAt: new Date().toISOString()
          }
        },
        updatedAt: new Date().toISOString()
      };

      console.log('[AIStyling] Updated project:', updatedProject);
      setProject(updatedProject);
      console.log('[AIStyling] Styling completed successfully (local state only)');

      // TODO: API로 S3에 업로드하고 DynamoDB 업데이트하는 기능 추가 필요

      alert('AI 스타일링이 완료되어 사진 보관함에 저장되었습니다!\n(참고: 새로고침하면 사라집니다)');

      // 상태 초기화
      setSelectedSpace(null);
      setSelectedPhoto(null);
      setSelectedStyle('modern');

    } catch (error: any) {
      console.error('스타일링 오류:', error);
      alert(error.message || '스타일링 처리 중 오류가 발생했습니다.');
    } finally {
      setIsStyling(false);
    }
  };


  // 탭별 콘텐츠 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case 1: // 시공 전
        return (
          <BeforeTab
            project={project}
            showGuide={showGuide}
            setShowGuide={setShowGuide}
            expandedSpaces={expandedSpaces}
            toggleSpace={toggleSpace}
            handleBeforePhotoUpload={handleBeforePhotoUpload}
            handleDeletePhoto={handleDeletePhoto}
            fileInputRefs={fileInputRefs}
          />
        );
      case 2: // 시공 후
        return (
          <AfterTab
            project={project}
            showAfterGuide={showAfterGuide}
            setShowAfterGuide={setShowAfterGuide}
            expandedSpaces={expandedSpaces}
            toggleSpace={toggleSpace}
            handleAfterPhotoUpload={handleAfterPhotoUpload}
            handleDeletePhoto={handleDeletePhoto}
            fileInputRefs={fileInputRefs}
          />
        );
      case 3: // 스타일링
        return (
          <StylingTab
            project={project}
            showStylingGuide={showStylingGuide}
            setShowStylingGuide={setShowStylingGuide}
            selectedSpace={selectedSpace}
            setSelectedSpace={setSelectedSpace}
            selectedPhoto={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            isStyling={isStyling}
            handleAIStyling={handleAIStyling}
            setProject={setProject}
          />
        );
      case 4: // 에디팅
        return (
          <EditingTab
            project={project}
            showEditingGuide={showEditingGuide}
            setShowEditingGuide={setShowEditingGuide}
            editingSelectedPhoto={editingSelectedPhoto}
            setEditingSelectedPhoto={setEditingSelectedPhoto}
            editingConcept={editingConcept}
            setEditingConcept={setEditingConcept}
            editingColor={editingColor}
            setEditingColor={setEditingColor}
            isGenerating={isGenerating}
            handleAIEdit={handleAIEdit}
            handleCopy={handleCopy}
          />
        );
      case 5: // 릴리즈
        return (
          <ReleaseTab
            project={project}
            showReleaseGuide={showReleaseGuide}
            setShowReleaseGuide={setShowReleaseGuide}
            setActiveTab={setActiveTab}
            handleCopy={handleCopy}
          />
        );
      default:
        return (
          <BeforeTab
            project={project}
            showGuide={showGuide}
            setShowGuide={setShowGuide}
            expandedSpaces={expandedSpaces}
            toggleSpace={toggleSpace}
            handleBeforePhotoUpload={handleBeforePhotoUpload}
            handleDeletePhoto={handleDeletePhoto}
            fileInputRefs={fileInputRefs}
          />
        );
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4b5840] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-[430px] mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            {/* 왼쪽: 뒤로가기 + 프로젝트명 */}
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="홈으로 가기"
              >
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {project.projectName}
              </h1>
            </div>

            {/* 오른쪽: 아이콘들 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="홈으로 가기"
              >
                <Home size={24} className="text-gray-700" />
              </button>
              <button
                onClick={() => setShowPhotoGallery(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="사진 보관함"
              >
                <FolderOpen size={24} className="text-gray-700" />
              </button>
              <button
                onClick={() => setShowProjectInfo(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="프로젝트 정보"
              >
                <Settings size={24} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 컨테이너 */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-sm relative pt-14">
        {/* 탭 네비게이션 */}
        <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#4b5840]'
                    : 'text-gray-600'
                }`}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4b5840]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-4 py-3 space-y-3">
          {renderTabContent()}
        </div>
      </div>

      {/* 사진 보관함 모달 */}
      <PhotoGallery
        project={project}
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        mode="view"
      />

      {/* 프로젝트 정보 모달 */}
      {showProjectInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-md p-6 relative"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowProjectInfo(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* 제목 */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">프로젝트 정보</h2>

            {/* 프로젝트 아이콘과 기본 정보 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#4b5840] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{project.projectName}</h3>
                <p className="text-sm text-gray-500">
                  생성일: {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\. /g, '. ')}
                </p>
              </div>
            </div>

            {/* 프로젝트 상세 정보 */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">위치</span>
                <span className="font-medium text-gray-900">{project.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">면적</span>
                <span className="font-medium text-gray-900">{project.area}평</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">방 개수</span>
                <span className="font-medium text-gray-900">{project.rooms}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">욕실 개수</span>
                <span className="font-medium text-gray-900">{project.bathrooms}개</span>
              </div>
            </div>

            {/* 프로젝트 삭제 버튼 */}
            <button
              onClick={handleDeleteProject}
              className="w-full py-3 px-4 bg-white border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Trash2 size={20} />
              프로젝트 삭제
            </button>

            {/* 확인 버튼 */}
            <button
              onClick={() => setShowProjectInfo(false)}
              className="w-full py-3 px-4 bg-[#4b5840] text-white rounded-xl font-semibold hover:bg-[#3c3733] transition-colors"
            >
              확인
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
