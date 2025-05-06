
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AnnotationCategory = 'info' | 'warning' | 'error' | 'feature' | 'note';

export type Annotation = {
  id: string;
  title: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  category?: AnnotationCategory;
  createdAt: Date;
};

export type CameraView = 'free' | 'top' | 'front' | 'side' | 'back';

export type UserPreferences = {
  darkMode: boolean;
  showAnnotations: boolean;
  annotationSize: number;
  autoRotate: boolean;
  highlightSelected: boolean;
};

type ProjectData = {
  id?: string;
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  modelUrl?: string;
  annotations: Annotation[];
  measurements: Measurement[];
};

export type Measurement = {
  id: string;
  name: string;
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  distance?: number;
};

type ProjectContextType = {
  project: ProjectData;
  currentStep: number;
  currentCameraView: CameraView;
  userPreferences: UserPreferences;
  setProject: (data: Partial<ProjectData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, data: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  setCameraView: (view: CameraView) => void;
  addMeasurement: (measurement: Measurement) => void;
  removeMeasurement: (id: string) => void;
  updateMeasurement: (id: string, data: Partial<Measurement>) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
};

const defaultProject: ProjectData = {
  name: '',
  description: '',
  canvasWidth: 1280,
  canvasHeight: 720,
  annotations: [],
  measurements: [],
};

const defaultPreferences: UserPreferences = {
  darkMode: false,
  showAnnotations: true,
  annotationSize: 1,
  autoRotate: false,
  highlightSelected: true,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProjectData] = useState<ProjectData>(defaultProject);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentCameraView, setCurrentCameraView] = useState<CameraView>('free');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);

  const setProject = (data: Partial<ProjectData>) => {
    setProjectData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const addAnnotation = (annotation: Annotation) => {
    setProjectData((prev) => ({
      ...prev,
      annotations: [...prev.annotations, annotation],
    }));
  };

  const updateAnnotation = (id: string, data: Partial<Annotation>) => {
    setProjectData((prev) => ({
      ...prev,
      annotations: prev.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...data } : ann
      ),
    }));
  };

  const removeAnnotation = (id: string) => {
    setProjectData((prev) => ({
      ...prev,
      annotations: prev.annotations.filter((ann) => ann.id !== id),
    }));
  };

  const setCameraView = (view: CameraView) => {
    setCurrentCameraView(view);
  };

  const addMeasurement = (measurement: Measurement) => {
    setProjectData((prev) => ({
      ...prev,
      measurements: [...prev.measurements, measurement],
    }));
  };

  const removeMeasurement = (id: string) => {
    setProjectData((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((m) => m.id !== id),
    }));
  };
  
  const updateMeasurement = (id: string, data: Partial<Measurement>) => {
    setProjectData((prev) => ({
      ...prev,
      measurements: prev.measurements.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    }));
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        currentStep,
        currentCameraView,
        userPreferences,
        setProject,
        nextStep,
        prevStep,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
        setCameraView,
        addMeasurement,
        removeMeasurement,
        updateMeasurement,
        updateUserPreferences,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
