'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
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
  selectedPhoto?: string | null;
  mode?: 'view' | 'select'; // view: 보기만, select: 선택 가능
}

export default function PhotoGallery({
  project,
  isOpen,
  onClose,
  onSelectPhoto,
  selectedPhoto,
  mode = 'view'
}: PhotoGalleryProps) {
  const hasStylingPhotos = project?.stylingPhotos && Object.keys(project.stylingPhotos).length > 0;

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
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">저장된 사진이 없습니다</p>
                  <p className="text-xs text-gray-500">Step 3에서 AI 스타일링을 진행하면</p>
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
                        <button
                          key={photoId}
                          onClick={() => {
                            if (mode === 'select' && onSelectPhoto) {
                              onSelectPhoto(displayImage, photoId);
                              onClose();
                            }
                          }}
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                            mode === 'select'
                              ? isSelected
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-orange-300'
                              : 'border-gray-200'
                          } ${mode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}
                          disabled={mode === 'view'}
                        >
                          <Image
                            src={displayImage}
                            alt="Styled"
                            fill
                            className="object-cover"
                          />
                          {mode === 'select' && isSelected && (
                            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check size={20} className="text-white" />
                              </div>
                            </div>
                          )}
                        </button>
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
        </>
      )}
    </AnimatePresence>
  );
}
