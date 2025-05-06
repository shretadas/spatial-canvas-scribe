
import { Button } from '@/components/ui/button';
import { CameraView, useProject } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Camera
} from 'lucide-react';

interface CameraControlsProps {
  takeScreenshot: () => void;
}

const VIEW_BUTTONS: { view: CameraView; icon: JSX.Element; label: string }[] = [
  { view: 'top', icon: <ArrowUp size={16} />, label: 'Top' },
  { view: 'front', icon: <ArrowRight size={16} />, label: 'Front' },
  { view: 'side', icon: <ArrowLeft size={16} />, label: 'Side' },
  { view: 'back', icon: <ArrowDown size={16} />, label: 'Back' },
  { view: 'free', icon: <Layers size={16} />, label: 'Free' },
];

export function CameraControls({ takeScreenshot }: CameraControlsProps) {
  const { currentCameraView, setCameraView, userPreferences, updateUserPreferences } = useProject();
  const { toast } = useToast();
  
  const handleViewChange = (view: CameraView) => {
    setCameraView(view);
    toast({
      title: "View Changed",
      description: `Camera position set to ${view} view`
    });
  };

  const toggleAutoRotate = () => {
    updateUserPreferences({ autoRotate: !userPreferences.autoRotate });
  };

  return (
    <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-md flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground mb-1">Camera Views</div>
        <div className="flex gap-1">
          {VIEW_BUTTONS.map(({ view, icon, label }) => (
            <Button
              key={view}
              size="sm"
              variant={currentCameraView === view ? "default" : "outline"}
              className="h-8 flex gap-1 text-xs"
              onClick={() => handleViewChange(view)}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 justify-between">
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex gap-1 text-xs"
          onClick={toggleAutoRotate}
        >
          {userPreferences.autoRotate ? "Stop Rotation" : "Auto-Rotate"}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex gap-1 text-xs"
          onClick={takeScreenshot}
        >
          <Camera size={16} />
          <span className="hidden sm:inline">Screenshot</span>
        </Button>
      </div>
    </div>
  );
}
