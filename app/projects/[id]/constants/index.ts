import { Sofa, ChefHat, Bed, Bath } from 'lucide-react';
import type { Space, Tab } from '../types';

export const TABS: Tab[] = [
  { id: 1, name: '시공 전' },
  { id: 2, name: '시공 후' },
  { id: 3, name: '스타일링' },
];

export const DEFAULT_SPACES: Space[] = [
  {
    id: 'living',
    name: '거실',
    icon: Sofa,
    shots: [
      {
        id: 'living_front',
        name: '정면 컷',
        required: true,
        description: '베란다를 정면으로 바라보며 촬영해주세요',
        beforeImage: '/images/l_1.png',
      },
      {
        id: 'living_diagonal',
        name: '대각선 컷',
        required: false,
        description: '거실 전체가 보이도록 대각선으로 찍어주세요',
        beforeImage: '/images/l_2.png',
      },
    ],
  },
  {
    id: 'kitchen',
    name: '주방',
    icon: ChefHat,
    shots: [
      {
        id: 'kitchen_front',
        name: '정면 컷',
        required: true,
        description: '싱크대와 조리대가 보이도록 촬영해주세요',
        beforeImage: '/images/c_1.png',
      },
      {
        id: 'kitchen_side',
        name: '측면 컷',
        required: false,
        description: '주방 전체가 보이도록 측면에서 촬영해주세요',
        beforeImage: '/images/c_2.png',
      },
    ],
  },
  {
    id: 'bedroom',
    name: '방',
    icon: Bed,
    shots: [
      {
        id: 'bedroom_front',
        name: '정면 컷',
        required: true,
        description: '침대를 정면으로 바라보며 촬영해주세요',
        beforeImage: '/images/r_1.png',
      },
      {
        id: 'bedroom_diagonal',
        name: '대각선 컷',
        required: false,
        description: '방 전체가 보이도록 대각선으로 찍어주세요',
        beforeImage: '/images/r_2.png',
      },
    ],
  },
  {
    id: 'bathroom',
    name: '욕실',
    icon: Bath,
    shots: [
      {
        id: 'bathroom_diagonal',
        name: '대각선 컷',
        required: true,
        description: '욕실 전체가 보이도록 대각선으로 촬영해주세요',
        beforeImage: '/images/b_1.png',
      },
      {
        id: 'bathroom_sink',
        name: '세면대 컷',
        required: false,
        description: '세면대가 잘 보이도록 촬영해주세요',
        beforeImage: '/images/b_2.png',
      },
      {
        id: 'bathroom_bathtub',
        name: '욕조/샤워실 컷',
        required: false,
        description: '욕조 또는 샤워실이 잘 보이도록 촬영해주세요',
        beforeImage: '/images/b_3.png',
      },
    ],
  },
];
