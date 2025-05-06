
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useProject } from "@/context/ProjectContext";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function UserPreferences() {
  const { userPreferences, updateUserPreferences } = useProject();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Viewer Preferences</SheetTitle>
          <SheetDescription>
            Customize your 3D viewer experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <label htmlFor="dark-mode" className="text-sm font-medium">
              Dark Mode
            </label>
            <Switch 
              id="dark-mode"
              checked={userPreferences.darkMode}
              onCheckedChange={(checked) => updateUserPreferences({ darkMode: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="show-annotations" className="text-sm font-medium">
              Show Annotations
            </label>
            <Switch 
              id="show-annotations"
              checked={userPreferences.showAnnotations}
              onCheckedChange={(checked) => updateUserPreferences({ showAnnotations: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="highlight-selected" className="text-sm font-medium">
              Highlight Selected
            </label>
            <Switch 
              id="highlight-selected"
              checked={userPreferences.highlightSelected}
              onCheckedChange={(checked) => updateUserPreferences({ highlightSelected: checked })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="annotation-size" className="text-sm font-medium">
              Annotation Size: {userPreferences.annotationSize.toFixed(1)}
            </label>
            <Slider
              id="annotation-size"
              min={0.5}
              max={2}
              step={0.1}
              value={[userPreferences.annotationSize]}
              onValueChange={(values) => updateUserPreferences({ annotationSize: values[0] })}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
