'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical, Upload, X, Camera } from 'lucide-react';
import type { Project } from '../types';
import { DEFAULT_SPACES } from '../constants';

interface PhotosTabProps {
  project: Project | null;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  expandedSpaces: Record<string, boolean>;
  toggleSpace: (spaceId: string) => void;
  handlePhotoUpload: (spaceId: string, shotId: string, file: File) => void;
  handleDeletePhoto: (spaceId: string, shotId: string) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}

export default function PhotosTab({
  project,
  showGuide,
  setShowGuide,
  expandedSpaces,
  toggleSpace,
  handlePhotoUpload,
  handleDeletePhoto,
  fileInputRefs,
}: PhotosTabProps) {
  return (
    <>
      {/* 서비스 이용 가이드 */}
      <div className="bg-[#f5f3ef] border border-[#e8e4de] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-4 py-3 flex items-start justify-between hover:bg-[#ebe7e1] transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#4b5840] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Camera size={12} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-gray-900 mb-0.5">사진 업로드 가이드</h3>
              <p className="text-xs text-[#4b5840]">좋은 사진을 위한 팁을 확인하세요</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-[#4b5840] transition-transform flex-shrink-0 mt-0.5 ${showGuide ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 space-y-3 bg-white">
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-900">촬영 팁</h5>
                  <ul className="space-y-1 text-xs text-gray-700 leading-relaxed list-disc list-inside">
                    <li>자연광이 잘 드는 시간대에 촬영하세요</li>
                    <li>공간 전체가 보이는 넓은 각도로 촬영하세요</li>
                    <li>가로 방향으로 촬영하면 더 좋아요</li>
                    <li>흐릿하거나 어두운 사진은 피해주세요</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-900">AI 스타일링을 위해</h5>
                  <ul className="space-y-1 text-xs text-gray-700 leading-relaxed list-disc list-inside">
                    <li>완성된 인테리어 사진을 업로드해주세요</li>
                    <li>AI가 다양한 스타일로 변환해드립니다</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 공간 리스트 */}
      {DEFAULT_SPACES.map((space) => {
        const photoCount = project?.photos?.[space.id]
          ? Object.values(project.photos[space.id]).filter(Boolean).length
          : 0;

        return (
          <div key={space.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSpace(space.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <GripVertical size={18} className="text-gray-400" />
                <div className="w-7 h-7 rounded-lg bg-[#f5f3ef] flex items-center justify-center">
                  <space.icon size={16} className="text-[#4b5840]" />
                </div>
                <span className="font-semibold text-sm text-gray-900">{space.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${photoCount > 0 ? 'text-[#4b5840] font-medium' : 'text-gray-400'}`}
                >
                  {photoCount}장
                </span>
                <ChevronUp
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    expandedSpaces[space.id] ? '' : 'rotate-180'
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {expandedSpaces[space.id] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {space.shots.map((shot) => {
                      const uploadedPhoto = project?.photos?.[space.id]?.[shot.id];

                      return (
                        <div key={shot.id} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-semibold text-sm text-gray-900">{shot.name}</h4>
                            {shot.required && (
                              <span className="px-1.5 py-0.5 bg-[#4b5840] text-white text-xs font-medium rounded">
                                필수
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{shot.description}</p>

                          {/* 사진 업로드 영역 */}
                          {uploadedPhoto ? (
                            <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                              <Image
                                src={uploadedPhoto}
                                alt={`${shot.name}`}
                                fill
                                className="object-cover"
                              />
                              {/* 삭제 버튼 - 항상 표시 (모바일 대응) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('이 사진을 삭제하시겠습니까?')) {
                                    handleDeletePhoto(space.id, shot.id);
                                  }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[`photo-${space.id}-${shot.id}`] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePhotoUpload(space.id, shot.id, file);
                                }}
                              />
                              <button
                                onClick={() =>
                                  fileInputRefs.current[`photo-${space.id}-${shot.id}`]?.click()
                                }
                                className="w-full aspect-[4/3] border-2 border-dashed border-[#4b5840] rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[#f5f3ef] transition-colors"
                              >
                                <Upload size={24} className="text-[#4b5840]" />
                                <span className="text-sm font-medium text-[#4b5840]">
                                  사진 업로드
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
