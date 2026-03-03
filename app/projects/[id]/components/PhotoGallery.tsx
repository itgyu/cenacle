'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Download, ZoomIn, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { Project, StylingPhoto } from '../types';

// 스타일링 사진이 새로운 형식인지 확인하는 헬퍼 함수
const isStylingPhotoObject = (photo: string | StylingPhoto): photo is StylingPhoto => {
  return typeof photo === 'object' && 'styledPhoto' in photo;
};

interface PhotoGalleryProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: (photoUrl: string, photoId: string) => void;
  onDeletePhoto?: (photoId: string) => void;
  selectedPhoto?: string | null;
  mode?: 'view' | 'select'; // view: 보기만, select: 선택 가능
}

export default function PhotoGallery({
  project,
  isOpen,
  onClose,
  onSelectPhoto,
  onDeletePhoto,
  selectedPhoto,
  mode = 'view',
}: PhotoGalleryProps) {
  const [fullscreenPhoto, setFullscreenPhoto] = useState<{
    url: string;
    photoId: string;
    isOriginal: boolean;
    data?: StylingPhoto;
  } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const hasStylingPhotos = project?.stylingPhotos && Object.keys(project.stylingPhotos).length > 0;

  const styleNames: Record<string, string> = {
    modern: '모던',
    minimal: '미니멀',
    nordic: '북유럽',
    classic: '클래식',
  };

  // 이미지 다운로드 함수
  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // 대체 방법: 새 탭에서 열기
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[430px] bg-white shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">사진 보관함</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
              {!hasStylingPhotos ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">저장된 사진이 없습니다</p>
                  <p className="text-xs text-gray-500">AI 스타일링 탭에서 스타일링을 진행하면</p>
                  <p className="text-xs text-gray-500">이곳에 사진이 저장됩니다</p>
                </div>
              ) : (
                <>
                  {mode === 'select' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700">사진을 선택하면 에디팅에 사용됩니다</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(project.stylingPhotos).map(([photoId, styledData]) => {
                      const isNewFormat = isStylingPhotoObject(styledData);
                      const displayImage = isNewFormat ? styledData.styledPhoto : styledData;
                      const isSelected = selectedPhoto === displayImage;

                      return (
                        <div
                          key={photoId}
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all group ${
                            mode === 'select'
                              ? isSelected
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-orange-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image src={displayImage} alt="Styled" fill className="object-cover" />

                          {/* 스타일 뱃지 */}
                          {isNewFormat && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                                {styleNames[styledData.style] || styledData.style}
                              </span>
                            </div>
                          )}

                          {/* 삭제 버튼 */}
                          {onDeletePhoto && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (confirm('이 사진을 삭제하시겠습니까?')) {
                                  onDeletePhoto(photoId);
                                }
                              }}
                              className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          {/* 이미지 클릭 시 전체화면으로 보기 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mode === 'select' && onSelectPhoto) {
                                onSelectPhoto(displayImage, photoId);
                                onClose();
                              } else {
                                setFullscreenPhoto({
                                  url: displayImage,
                                  photoId,
                                  isOriginal: false,
                                  data: isNewFormat ? styledData : undefined,
                                });
                                setShowOriginal(false);
                              }
                            }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            {/* 크게 보기 아이콘 - 항상 표시 */}
                            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                              <ZoomIn size={14} />
                              크게 보기
                            </div>
                          </button>

                          {mode === 'select' && isSelected && (
                            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check size={20} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 사진 개수 표시 */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      총 {Object.keys(project.stylingPhotos).length}개의 사진
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 전체화면 이미지 뷰어 */}
          <AnimatePresence>
            {fullscreenPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[60] flex flex-col"
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/50">
                  <div className="flex items-center gap-2">
                    {fullscreenPhoto.data && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {styleNames[fullscreenPhoto.data.style] || fullscreenPhoto.data.style}
                      </span>
                    )}
                    {fullscreenPhoto.data && (
                      <span className="text-white/70 text-sm">
                        {showOriginal ? 'Before' : 'After'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 다운로드 버튼 */}
                    <button
                      onClick={() => {
                        const url =
                          showOriginal && fullscreenPhoto.data
                            ? fullscreenPhoto.data.originalPhoto
                            : fullscreenPhoto.url;
                        const fileName = `${showOriginal ? 'original' : 'styled'}_${fullscreenPhoto.photoId}.jpg`;
                        handleDownload(url, fileName);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="다운로드"
                    >
                      <Download size={24} className="text-white" />
                    </button>
                    {/* 닫기 버튼 */}
                    <button
                      onClick={() => setFullscreenPhoto(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* 이미지 영역 */}
                <div className="flex-1 relative flex items-center justify-center p-4">
                  <Image
                    src={
                      showOriginal && fullscreenPhoto.data
                        ? fullscreenPhoto.data.originalPhoto
                        : fullscreenPhoto.url
                    }
                    alt={showOriginal ? 'Original' : 'Styled'}
                    fill
                    className="object-contain"
                  />

                  {/* Before/After 토글 버튼 (원본이 있는 경우만) */}
                  {fullscreenPhoto.data && fullscreenPhoto.data.originalPhoto && (
                    <>
                      <button
                        onClick={() => setShowOriginal(true)}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors ${
                          showOriginal
                            ? 'bg-white text-gray-900'
                            : 'bg-white/30 text-white hover:bg-white/50'
                        }`}
                        title="Before 보기"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setShowOriginal(false)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors ${
                          !showOriginal
                            ? 'bg-white text-gray-900'
                            : 'bg-white/30 text-white hover:bg-white/50'
                        }`}
                        title="After 보기"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {/* 하단 Before/After 표시 */}
                {fullscreenPhoto.data && fullscreenPhoto.data.originalPhoto && (
                  <div className="flex justify-center gap-4 pb-6">
                    <button
                      onClick={() => setShowOriginal(true)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        showOriginal
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white/70 hover:bg-white/30'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setShowOriginal(false)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        !showOriginal
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white/70 hover:bg-white/30'
                      }`}
                    >
                      After
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
