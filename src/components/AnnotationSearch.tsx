
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Annotation, useProject } from '@/context/ProjectContext';
import { Search, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnnotationSearchProps {
  onSelectAnnotation: (id: string) => void;
}

export function AnnotationSearch({ onSelectAnnotation }: AnnotationSearchProps) {
  const { project } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const filteredAnnotations = project.annotations.filter(annotation => {
    const matchesSearch = 
      annotation.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      annotation.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !categoryFilter || annotation.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const uniqueCategories = Array.from(
    new Set(project.annotations.map(ann => ann.category).filter(Boolean))
  ) as string[];
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchTerm('');
      setCategoryFilter(null);
    }
  };
  
  const handleSelectCategory = (category: string) => {
    setCategoryFilter(categoryFilter === category ? null : category);
  };
  
  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={toggleSearch} className="flex items-center gap-1">
        <Search size={16} />
        <span>Search</span>
      </Button>
      
      {isSearchOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-background rounded-lg border shadow-lg p-4 z-10">
          <div className="mb-3">
            <Input
              placeholder="Search annotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {uniqueCategories.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium mb-1 text-muted-foreground">Filter by category:</div>
              <div className="flex flex-wrap gap-1">
                {uniqueCategories.map(cat => (
                  <Badge
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => handleSelectCategory(cat)}
                  >
                    <Tag size={12} />
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto">
            {filteredAnnotations.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-2">
                No annotations found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAnnotations.map(ann => (
                  <div 
                    key={ann.id}
                    className="p-2 rounded-md border hover:bg-accent cursor-pointer text-sm"
                    onClick={() => {
                      onSelectAnnotation(ann.id);
                      setIsSearchOpen(false);
                    }}
                  >
                    <div className="font-medium">{ann.title}</div>
                    {ann.category && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {ann.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
