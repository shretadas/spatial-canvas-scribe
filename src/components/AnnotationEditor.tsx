
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Annotation, AnnotationCategory } from '@/context/ProjectContext';
import { Trash2 } from 'lucide-react';

interface AnnotationEditorProps {
  annotation: Annotation | null;
  onSave: (data: Partial<Annotation>) => void;
  onDelete: () => void;
  onClose: () => void;
  open: boolean;
}

const CATEGORY_OPTIONS: { value: AnnotationCategory; label: string; color: string }[] = [
  { value: 'info', label: 'Information', color: '#3b82f6' },
  { value: 'warning', label: 'Warning', color: '#f59e0b' },
  { value: 'error', label: 'Error', color: '#ef4444' },
  { value: 'feature', label: 'Feature', color: '#10b981' },
  { value: 'note', label: 'Note', color: '#8b5cf6' },
];

export function AnnotationEditor({ annotation, onSave, onDelete, onClose, open }: AnnotationEditorProps) {
  const [formData, setFormData] = useState<Partial<Annotation>>({});
  
  // Reset form when annotation changes
  useState(() => {
    if (annotation) {
      setFormData({
        title: annotation.title,
        description: annotation.description,
        category: annotation.category || 'note',
      });
    }
  });
  
  const handleChange = (field: keyof Annotation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!annotation) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Annotation</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={formData.title || annotation.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right text-sm font-medium">
              Category
            </label>
            <Select 
              value={formData.category || annotation.category || 'note'} 
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description || annotation.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={onDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
