'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Building, Phone, MessageCircle, LogOut, ChevronRight, Edit3, Save, X } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
}

export default function MyPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const email = localStorage.getItem('user-email');
      if (!email) {
        router.push('/auth/login');
        return;
      }

      const keystoneUser = localStorage.getItem('keystoneUser');
      if (keystoneUser) {
        try {
          const userData = JSON.parse(keystoneUser);
          const phone = userData.phone || userData.contact || userData.mobile || userData.phoneNumber;
          setUserProfile({
            name: userData.name || '',
            email: email,
            company: userData.company || '',
            phone: phone || ''
          });
        } catch (e) {
          console.error('사용자 데이터 파싱 오류:', e);
        }
      }
    } catch (e) {
      console.error('프로필 로드 오류:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditProfile(userProfile);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditProfile(null);
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    if (!editProfile) return;

    // localStorage 업데이트
    const keystoneUser = {
      name: editProfile.name,
      email: editProfile.email,
      company: editProfile.company,
      phone: editProfile.phone
    };
    localStorage.setItem('keystoneUser', JSON.stringify(keystoneUser));

    // 상태 업데이트
    setUserProfile(editProfile);
    setIsEditMode(false);
    setEditProfile(null);
  };

  const EditableInfoRow = ({
    icon: Icon,
    label,
    value,
    field,
    isLast = false,
    editable = true
  }: {
    icon: any;
    label: string;
    value: string;
    field: keyof UserProfile;
    isLast?: boolean;
    editable?: boolean;
  }) => (
    <div className={`flex items-center py-4 px-5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-4">
        <Icon size={20} className="text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {isEditMode && editable && editProfile ? (
          <input
            type="text"
            value={editProfile[field]}
            onChange={(e) => setEditProfile({ ...editProfile, [field]: e.target.value })}
            className="w-full text-base font-medium text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${label} 입력`}
          />
        ) : (
          <p className="text-base font-medium text-gray-900">{value || '정보 없음'}</p>
        )}
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, title, description, onClick, color = 'gray' }: {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
    color?: 'gray' | 'red';
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors flex items-center"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color === 'red' ? 'bg-red-50' : 'bg-gray-50'}`}>
        <Icon size={24} className={color === 'red' ? 'text-red-600' : 'text-gray-600'} />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </motion.button>
  );

  if (isLoading) {
    return (
      <div className="mobile-viewport mobile-viewport-max bg-gray-100 overflow-hidden">
        <div className="mobile-container bg-gray-50 mobile-viewport flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="fixed top-0 left-0 right-0 z-40">
            <div className="mobile-container mx-auto bg-white flex items-center justify-between h-14 px-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
              </div>
              <div className="w-10" style={{ visibility: 'hidden' }} />
            </div>
          </div>

          {/* 로딩 스피너 */}
          <div className="flex-1 flex items-center justify-center" style={{ paddingTop: '60px' }}>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-viewport mobile-viewport-max bg-gray-100 overflow-hidden">
      <div className="mobile-container bg-gray-50 mobile-viewport flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="mobile-container mx-auto bg-white flex items-center justify-between h-14 px-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
            </div>
            {isEditMode ? (
              <div className="flex gap-1">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Save size={20} className="text-blue-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit3 size={20} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          className="flex-1 overflow-y-auto bg-gray-100"
          style={{
            paddingTop: '60px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'none'
          }}
        >
          <div className="p-4 space-y-4">
            {/* 내 정보 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">내 정보</h2>
              </div>
              {userProfile && (
                <div>
                  <EditableInfoRow icon={User} label="이름" value={userProfile.name} field="name" editable={true} />
                  <EditableInfoRow icon={Mail} label="이메일" value={userProfile.email} field="email" editable={false} />
                  <EditableInfoRow icon={Building} label="회사명" value={userProfile.company || '미입력'} field="company" editable={true} />
                  <EditableInfoRow icon={Phone} label="연락처" value={userProfile.phone || '미입력'} field="phone" editable={true} isLast={true} />
                </div>
              )}
            </motion.div>

            {/* 액션 버튼들 */}
            {!isEditMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <ActionButton
                  icon={MessageCircle}
                  title="고객센터 문의"
                  description="궁금한 것이 있으시면 언제든 문의해주세요"
                  onClick={() => {
                    const body = encodeURIComponent('안녕하세요! Keystone Partners 관련 문의사항이 있습니다.');
                    window.open(`mailto:support@keystonepartners.com?subject=고객센터 문의&body=${body}`, '_blank');
                  }}
                />
                <ActionButton
                  icon={LogOut}
                  title="로그아웃"
                  description="계정에서 안전하게 로그아웃합니다"
                  onClick={() => setShowLogoutModal(true)}
                  color="red"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
            />
            <div className="relative w-full max-w-[400px] mx-auto">
              <motion.div
                className="w-full bg-white rounded-2xl shadow-2xl z-10 flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">로그아웃</h2>
                  <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('keystoneUser');
                        localStorage.removeItem('user-email');
                        localStorage.removeItem('auth-token');
                        router.push('/auth/login');
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 rounded-xl font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
