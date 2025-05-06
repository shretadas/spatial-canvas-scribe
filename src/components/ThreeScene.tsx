import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, useGLTF, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useProject, Annotation, Measurement, CameraView } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Minimize, Maximize, Edit, Trash2, Camera, Search } from 'lucide-react';
import { AnnotationEditor } from './AnnotationEditor';
import { CameraControls } from './CameraControls';
import { MeasurementTool } from './MeasurementTool';
import { UserPreferences } from './UserPreferences';
import { AnnotationSearch } from './AnnotationSearch';

type ModelProps = {
  url: string;
  isEditor: boolean;
  onAddAnnotation?: (position: THREE.Vector3) => void;
  onSetMeasurementPoint?: (position: THREE.Vector3) => void;
  selectedAnnotation?: string | null;
  isMeasuring: boolean;
};

type AnnotationMarkerProps = {
  annotation: Annotation;
  setSelectedAnnotation: (id: string | null) => void;
  isSelected: boolean;
  isEditor: boolean;
  size: number;
};

type MeasurementLineProps = {
  measurement: Measurement;
  isEditor: boolean;
};

function Model({ url, isEditor, onAddAnnotation, onSetMeasurementPoint, selectedAnnotation, isMeasuring }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { raycaster, camera, gl } = useThree();

  // Handle click on the model to add annotations or measurements
  const handleModelClick = (event: any) => {
    if (!isEditor || (!onAddAnnotation && !onSetMeasurementPoint)) return;
    
    // Prevent click from propagating to canvas
    event.stopPropagation();

    // Get click position on the model
    const mouse = new THREE.Vector2(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      if (isMeasuring && onSetMeasurementPoint) {
        onSetMeasurementPoint(intersects[0].point);
      } else if (onAddAnnotation) {
        onAddAnnotation(intersects[0].point);
      }
    }
  };

  useEffect(() => {
    if (modelRef.current) {
      // Center and scale the model to fit the scene
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      
      modelRef.current.scale.set(scale, scale, scale);
      modelRef.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
  }, [scene]);

  return (
    <group ref={modelRef} onClick={handleModelClick}>
      <primitive object={scene} />
    </group>
  );
}

function AnnotationMarker({ annotation, setSelectedAnnotation, isSelected, isEditor, size }: AnnotationMarkerProps) {
  const { updateAnnotation } = useProject();
  const markerRef = useRef<THREE.Mesh>(null);
  
  // Determine marker color based on category
  const getMarkerColor = () => {
    switch (annotation.category) {
      case 'info': return '#3b82f6'; // blue
      case 'warning': return '#f59e0b'; // amber
      case 'error': return '#ef4444'; // red
      case 'feature': return '#10b981'; // emerald
      default: return '#8B5CF6'; // purple (default)
    }
  };
  
  const handleSelect = (e: any) => {
    e.stopPropagation();
    setSelectedAnnotation(annotation.id);
  };

  const markerSize = isSelected ? 0.12 * size : 0.1 * size;

  return (
    <group position={[annotation.position.x, annotation.position.y, annotation.position.z]}>
      <mesh
        ref={markerRef}
        onClick={handleSelect}
        scale={[markerSize, markerSize, markerSize]}
      >
        <sphereGeometry />
        <meshStandardMaterial 
          color={getMarkerColor()} 
          emissive={getMarkerColor()} 
          emissiveIntensity={isSelected ? 1 : 0.5} 
        />
      </mesh>
      
      {isSelected && isEditor && (
        <TransformControls 
          object={markerRef} 
          mode="translate" 
          onObjectChange={() => {
            if (markerRef.current) {
              const pos = markerRef.current.position;
              updateAnnotation(annotation.id, {
                position: { x: pos.x, y: pos.y, z: pos.z }
              });
            }
          }}
        />
      )}
      
      {isSelected && (
        <Html distanceFactor={10}>
          <div className="bg-model p-2 rounded shadow-lg text-white text-sm w-48">
            <h3 className="font-bold">{annotation.title}</h3>
            {annotation.category && (
              <div className="mt-1 mb-1 text-xs inline-block px-2 py-0.5 rounded bg-opacity-25" 
                   style={{ backgroundColor: getMarkerColor() }}>
                {annotation.category}
              </div>
            )}
            <p className="text-xs mt-1">{annotation.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function MeasurementLine({ measurement, isEditor }: MeasurementLineProps) {
  const start = new THREE.Vector3(
    measurement.startPoint.x, 
    measurement.startPoint.y, 
    measurement.startPoint.z
  );
  
  const end = new THREE.Vector3(
    measurement.endPoint.x, 
    measurement.endPoint.y, 
    measurement.endPoint.z
  );
  
  // Calculate midpoint for label
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  return (
    <group>
      {/* Line connecting points */}
      <line>
        <bufferGeometry attach="geometry">
          <float32BufferAttribute 
            attach="attributes-position" 
            args={[new Float32Array([
              start.x, start.y, start.z,
              end.x, end.y, end.z
            ]), 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#10b981" linewidth={2} />
      </line>
      
      {/* Spheres at start and end */}
      <mesh position={start.toArray()}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      
      <mesh position={end.toArray()}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      
      {/* Label with distance */}
      <Html position={midpoint.toArray()} distanceFactor={10}>
        <div className="bg-model p-1 rounded shadow-lg text-white text-xs whitespace-nowrap">
          {measurement.name}: {measurement.distance?.toFixed(2)} units
        </div>
      </Html>
    </group>
  );
}

function setCameraPosition(camera: THREE.Camera, view: CameraView) {
  switch (view) {
    case 'top':
      camera.position.set(0, 5, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'front':
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      break;
    case 'side':
      camera.position.set(5, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'back':
      camera.position.set(0, 0, -5);
      camera.lookAt(0, 0, 0);
      break;
    case 'free':
    default:
      // Keep current position
      break;
  }
}

function ViewerContent({ isEditor }: { isEditor: boolean }) {
  const { project, addAnnotation, updateAnnotation, removeAnnotation, currentCameraView, userPreferences } = useProject();
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [isMeasuringMode, setIsMeasuringMode] = useState(false);
  const [measurementPoint, setMeasurementPoint] = useState<THREE.Vector3 | null>(null);
  const { toast } = useToast();
  const { camera } = useThree();
  const cameraPositionRef = useRef<THREE.Vector3>();
  const cameraRotationRef = useRef<THREE.Euler>();
  const controlsRef = useRef<any>();

  // Take screenshot of the current view
  const takeScreenshot = () => {
    const renderer = document.querySelector('canvas');
    if (renderer) {
      const dataUrl = renderer.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${project.name}-screenshot-${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Screenshot Captured',
        description: 'Image saved to your downloads'
      });
    }
  };

  const handleAddAnnotation = (position: THREE.Vector3) => {
    const newAnnotation: Annotation = {
      id: uuidv4(),
      title: `Annotation ${project.annotations.length + 1}`,
      description: 'Click to edit this annotation',
      position: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      category: 'note',
      createdAt: new Date()
    };

    addAnnotation(newAnnotation);
    setSelectedAnnotation(newAnnotation.id);
    
    toast({
      title: 'Annotation added',
      description: 'Click on the marker to edit or move it',
    });
  };

  const handleSetMeasurementPoint = (position: THREE.Vector3) => {
    setMeasurementPoint(position);
  };
  
  const handleEditAnnotation = () => {
    if (selectedAnnotation) {
      setIsEditingAnnotation(true);
    }
  };
  
  const handleUpdateAnnotation = (data: Partial<Annotation>) => {
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation, data);
      toast({
        title: 'Annotation updated',
        description: 'Changes saved successfully'
      });
    }
  };
  
  const handleDeleteAnnotation = () => {
    if (selectedAnnotation) {
      removeAnnotation(selectedAnnotation);
      setSelectedAnnotation(null);
      setIsEditingAnnotation(false);
      
      toast({
        title: 'Annotation deleted',
        description: 'Annotation has been removed'
      });
    }
  };

  // Store camera position before focusing on annotation
  useEffect(() => {
    if (selectedAnnotation && !isEditor) {
      // Store current camera position/rotation before animating
      cameraPositionRef.current = camera.position.clone();
      cameraRotationRef.current = camera.rotation.clone();
      
      // Auto-reset after 5 seconds
      const timer = setTimeout(() => {
        setSelectedAnnotation(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedAnnotation, isEditor, camera]);

  // Reset camera position after focusing
  useEffect(() => {
    if (!selectedAnnotation && cameraPositionRef.current && cameraRotationRef.current && !isEditor) {
      camera.position.copy(cameraPositionRef.current);
      camera.rotation.copy(cameraRotationRef.current);
      cameraPositionRef.current = undefined;
      cameraRotationRef.current = undefined;
    }
  }, [selectedAnnotation, camera, isEditor]);
  
  // Apply camera view changes
  useEffect(() => {
    if (currentCameraView !== 'free') {
      setCameraPosition(camera, currentCameraView);
    }
  }, [currentCameraView, camera]);
  
  // Focus camera on selected annotation
  useFrame(() => {
    // Auto-rotate if enabled
    if (userPreferences.autoRotate && controlsRef.current && !selectedAnnotation) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 1;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    
    if (selectedAnnotation && !isEditor) {
      const annotation = project.annotations.find(a => a.id === selectedAnnotation);
      if (annotation) {
        const targetPosition = new THREE.Vector3(
          annotation.position.x, 
          annotation.position.y, 
          annotation.position.z
        );
        
        // Calculate a position slightly offset from the annotation
        const offset = new THREE.Vector3(1, 0.5, 1);
        const cameraTarget = targetPosition.clone().add(offset);
        
        // Smoothly move camera to the target position
        camera.position.lerp(cameraTarget, 0.05);
        camera.lookAt(targetPosition);
      }
    }
  });

  // Get selected annotation object
  const selectedAnnotationObject = selectedAnnotation 
    ? project.annotations.find(a => a.id === selectedAnnotation) || null
    : null;

  return (
    <>
      {project.modelUrl ? (
        <Model 
          url={project.modelUrl} 
          isEditor={isEditor} 
          onAddAnnotation={isEditor && !isMeasuringMode ? handleAddAnnotation : undefined}
          onSetMeasurementPoint={isEditor && isMeasuringMode ? handleSetMeasurementPoint : undefined}
          selectedAnnotation={selectedAnnotation}
          isMeasuring={isMeasuringMode}
        />
      ) : (
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      {userPreferences.showAnnotations && project.annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          setSelectedAnnotation={setSelectedAnnotation}
          isSelected={selectedAnnotation === annotation.id}
          isEditor={isEditor}
          size={userPreferences.annotationSize}
        />
      ))}
      
      {project.measurements.map((measurement) => (
        <MeasurementLine
          key={measurement.id}
          measurement={measurement}
          isEditor={isEditor}
        />
      ))}
      
      {!isEditor && <OrbitControls ref={controlsRef} />}
      {isEditor && <OrbitControls ref={controlsRef} makeDefault enabled={!selectedAnnotation} />}
      
      {/* Annotation editor */}
      {isEditor && selectedAnnotationObject && (
        <AnnotationEditor 
          annotation={selectedAnnotationObject}
          onSave={handleUpdateAnnotation}
          onDelete={handleDeleteAnnotation}
          onClose={() => setIsEditingAnnotation(false)}
          open={isEditingAnnotation}
        />
      )}
    </>
  );
}

export function ThreeScene() {
  const { project } = useProject();
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isMeasuringMode, setIsMeasuringMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Reference to the scene
  const viewerContentRef = useRef<any>(null);
  
  // Simulate saving annotations to database
  const handleSaveAnnotations = async () => {
    // In a real app, this would be an API call to save annotations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Annotations saved',
      description: `Saved ${project.annotations.length} annotations`,
    });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const takeScreenshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${project.name}-screenshot-${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Screenshot Captured',
        description: 'Image saved to your downloads'
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'preview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
          <Button
            variant={activeTab === 'editor' ? 'default' : 'outline'}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {!isMinimized && (
            <>
              {activeTab === 'editor' && (
                <>
                  <MeasurementTool 
                    isActive={isMeasuringMode} 
                    setIsActive={setIsMeasuringMode} 
                  />
                  <Button onClick={handleSaveAnnotations}>
                    Save Annotations
                  </Button>
                </>
              )}
              <UserPreferences />
              <AnnotationSearch onSelectAnnotation={setSelectedAnnotation} />
              <Button 
                variant="outline"
                size="icon"
                onClick={takeScreenshot}
                title="Take Screenshot"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleMinimize} 
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div 
        className={`relative bg-model rounded-lg overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-16 flex items-center justify-center' : 'flex-1'
        }`}
      >
        {isMinimized ? (
          <p className="text-white text-center">3D Viewer (Minimized)</p>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-model z-10">
                <div className="text-white text-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-white animate-spin mx-auto mb-4"></div>
                  <p>Loading 3D Model...</p>
                </div>
              </div>
            )}
            
            <Canvas
              ref={canvasRef}
              camera={{ position: [0, 0, 5], fov: 50 }}
              style={{ width: '100%', height: '100%' }}
              onCreated={() => setTimeout(() => setIsLoading(false), 1000)}
              gl={{ preserveDrawingBuffer: true }} // Required for screenshots
            >
              <Suspense fallback={null}>
                <ViewerContent isEditor={activeTab === 'editor'} />
              </Suspense>
            </Canvas>
            
            {/* Camera controls overlay */}
            {!isLoading && (
              <div className="absolute bottom-4 right-4">
                <CameraControls takeScreenshot={takeScreenshot} />
              </div>
            )}
            
            {activeTab === 'editor' && (
              <div className="absolute bottom-4 left-4 right-24 bg-black bg-opacity-70 p-3 rounded-lg text-white text-sm">
                <p>In Editor mode:</p>
                <ul className="list-disc list-inside">
                  <li>Click on the model to add an annotation</li>
                  <li>Click on an annotation marker to select it</li>
                  <li>Use the Measure tool to calculate distances</li>
                  <li>Use Camera Views to see your model from different angles</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      
      {activeTab === 'editor' && project.annotations.length > 0 && !isMinimized && (
        <div className="mt-4 p-4 bg-card rounded-lg">
          <h3 className="font-medium mb-2">Annotations ({project.annotations.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {project.annotations.map((ann) => (
              <div key={ann.id} className="border border-border p-2 rounded flex items-center justify-between">
                <div className="truncate">
                  <span className="font-medium">{ann.title}</span>
                  {ann.category && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {ann.category}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setSelectedAnnotation(ann.id);
                      // Set a small timeout to allow the UI to update
                      setTimeout(() => {
                        setIsMinimized(false); // Ensure viewer is expanded
                      }, 100);
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setSelectedAnnotation(ann.id);
                      // Open the editor dialog
                      // Set a small timeout to allow the UI to update
                      setTimeout(() => {
                        // Here we would trigger the annotation editor
                      }, 100);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
