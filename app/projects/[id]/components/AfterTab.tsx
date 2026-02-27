'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical, Upload, X } from 'lucide-react';
import type { Project } from '../types';
import { DEFAULT_SPACES } from '../constants';

interface AfterTabProps {
  project: Project | null;
  showAfterGuide: boolean;
  setShowAfterGuide: (show: boolean) => void;
  expandedSpaces: Record<string, boolean>;
  toggleSpace: (spaceId: string) => void;
  handleAfterPhotoUpload: (spaceId: string, shotId: string, file: File) => void;
  handleDeletePhoto: (type: 'before' | 'after', spaceId: string, shotId: string) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}

export default function AfterTab({
  project,
  showAfterGuide,
  setShowAfterGuide,
  expandedSpaces,
  toggleSpace,
  handleAfterPhotoUpload,
  handleDeletePhoto,
  fileInputRefs
}: AfterTabProps) {
  return (
    <>
      {/* 서비스 이용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAfterGuide(!showAfterGuide)}
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
          <ChevronDown size={18} className={`text-[#4b5840] transition-transform flex-shrink-0 mt-0.5 ${showAfterGuide ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showAfterGuide && (
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
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#4b5840]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">시공 후 사진 가이드</h4>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">촬영 기준</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>시공 전 사진과 최대한 동일한 위치에서 촬영해주세요</p>
                      <p>같은 시간대, 같은 조명 조건에서 촬영하면 더 좋아요</p>
                      <p>변화된 부분이 잘 보이도록 촬영해주세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">비교 촬영 요령</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>시공 전 사진을 참고하여 동일한 구도로 촬영하세요</p>
                      <p>가구 배치나 소품은 가급적 동일하게 유지해주세요</p>
                      <p>조명은 자연광을 활용하되 일관성을 유지하세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">품질 체크</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>사진의 선명도와 밝기를 확인해주세요</p>
                      <p>변화 부분이 명확히 보이는지 점검하세요</p>
                      <p>전체적인 공간감이 잘 드러나는지 확인하세요</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 공간 리스트 */}
      {DEFAULT_SPACES.map((space) => (
        <div key={space.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSpace(space.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <GripVertical size={18} className="text-gray-400" />
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <space.icon size={16} className="text-gray-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">{space.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {project?.afterPhotos[space.id] ? Object.values(project.afterPhotos[space.id]).filter(Boolean).length : 0}개
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
                    const beforePhoto = project?.beforePhotos[space.id]?.[shot.id];
                    const afterPhoto = project?.afterPhotos[space.id]?.[shot.id];

                    return (
                      <div key={shot.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-semibold text-sm text-gray-900">{shot.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{shot.description}</p>

                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 시공 전 사진 (읽기 전용) */}
                          <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                            {beforePhoto ? (
                              <>
                                <Image
                                  src={beforePhoto}
                                  alt={`${shot.name} 시공 전`}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                  <span className="text-white text-xs font-medium">시공 전</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs text-gray-400">시공 전 없음</span>
                              </div>
                            )}
                          </div>

                          {/* 시공 후 사진 업로드 */}
                          {afterPhoto ? (
                            <div className="aspect-[4/3] bg-white rounded-lg border border-green-200 overflow-hidden relative group">
                              <Image
                                src={afterPhoto}
                                alt={`${shot.name} 시공 후`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <span className="text-white text-xs font-medium">시공 후</span>
                              </div>
                              <button
                                onClick={() => handleDeletePhoto('after', space.id, shot.id)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                ref={el => { fileInputRefs.current[`after-${space.id}-${shot.id}`] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAfterPhotoUpload(space.id, shot.id, file);
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current[`after-${space.id}-${shot.id}`]?.click()}
                                className="aspect-[4/3] border-2 border-dashed border-green-500 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-green-50 transition-colors"
                              >
                                <Upload size={20} className="text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  시공 후 사진 추가
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}
