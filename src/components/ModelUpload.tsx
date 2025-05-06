
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export function ModelUpload() {
  const { project, setProject, nextStep, prevStep } = useProject();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a .glb file',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);
    
    // In a real app, we would upload the file to a server and get back a URL
    // For this demo, we'll create a URL from the file object
    const modelUrl = URL.createObjectURL(file);
    setProject({ modelUrl });
  };

  const handleUpload = async () => {
    if (!project.modelUrl) {
      toast({
        title: 'No file selected',
        description: 'Please select a .glb file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Model uploaded successfully',
      description: 'You can now view and edit your 3D model',
    });
    
    setIsUploading(false);
    nextStep();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="space-y-1">
            <p className="text-lg font-medium">Upload your 3D model</p>
            <p className="text-sm text-muted-foreground">
              Drag and drop your .glb file here, or click to select
            </p>
          </div>
          {fileName && (
            <div className="bg-secondary px-4 py-2 rounded-md text-sm">
              Selected: {fileName}
            </div>
          )}
        </div>
        <Input 
          ref={fileInputRef}
          type="file"
          accept=".glb"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleUpload} disabled={!project.modelUrl || isUploading}>
          {isUploading ? 'Uploading...' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
