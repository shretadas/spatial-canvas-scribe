
import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, useGLTF, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useProject, Annotation } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Minimize, Maximize } from 'lucide-react';

type ModelProps = {
  url: string;
  isEditor: boolean;
  onAddAnnotation?: (position: THREE.Vector3) => void;
  selectedAnnotation?: string | null;
};

type AnnotationMarkerProps = {
  annotation: Annotation;
  setSelectedAnnotation: (id: string | null) => void;
  isSelected: boolean;
  isEditor: boolean;
};

function Model({ url, isEditor, onAddAnnotation, selectedAnnotation }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { raycaster, camera, gl } = useThree();

  // Handle click on the model to add annotations
  const handleModelClick = (event: any) => {
    if (!isEditor || !onAddAnnotation) return;

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
      onAddAnnotation(intersects[0].point);
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

function AnnotationMarker({ annotation, setSelectedAnnotation, isSelected, isEditor }: AnnotationMarkerProps) {
  const { updateAnnotation } = useProject();
  const markerRef = useRef<THREE.Mesh>(null);
  
  const handleSelect = (e: any) => {
    e.stopPropagation();
    setSelectedAnnotation(annotation.id);
  };

  return (
    <group position={[annotation.position.x, annotation.position.y, annotation.position.z]}>
      <mesh
        ref={markerRef}
        onClick={handleSelect}
        scale={isSelected ? [0.12, 0.12, 0.12] : [0.1, 0.1, 0.1]}
      >
        <sphereGeometry />
        <meshStandardMaterial color="#8B5CF6" emissive="#6E59A5" emissiveIntensity={isSelected ? 1 : 0.5} />
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
            <p className="text-xs mt-1">{annotation.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function ViewerContent({ isEditor }: { isEditor: boolean }) {
  const { project, addAnnotation } = useProject();
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const { toast } = useToast();
  const { camera } = useThree();
  const cameraPositionRef = useRef<THREE.Vector3>();
  const cameraRotationRef = useRef<THREE.Euler>();

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
    };

    addAnnotation(newAnnotation);
    setSelectedAnnotation(newAnnotation.id);
    
    toast({
      title: 'Annotation added',
      description: 'Click on the marker to edit or move it',
    });
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
  
  // Focus camera on selected annotation
  useFrame(() => {
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

  return (
    <>
      {project.modelUrl ? (
        <Model 
          url={project.modelUrl} 
          isEditor={isEditor} 
          onAddAnnotation={isEditor ? handleAddAnnotation : undefined}
          selectedAnnotation={selectedAnnotation}
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
      
      {project.annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          setSelectedAnnotation={setSelectedAnnotation}
          isSelected={selectedAnnotation === annotation.id}
          isEditor={isEditor}
        />
      ))}
      
      {!isEditor && <OrbitControls />}
      {isEditor && <OrbitControls makeDefault enabled={!selectedAnnotation} />}
    </>
  );
}

export function ThreeScene() {
  const { project } = useProject();
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
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
          {activeTab === 'editor' && (
            <Button onClick={handleSaveAnnotations}>
              Save Annotations
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={toggleMinimize} aria-label={isMinimized ? "Maximize" : "Minimize"}>
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
              camera={{ position: [0, 0, 5], fov: 50 }}
              style={{ width: '100%', height: '100%' }}
              onCreated={() => setTimeout(() => setIsLoading(false), 1000)}
            >
              <Suspense fallback={null}>
                <ViewerContent isEditor={activeTab === 'editor'} />
              </Suspense>
            </Canvas>
            
            {activeTab === 'editor' && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-3 rounded-lg text-white text-sm">
                <p>In Editor mode:</p>
                <ul className="list-disc list-inside">
                  <li>Click on the model to add an annotation</li>
                  <li>Click on an annotation marker to select it</li>
                  <li>Drag the controls to move the selected annotation</li>
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
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
