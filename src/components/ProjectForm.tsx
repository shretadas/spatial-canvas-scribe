
import { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function ProjectForm() {
  const { project, setProject, nextStep } = useProject();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!project.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (project.canvasWidth <= 0) {
      newErrors.canvasWidth = 'Canvas width must be positive';
    }

    if (project.canvasHeight <= 0) {
      newErrors.canvasHeight = 'Canvas height must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      toast({
        title: 'Project details saved',
        description: 'Now you can upload your 3D model',
      });
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          value={project.name}
          onChange={(e) => setProject({ name: e.target.value })}
          placeholder="Enter project name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={project.description}
          onChange={(e) => setProject({ description: e.target.value })}
          placeholder="Describe your project"
          className="h-32"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Canvas Width <span className="text-red-500">*</span></Label>
          <Input
            id="width"
            type="number"
            value={project.canvasWidth}
            onChange={(e) => setProject({ canvasWidth: parseInt(e.target.value) || 0 })}
            min="1"
            className={errors.canvasWidth ? 'border-red-500' : ''}
          />
          {errors.canvasWidth && <p className="text-red-500 text-sm">{errors.canvasWidth}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Canvas Height <span className="text-red-500">*</span></Label>
          <Input
            id="height"
            type="number"
            value={project.canvasHeight}
            onChange={(e) => setProject({ canvasHeight: parseInt(e.target.value) || 0 })}
            min="1"
            className={errors.canvasHeight ? 'border-red-500' : ''}
          />
          {errors.canvasHeight && <p className="text-red-500 text-sm">{errors.canvasHeight}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
