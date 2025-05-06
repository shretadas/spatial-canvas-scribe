
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProjectData = {
  id?: string;
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  modelUrl?: string;
  annotations: Annotation[];
};

export type Annotation = {
  id: string;
  title: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
};

type ProjectContextType = {
  project: ProjectData;
  currentStep: number;
  setProject: (data: Partial<ProjectData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, data: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
};

const defaultProject: ProjectData = {
  name: '',
  description: '',
  canvasWidth: 1280,
  canvasHeight: 720,
  annotations: [],
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProjectData] = useState<ProjectData>(defaultProject);
  const [currentStep, setCurrentStep] = useState(1);

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

  return (
    <ProjectContext.Provider
      value={{
        project,
        currentStep,
        setProject,
        nextStep,
        prevStep,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
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
