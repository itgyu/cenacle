export interface StylingPhoto {
  originalPhoto: string; // 원본 사진
  styledPhoto: string; // 스타일링된 사진
  style: string; // 사용한 스타일
  createdAt: string; // 생성 시간
}

export interface Project {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  area: string;
  rooms: string;
  bathrooms: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  beforePhotos: Record<string, Record<string, string>>; // spaceId -> shotId -> base64
  afterPhotos: Record<string, Record<string, string>>; // spaceId -> shotId -> base64
  stylingPhotos: Record<string, string | StylingPhoto>; // photoId -> styled base64 (legacy) or StylingPhoto object
  aiStylePhotos: any[];
  spaces: any[];
  content: {
    title: string;
    description: string;
    hashtags: string[];
    channels: string[];
  };
}

export interface Space {
  id: string;
  name: string;
  icon: any;
  shots: {
    id: string;
    name: string;
    required: boolean;
    description: string;
    beforeImage?: string;
  }[];
}

export interface Tab {
  id: number;
  name: string;
}
