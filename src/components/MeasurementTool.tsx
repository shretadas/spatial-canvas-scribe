
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Measurement, useProject } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { Ruler } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';

interface MeasurementToolProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export function MeasurementTool({ isActive, setIsActive }: MeasurementToolProps) {
  const { project, addMeasurement, removeMeasurement } = useProject();
  const { toast } = useToast();
  const [currentPoint, setCurrentPoint] = useState<'start' | 'end' | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement> | null>(null);

  const startMeasurement = () => {
    setIsActive(true);
    setCurrentPoint('start');
    setCurrentMeasurement({
      id: uuidv4(),
      name: `Measurement ${project.measurements.length + 1}`,
    });
    
    toast({
      title: "Measurement Started",
      description: "Click on the model to set the starting point"
    });
  };

  const cancelMeasurement = () => {
    setIsActive(false);
    setCurrentPoint(null);
    setCurrentMeasurement(null);
  };

  const handlePointSet = (position: THREE.Vector3) => {
    if (!currentPoint || !currentMeasurement) return;
    
    if (currentPoint === 'start') {
      setCurrentMeasurement({
        ...currentMeasurement,
        startPoint: { x: position.x, y: position.y, z: position.z }
      });
      setCurrentPoint('end');
      
      toast({
        title: "Starting Point Set",
        description: "Now click to set the ending point"
      });
    } else if (currentPoint === 'end') {
      const startPoint = currentMeasurement.startPoint!;
      const endPoint = { x: position.x, y: position.y, z: position.z };
      
      // Calculate distance
      const start = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z);
      const end = new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z);
      const distance = start.distanceTo(end);
      
      const completedMeasurement: Measurement = {
        id: currentMeasurement.id!,
        name: currentMeasurement.name!,
        startPoint,
        endPoint,
        distance
      };
      
      addMeasurement(completedMeasurement);
      
      setCurrentPoint(null);
      setCurrentMeasurement(null);
      setIsActive(false);
      
      toast({
        title: "Measurement Complete",
        description: `Distance: ${distance.toFixed(2)} units`
      });
    }
  };
  
  return (
    <div>
      {!isActive ? (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={startMeasurement}
        >
          <Ruler size={16} />
          <span>Measure</span>
        </Button>
      ) : (
        <div className="flex gap-2 items-center">
          <div className="text-sm font-medium">
            {currentPoint === 'start' ? 'Set start point' : 'Set end point'}
          </div>
          <Button size="sm" variant="outline" onClick={cancelMeasurement}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
