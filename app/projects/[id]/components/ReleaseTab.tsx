'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Project } from '../types';

interface ReleaseTabProps {
  project: Project | null;
  showReleaseGuide: boolean;
  setShowReleaseGuide: (show: boolean) => void;
  setActiveTab: (tab: number) => void;
  handleCopy: (text: string) => void;
}

export default function ReleaseTab({
  project,
  showReleaseGuide,
  setShowReleaseGuide,
  setActiveTab,
  handleCopy
}: ReleaseTabProps) {
  return (
    <>
      {/* 서비스 이용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowReleaseGuide(!showReleaseGuide)}
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
          <ChevronDown size={18} className={`text-[#4b5840] transition-transform flex-shrink-0 mt-0.5 ${showReleaseGuide ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showReleaseGuide && (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">콘텐츠 내보내기 가이드</h4>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">콘텐츠 확인 방법</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>생성된 모든 콘텐츠 패키지를 한 눈에 확인할 수 있어요</p>
                      <p>공간별, 날짜별로 필터링하여 찾을 수 있습니다</p>
                      <p>각 패키지를 펼쳐서 상세 내용을 확인하세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">복사 및 활용</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>블로그 글, SNS 포스트, 해시태그를 개별 복사 가능해요</p>
                      <p>복사 버튼을 눌러 클립보드에 저장한 후 활용하세요</p>
                      <p>사진도 함께 저장하여 포스팅에 활용하세요</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-900">관리 기능</h5>
                    <div className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      <p>필요없는 콘텐츠 패키지는 삭제할 수 있어요</p>
                      <p>정렬 기능으로 최신순/오래된순으로 볼 수 있습니다</p>
                      <p>공간별 필터로 특정 공간의 콘텐츠만 모아볼 수 있어요</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 콘텐츠 표시 */}
      {project?.editingContent ? (
        <div className="space-y-4">
          {/* 블로그 콘텐츠 */}
          {project.editingContent.blog && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">📝 블로그 콘텐츠</h3>
                <button
                  onClick={() => handleCopy(project.editingContent!.blog)}
                  className="px-3 py-1.5 bg-[#4b5840] text-white rounded-lg hover:bg-[#3c3733] transition-colors text-xs font-medium"
                >
                  복사하기
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{project.editingContent.blog}</p>
              </div>
            </div>
          )}

          {/* 인스타그램 콘텐츠 */}
          {project.editingContent.instagram && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">📷 인스타그램 포스트</h3>
                <button
                  onClick={() => handleCopy(project.editingContent!.instagram)}
                  className="px-3 py-1.5 bg-[#4b5840] text-white rounded-lg hover:bg-[#3c3733] transition-colors text-xs font-medium"
                >
                  복사하기
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{project.editingContent.instagram}</p>
              </div>
            </div>
          )}

          {/* 해시태그 */}
          {project.editingContent.hashtags && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">#️⃣ 해시태그</h3>
                <button
                  onClick={() => handleCopy(project.editingContent!.hashtags)}
                  className="px-3 py-1.5 bg-[#4b5840] text-white rounded-lg hover:bg-[#3c3733] transition-colors text-xs font-medium"
                >
                  복사하기
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700">{project.editingContent.hashtags}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">저장된 콘텐츠가 없습니다</p>
          <p className="text-xs text-gray-500 mb-4">Step 4에서 콘텐츠를 생성하고 저장해보세요</p>
          <button
            onClick={() => setActiveTab(4)}
            className="px-6 py-2 bg-[#4b5840] text-white rounded-lg hover:bg-[#3c3733] transition-colors text-sm font-medium"
          >
            Step 4로 이동
          </button>
        </div>
      )}
    </>
  );
}
