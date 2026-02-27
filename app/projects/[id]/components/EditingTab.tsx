'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FolderOpen } from 'lucide-react';
import type { Project } from '../types';
import { conceptOptions, colorOptions } from '../constants';
import PhotoGallery from './PhotoGallery';

interface EditingTabProps {
  project: Project | null;
  showEditingGuide: boolean;
  setShowEditingGuide: (show: boolean) => void;
  editingSelectedPhoto: string | null;
  setEditingSelectedPhoto: (photo: string | null) => void;
  editingConcept: string;
  setEditingConcept: (concept: string) => void;
  editingColor: string;
  setEditingColor: (color: string) => void;
  isGenerating: boolean;
  handleAIEdit: () => void;
  handleCopy: (text: string) => void;
}

export default function EditingTab({
  project,
  showEditingGuide,
  setShowEditingGuide,
  editingSelectedPhoto,
  setEditingSelectedPhoto,
  editingConcept,
  setEditingConcept,
  editingColor,
  setEditingColor,
  isGenerating,
  handleAIEdit,
  handleCopy
}: EditingTabProps) {
  const hasStylingPhotos = project?.stylingPhotos && Object.keys(project.stylingPhotos).length > 0;
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="space-y-4">
      {/* 서비스 이용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowEditingGuide(!showEditingGuide)}
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
          <ChevronDown size={18} className={`text-[#3182F6] transition-transform flex-shrink-0 mt-0.5 ${showEditingGuide ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showEditingGuide && (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">콘텐츠 생성 가이드</h4>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">사진 선택 방법</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>Step 3에서 스타일링된 사진을 선택해주세요</p>
                      <p>원하는 컨셉과 색상을 선택하면 맞춤형 콘텐츠가 생성됩니다</p>
                      <p>선택한 이미지와 스타일에 맞는 콘텐츠가 만들어져요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">콘텐츠 생성 과정</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>사진, 컨셉, 색상을 모두 선택한 후 생성 버튼을 눌러주세요</p>
                      <p>AI가 블로그 포스트와 SNS 콘텐츠를 자동 생성합니다</p>
                      <p>생성에는 약 1-2분이 소요됩니다</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">결과 활용</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>블로그용 긴 글과 SNS용 짧은 글이 각각 생성됩니다</p>
                      <p>해시태그도 자동으로 생성되어 SNS 활용이 편리해요</p>
                      <p>복사 버튼으로 쉽게 콘텐츠를 복사할 수 있습니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 스타일링된 사진이 없을 때 */}
      {!hasStylingPhotos ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">스타일링된 사진이 없습니다</p>
          <p className="text-xs text-gray-500">Step 3에서 먼저 AI 스타일링을 진행해주세요</p>
        </div>
      ) : (
        <>
          {/* 사진 선택 */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">사진 보관함에서 선택</h3>
            <p className="text-xs text-gray-600 mb-3">콘텐츠 생성에 사용할 사진을 보관함에서 선택하세요</p>

            {editingSelectedPhoto ? (
              <div className="space-y-3">
                {/* 선택된 사진 표시 */}
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-orange-500">
                  <Image
                    src={editingSelectedPhoto}
                    alt="Selected photo"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 다른 사진 선택 버튼 */}
                <button
                  onClick={() => setShowGallery(true)}
                  className="w-full py-3 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FolderOpen size={20} />
                  다른 사진 선택
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowGallery(true)}
                className="w-full py-12 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <FolderOpen size={32} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">사진 보관함에서 선택하기</p>
                  <p className="text-xs text-gray-500">AI 스타일링된 사진을 선택하세요</p>
                </div>
              </button>
            )}
          </div>

          {/* 컨셉 선택 */}
          {editingSelectedPhoto && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">컨셉 선택</h3>
              <p className="text-xs text-gray-600 mb-3">콘텐츠의 분위기를 선택하세요</p>

              <div className="grid grid-cols-2 gap-2">
                {conceptOptions.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => setEditingConcept(concept.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      editingConcept === concept.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 mb-0.5">{concept.name}</div>
                    <div className="text-xs text-gray-600">{concept.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 색상 선택 */}
          {editingSelectedPhoto && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">색상 선택</h3>
              <p className="text-xs text-gray-600 mb-3">콘텐츠에 강조할 색상을 선택하세요</p>

              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setEditingColor(color.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      editingColor === color.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 mb-0.5">{color.name}</div>
                    <div className="text-xs text-gray-600">{color.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI 에디팅 시작 버튼 */}
          {editingSelectedPhoto && (
            <button
              onClick={handleAIEdit}
              disabled={isGenerating}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI가 콘텐츠를 생성하고 있습니다...
                </div>
              ) : (
                'AI 에디팅 시작'
              )}
            </button>
          )}
        </>
      )}

      {/* 생성된 콘텐츠 표시 */}
      {project?.editingContent && (
        <>
          {/* 블로그 콘텐츠 */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">📝 블로그 콘텐츠</h4>
              {project.editingContent.blog && (
                <button
                  onClick={() => handleCopy(project.editingContent!.blog)}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
                >
                  복사
                </button>
              )}
            </div>
            <div className="px-4 py-4">
              {project.editingContent.blog ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {project.editingContent.blog}
                </p>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">블로그 콘텐츠가 생성됩니다</p>
              )}
            </div>
          </div>

          {/* 인스타그램 콘텐츠 */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">📷 인스타그램 콘텐츠</h4>
              {project.editingContent.instagram && (
                <button
                  onClick={() => handleCopy(project.editingContent!.instagram)}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
                >
                  복사
                </button>
              )}
            </div>
            <div className="px-4 py-4">
              {project.editingContent.instagram ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {project.editingContent.instagram}
                </p>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">인스타그램 콘텐츠가 생성됩니다</p>
              )}
            </div>
          </div>

          {/* 해시태그 */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">#️⃣ 해시태그</h4>
              {project.editingContent.hashtags && (
                <button
                  onClick={() => handleCopy(project.editingContent!.hashtags)}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
                >
                  복사
                </button>
              )}
            </div>
            <div className="px-4 py-4">
              {project.editingContent.hashtags ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {project.editingContent.hashtags}
                </p>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">해시태그가 생성됩니다</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* 사진 보관함 모달 */}
      <PhotoGallery
        project={project}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelectPhoto={(photoUrl, photoId) => {
          setEditingSelectedPhoto(photoUrl);
        }}
        selectedPhoto={editingSelectedPhoto}
        mode="select"
      />
    </div>
  );
}
