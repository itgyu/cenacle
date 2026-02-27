'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical, Upload, X } from 'lucide-react';
import type { Project } from '../types';
import { DEFAULT_SPACES } from '../constants';

interface BeforeTabProps {
  project: Project | null;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  expandedSpaces: Record<string, boolean>;
  toggleSpace: (spaceId: string) => void;
  handleBeforePhotoUpload: (spaceId: string, shotId: string, file: File) => void;
  handleDeletePhoto: (type: 'before' | 'after', spaceId: string, shotId: string) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}

export default function BeforeTab({
  project,
  showGuide,
  setShowGuide,
  expandedSpaces,
  toggleSpace,
  handleBeforePhotoUpload,
  handleDeletePhoto,
  fileInputRefs
}: BeforeTabProps) {
  return (
    <>
      {/* 서비스 이용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-4 py-3 flex items-start justify-between hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#3182F6] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-gray-900 mb-0.5">서비스 이용 가이드</h3>
              <p className="text-xs text-[#3182F6]">이용 방법을 확인해보세요</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-[#3182F6] transition-transform flex-shrink-0 mt-0.5 ${showGuide ? 'rotate-180' : ''}`} />
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
              <div className="px-4 pb-4 pt-1 space-y-4 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#3182F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">사진 업로드 가이드</h4>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">공간별 사진 촬영 가이드</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>거실, 침실, 주방 등 각 공간을 선택해주세요</p>
                      <p>한 공간당 여러 각도에서 촬영하시면 더 좋은 결과를 얻을 수 있어요</p>
                      <p>자연광이 잘 드는 시간대에 촬영하시는 것을 권장해요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">촬영 팁</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>정면, 측면, 전체 공간이 보이는 앵글로 촬영해보세요</p>
                      <p>세로보다는 가로 방향으로 촬영하시는 것을 추천해요</p>
                      <p>흐릿하거나 너무 어두운 사진은 피해주세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">업로드 방법</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>사진은 한 번에 여러 장 선택 가능해요</p>
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
                {project?.beforePhotos[space.id] ? Object.values(project.beforePhotos[space.id]).filter(Boolean).length : 0}개
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
                    const uploadedPhoto = project?.beforePhotos[space.id]?.[shot.id];

                    return (
                      <div key={shot.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-semibold text-sm text-gray-900">{shot.name}</h4>
                          {shot.required && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                              필수
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{shot.description}</p>

                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 가이드 이미지 */}
                          <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                            {shot.beforeImage ? (
                              <Image
                                src={shot.beforeImage}
                                alt={`${shot.name} 가이드`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <>
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs text-gray-500">촬영 가이드</span>
                              </>
                            )}
                          </div>

                          {/* 업로드 영역 */}
                          {uploadedPhoto ? (
                            <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 overflow-hidden relative group">
                              <Image
                                src={uploadedPhoto}
                                alt={`${shot.name} 업로드`}
                                fill
                                className="object-cover"
                              />
                              <button
                                onClick={() => handleDeletePhoto('before', space.id, shot.id)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                ref={el => { fileInputRefs.current[`before-${space.id}-${shot.id}`] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleBeforePhotoUpload(space.id, shot.id, file);
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current[`before-${space.id}-${shot.id}`]?.click()}
                                className="aspect-[4/3] border-2 border-dashed border-[#3182F6] rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors"
                              >
                                <Upload size={20} className="text-[#3182F6]" />
                                <span className="text-xs font-medium text-[#3182F6]">
                                  시공 전 사진 추가
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
