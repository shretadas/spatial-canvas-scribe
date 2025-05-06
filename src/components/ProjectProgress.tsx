
import { useProject } from '@/context/ProjectContext';

export function ProjectProgress() {
  const { currentStep } = useProject();
  
  const steps = [
    { id: 1, name: 'Project Details' },
    { id: 2, name: 'Upload Model' },
    { id: 3, name: '3D Viewer' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${currentStep === step.id 
                ? 'border-primary bg-primary text-primary-foreground' 
                : currentStep > step.id 
                  ? 'border-primary bg-primary/20 text-primary' 
                  : 'border-muted text-muted-foreground'}`}>
              {currentStep > step.id ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                step.id
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep === step.id 
                ? 'text-foreground' 
                : currentStep > step.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
            }`}>
              {step.name}
            </span>
            
            {i < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > i + 1 ? 'bg-primary' : 'bg-muted'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
