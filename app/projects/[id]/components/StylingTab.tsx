'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, ArrowLeft, Maximize2 } from 'lucide-react';
import type { Project, StylingPhoto } from '../types';
import { DEFAULT_SPACES } from '../constants';

// 스타일링 사진이 새로운 형식인지 확인하는 헬퍼 함수
const isStylingPhotoObject = (photo: string | StylingPhoto): photo is StylingPhoto => {
  return typeof photo === 'object' && 'styledPhoto' in photo;
};

interface StylingTabProps {
  project: Project | null;
  showStylingGuide: boolean;
  setShowStylingGuide: (show: boolean) => void;
  selectedSpace: string | null;
  setSelectedSpace: (space: string | null) => void;
  selectedPhoto: string | null;
  setSelectedPhoto: (photo: string | null) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  isStyling: boolean;
  handleAIStyling: () => void;
  setProject: (project: Project) => void;
}

export default function StylingTab({
  project,
  showStylingGuide,
  setShowStylingGuide,
  selectedSpace,
  setSelectedSpace,
  selectedPhoto,
  setSelectedPhoto,
  selectedStyle,
  setSelectedStyle,
  isStyling,
  handleAIStyling,
  setProject
}: StylingTabProps) {
  const [compareView, setCompareView] = useState<{ photoId: string; data: StylingPhoto } | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const styleNames: Record<string, string> = {
    modern: '모던',
    minimal: '미니멀',
    nordic: '북유럽',
    classic: '클래식'
  };

  return (
    <>
      {/* 서비스 이용 가이드 */}
      <div className="bg-[#f5f3ef] border border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowStylingGuide(!showStylingGuide)}
          className="w-full px-4 py-3 flex items-start justify-between hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#4b5840] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-gray-900 mb-0.5">서비스 이용 가이드</h3>
              <p className="text-xs text-[#4b5840]">이용 방법을 확인해보세요</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-[#4b5840] transition-transform flex-shrink-0 mt-0.5 ${showStylingGuide ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showStylingGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 space-y-4 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#f5f3ef] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#4b5840]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">AI 스타일링 가이드</h4>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">사진 선택 방법</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>공간을 먼저 선택한 후 원하는 사진을 골라주세요</p>
                      <p>선명하고 밝은 사진일수록 스타일링 결과가 좋아요</p>
                      <p>전체 공간이 잘 보이는 사진을 선택하세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">스타일링 과정</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>AI 스타일링은 1-2분 정도 소요됩니다</p>
                      <p>작업 중에는 페이지를 벗어나지 마세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">결과 활용</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>생성된 스타일링 이미지를 확인해보세요</p>
                      <p>마음에 들지 않으면 다시 스타일링할 수 있어요</p>
                      <p>여러 장을 생성해서 비교해보세요</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 스타일링된 이미지 결과 표시 */}
      {project?.stylingPhotos && Object.keys(project.stylingPhotos).length > 0 && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">사진 보관함에 저장되었습니다</p>
                <p className="text-xs text-gray-600">우측 상단의 폴더 아이콘을 눌러 보관함을 확인하세요</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">스타일링 결과</h3>
            <p className="text-xs text-gray-600">AI로 생성된 스타일링 이미지입니다</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(project.stylingPhotos).map(([photoId, styledData]) => {
              const isNewFormat = isStylingPhotoObject(styledData);
              const displayImage = isNewFormat ? styledData.styledPhoto : styledData;
              const createdDate = isNewFormat && styledData.createdAt
                ? new Date(styledData.createdAt)
                : null;

              return (
                <div
                  key={photoId}
                  className="relative bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={displayImage}
                      alt="Styled"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* 스타일 뱃지 (상단) */}
                    {isNewFormat && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                          {styleNames[styledData.style] || styledData.style}
                        </span>
                      </div>
                    )}

                    {/* 생성 시간 (상단 우측) */}
                    {isNewFormat && createdDate && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
                          {createdDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Before/After 비교 버튼 (새로운 형식인 경우에만) */}
                  {isNewFormat && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                      <button
                        onClick={() => setCompareView({ photoId, data: styledData })}
                        className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white transition-colors flex items-center justify-center gap-1 shadow-lg"
                      >
                        <Maximize2 size={14} />
                        Before/After
                      </button>
                    </div>
                  )}

                  {/* 삭제 버튼 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => {
                        const updatedStylingPhotos = { ...project.stylingPhotos };
                        delete updatedStylingPhotos[photoId];

                        const updatedProject = {
                          ...project,
                          stylingPhotos: updatedStylingPhotos,
                          updatedAt: new Date().toISOString()
                        };

                        const projects = JSON.parse(localStorage.getItem('keystone-projects') || '[]');
                        const projectIndex = projects.findIndex((p: Project) => p.id === project.id);
                        if (projectIndex !== -1) {
                          projects[projectIndex] = updatedProject;
                          localStorage.setItem('keystone-projects', JSON.stringify(projects));
                          setProject(updatedProject);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Before/After 비교 모달 */}
      <AnimatePresence>
        {compareView && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompareView(null)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            {/* 비교 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-10 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Before / After 비교</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    스타일: {styleNames[compareView.data.style] || compareView.data.style}
                  </p>
                </div>
                <button
                  onClick={() => setCompareView(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-700" />
                </button>
              </div>

              {/* 비교 이미지 영역 */}
              <div className="flex-1 p-4 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  {/* 슬라이더 비교 */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                    {/* Before 이미지 (전체) */}
                    <div className="absolute inset-0">
                      <Image
                        src={compareView.data.originalPhoto}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        Before
                      </div>
                    </div>

                    {/* After 이미지 (클립됨) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <Image
                        src={compareView.data.styledPhoto}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        After
                      </div>
                    </div>

                    {/* 슬라이더 라인 */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>

                    {/* 드래그 영역 */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />
                  </div>

                  {/* 슬라이더 컨트롤 */}
                  <div className="mt-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* 나란히 보기 */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                        <Image
                          src={compareView.data.originalPhoto}
                          alt="Before"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-center text-sm font-semibold text-gray-900 mt-2">Before</p>
                    </div>
                    <div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                        <Image
                          src={compareView.data.styledPhoto}
                          alt="After"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-center text-sm font-semibold text-gray-900 mt-2">
                        After ({styleNames[compareView.data.style]})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!selectedSpace ? (
        // 공간 선택 화면
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">스타일링 공간 선택</h3>
            <p className="text-xs text-gray-600">스타일링을 진행할 공간을 선택하세요</p>
          </div>

          <div className="space-y-3">
            {DEFAULT_SPACES.map((space) => {
              const afterPhotoCount = project?.afterPhotos[space.id]
                ? Object.values(project.afterPhotos[space.id]).filter(Boolean).length
                : 0;
              const hasAfterPhotos = afterPhotoCount > 0;

              return (
                <button
                  key={space.id}
                  onClick={() => hasAfterPhotos && setSelectedSpace(space.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    hasAfterPhotos
                      ? 'bg-white border-gray-200 hover:border-[#4b5840] hover:bg-[#f5f3ef]'
                      : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!hasAfterPhotos}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasAfterPhotos ? 'bg-gray-100' : 'bg-gray-200'
                    }`}>
                      <space.icon size={24} className={hasAfterPhotos ? 'text-gray-600' : 'text-gray-400'} />
                    </div>
                    <div className="text-left">
                      <h4 className={`text-sm font-semibold ${hasAfterPhotos ? 'text-gray-900' : 'text-gray-400'}`}>
                        {space.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {hasAfterPhotos
                          ? `업로드 된 시공 후 사진 ${afterPhotoCount}개`
                          : '업로드 된 시공 후 사진이 없습니다'
                        }
                      </p>
                    </div>
                  </div>
                  {hasAfterPhotos && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // 사진 선택 및 스타일링 화면
        <div className="space-y-4">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => {
              setSelectedSpace(null);
              setSelectedPhoto(null);
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            공간 선택으로 돌아가기
          </button>

          {/* 선택된 공간 정보 */}
          <div className="bg-[#f5f3ef] border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                {DEFAULT_SPACES.find(s => s.id === selectedSpace)?.icon &&
                  React.createElement(DEFAULT_SPACES.find(s => s.id === selectedSpace)!.icon, { size: 20, className: 'text-[#4b5840]' })
                }
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">
                  {DEFAULT_SPACES.find(s => s.id === selectedSpace)?.name}
                </h3>
                <p className="text-xs text-gray-600">사진을 선택하고 원하는 스타일을 적용하세요</p>
              </div>
            </div>
          </div>

          {/* 사진 선택 */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">스타일링할 사진 선택</h4>
            <div className="grid grid-cols-2 gap-3">
              {project?.afterPhotos[selectedSpace] &&
                Object.entries(project.afterPhotos[selectedSpace])
                  .filter(([_, photo]) => photo)
                  .map(([shotId, photo]) => (
                    <button
                      key={shotId}
                      onClick={() => setSelectedPhoto(photo as string)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPhoto === photo
                          ? 'border-[#4b5840] ring-2 ring-[#5e6e4d]/30'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={photo as string}
                        alt="시공 후 사진"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
              }
            </div>
          </div>

          {/* 스타일 선택 */}
          {selectedPhoto && (
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">스타일 선택</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'modern', name: '모던' },
                  { id: 'minimal', name: '미니멀' },
                  { id: 'nordic', name: '북유럽' },
                  { id: 'classic', name: '클래식' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedStyle === style.id
                        ? 'border-[#4b5840] bg-[#f5f3ef] text-[#4b5840]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI 스타일링 시작 버튼 */}
          {selectedPhoto && (
            <>
              <button
                onClick={handleAIStyling}
                disabled={isStyling}
                className="w-full py-3 bg-[#4b5840] text-white rounded-lg hover:bg-[#3c3733] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStyling ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI 스타일링 중...
                  </div>
                ) : (
                  'AI 스타일링 시작'
                )}
              </button>

              {/* AI 생성 진행 상태 표시 */}
              {isStyling && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4b5840] flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">AI가 인테리어를 재구성하고 있습니다</p>
                      <p className="text-xs text-gray-600 mt-0.5">약 30초~2분 정도 소요됩니다</p>
                    </div>
                  </div>

                  {/* 진행 단계 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#4b5840] animate-pulse" />
                      <span className="text-gray-700">이미지 분석 중...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-300" />
                      <span className="text-gray-500">AI 스타일링 적용 대기</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-300" />
                      <span className="text-gray-500">최종 이미지 생성 대기</span>
                    </div>
                  </div>

                  {/* 안내 메시지 */}
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-600 text-center">
                      ⚠️ 페이지를 벗어나지 마세요
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
