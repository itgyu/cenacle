import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Styling Photo interface
 */
export interface StylingPhoto {
  originalPhoto: string;
  styledPhoto: string;
  style: string;
  createdAt: string;
}

/**
 * Project interface
 */
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
  beforePhotos: Record<string, Record<string, string>>;
  afterPhotos: Record<string, Record<string, string>>;
  stylingPhotos: Record<string, string | StylingPhoto>;
  aiStylePhotos: unknown[];
  spaces: unknown[];
  content: {
    title: string;
    description: string;
    hashtags: string[];
    channels: string[];
  };
  editingContent?: {
    blog: string;
    instagram: string;
    hashtags: string;
  };
}

/**
 * Project State interface
 */
interface ProjectState {
  // Core state
  project: Project | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  activeTab: number;
  showPhotoGallery: boolean;
  showProjectInfo: boolean;

  // Guide states
  guides: {
    before: boolean;
    after: boolean;
    styling: boolean;
    editing: boolean;
    release: boolean;
  };

  // Expanded spaces
  expandedSpaces: Record<string, boolean>;

  // Styling state
  styling: {
    selectedSpace: string | null;
    selectedPhoto: string | null;
    selectedStyle: string;
    isStyling: boolean;
  };

  // Editing state
  editing: {
    isGenerating: boolean;
    selectedPhoto: string | null;
    selectedPhotoId: string | null;
    concept: string;
    color: string;
    isEditing: boolean;
  };

  // Actions
  setProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setActiveTab: (tab: number) => void;
  setShowPhotoGallery: (show: boolean) => void;
  setShowProjectInfo: (show: boolean) => void;

  toggleGuide: (guide: keyof ProjectState['guides']) => void;
  setGuide: (guide: keyof ProjectState['guides'], show: boolean) => void;

  toggleSpace: (spaceId: string) => void;

  setStylingState: (state: Partial<ProjectState['styling']>) => void;
  setEditingState: (state: Partial<ProjectState['editing']>) => void;

  // Photo operations
  updateBeforePhoto: (spaceId: string, shotId: string, url: string) => void;
  updateAfterPhoto: (spaceId: string, shotId: string, url: string) => void;
  deletePhoto: (type: 'before' | 'after', spaceId: string, shotId: string) => void;
  addStylingPhoto: (photoId: string, data: StylingPhoto) => void;

  // Update project content
  updateEditingContent: (content: Project['editingContent']) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  project: null,
  isLoading: true,
  error: null,

  activeTab: 1,
  showPhotoGallery: false,
  showProjectInfo: false,

  guides: {
    before: false,
    after: false,
    styling: false,
    editing: false,
    release: false,
  },

  expandedSpaces: {
    living: false,
    kitchen: false,
    bedroom: false,
    bathroom: false,
  },

  styling: {
    selectedSpace: null,
    selectedPhoto: null,
    selectedStyle: 'modern',
    isStyling: false,
  },

  editing: {
    isGenerating: false,
    selectedPhoto: null,
    selectedPhotoId: null,
    concept: 'modern',
    color: 'white',
    isEditing: false,
  },
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Core actions
      setProject: (project) => set({ project, isLoading: false, error: null }, false, 'setProject'),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      setError: (error) => set({ error, isLoading: false }, false, 'setError'),

      // UI actions
      setActiveTab: (activeTab) => set({ activeTab }, false, 'setActiveTab'),

      setShowPhotoGallery: (showPhotoGallery) =>
        set({ showPhotoGallery }, false, 'setShowPhotoGallery'),

      setShowProjectInfo: (showProjectInfo) =>
        set({ showProjectInfo }, false, 'setShowProjectInfo'),

      // Guide actions
      toggleGuide: (guide) =>
        set(
          (state) => ({
            guides: { ...state.guides, [guide]: !state.guides[guide] },
          }),
          false,
          'toggleGuide'
        ),

      setGuide: (guide, show) =>
        set(
          (state) => ({
            guides: { ...state.guides, [guide]: show },
          }),
          false,
          'setGuide'
        ),

      // Space actions
      toggleSpace: (spaceId) =>
        set(
          (state) => ({
            expandedSpaces: {
              ...state.expandedSpaces,
              [spaceId]: !state.expandedSpaces[spaceId],
            },
          }),
          false,
          'toggleSpace'
        ),

      // Styling actions
      setStylingState: (stylingState) =>
        set(
          (state) => ({
            styling: { ...state.styling, ...stylingState },
          }),
          false,
          'setStylingState'
        ),

      // Editing actions
      setEditingState: (editingState) =>
        set(
          (state) => ({
            editing: { ...state.editing, ...editingState },
          }),
          false,
          'setEditingState'
        ),

      // Photo operations
      updateBeforePhoto: (spaceId, shotId, url) =>
        set(
          (state) => {
            if (!state.project) {
              return state;
            }
            return {
              project: {
                ...state.project,
                beforePhotos: {
                  ...state.project.beforePhotos,
                  [spaceId]: {
                    ...(state.project.beforePhotos[spaceId] || {}),
                    [shotId]: url,
                  },
                },
                updatedAt: new Date().toISOString(),
              },
            };
          },
          false,
          'updateBeforePhoto'
        ),

      updateAfterPhoto: (spaceId, shotId, url) =>
        set(
          (state) => {
            if (!state.project) {
              return state;
            }
            return {
              project: {
                ...state.project,
                afterPhotos: {
                  ...state.project.afterPhotos,
                  [spaceId]: {
                    ...(state.project.afterPhotos[spaceId] || {}),
                    [shotId]: url,
                  },
                },
                updatedAt: new Date().toISOString(),
              },
            };
          },
          false,
          'updateAfterPhoto'
        ),

      deletePhoto: (type, spaceId, shotId) =>
        set(
          (state) => {
            if (!state.project) {
              return state;
            }
            const photoKey = type === 'before' ? 'beforePhotos' : 'afterPhotos';
            const photos = state.project[photoKey];
            const spacePhotos = { ...(photos[spaceId] || {}) };
            delete spacePhotos[shotId];

            return {
              project: {
                ...state.project,
                [photoKey]: {
                  ...photos,
                  [spaceId]: spacePhotos,
                },
                updatedAt: new Date().toISOString(),
              },
            };
          },
          false,
          'deletePhoto'
        ),

      addStylingPhoto: (photoId, data) =>
        set(
          (state) => {
            if (!state.project) {
              return state;
            }
            return {
              project: {
                ...state.project,
                stylingPhotos: {
                  ...state.project.stylingPhotos,
                  [photoId]: data,
                },
                updatedAt: new Date().toISOString(),
              },
            };
          },
          false,
          'addStylingPhoto'
        ),

      updateEditingContent: (content) =>
        set(
          (state) => {
            if (!state.project) {
              return state;
            }
            return {
              project: {
                ...state.project,
                editingContent: content,
                updatedAt: new Date().toISOString(),
              },
            };
          },
          false,
          'updateEditingContent'
        ),

      // Reset
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'project-store' }
  )
);
