
import { ProjectProvider } from '@/context/ProjectContext';
import { useProject } from '@/context/ProjectContext';
import { ProjectForm } from '@/components/ProjectForm';
import { ModelUpload } from '@/components/ModelUpload';
import { ThreeScene } from '@/components/ThreeScene';
import { ProjectProgress } from '@/components/ProjectProgress';

function ProjectSteps() {
  const { currentStep, project } = useProject();

  return (
    <div className="w-full">
      <ProjectProgress />
      
      <div className="bg-card rounded-lg p-6 shadow-lg">
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <ProjectForm />
          </div>
        )}
        
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Upload 3D Model</h2>
            <ModelUpload />
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="h-[75vh]">
            <h2 className="text-2xl font-bold mb-6">
              {project.name} <span className="text-sm font-normal text-muted-foreground ml-2">3D Viewer</span>
            </h2>
            <ThreeScene />
          </div>
        )}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 bg-card border-b border-border">
        <div className="container">
          <h1 className="text-2xl font-bold">Spatial Canvas Scribe</h1>
          <p className="text-muted-foreground">3D Model Viewer & Annotation Tool</p>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <ProjectProvider>
          <ProjectSteps />
        </ProjectProvider>
      </main>
      
      <footer className="py-4 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Spatial Canvas Scribe. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
