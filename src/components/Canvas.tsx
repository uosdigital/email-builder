import React, { useState, useEffect } from 'react';
import { EmailComponent } from '../types/email';
import EmailComponentRenderer from './EmailComponentRenderer';
import { Trash2, Copy, Move, X } from 'lucide-react';

interface CanvasProps {
  components: EmailComponent[];
  onUpdateComponents: (components: EmailComponent[]) => void;
  onSelectComponent: (component: EmailComponent | null) => void;
  selectedComponent: EmailComponent | null;
  onDrop: (e: React.DragEvent, containerId?: string, dropZoneIndex?: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  className?: string;
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  onUpdateComponents,
  onSelectComponent,
  selectedComponent,
  onDrop,
  onDragOver,
  className,
}) => {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; component: EmailComponent } | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{ components: EmailComponent[]; componentId: string } | null>(null);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // NEW

  useEffect(() => {
    // Remove handleBannerImageDrop, updateBannerImage, and event listeners for 'banner-image-drop'.
  }, [components, onUpdateComponents]);

  useEffect(() => {
    const handleBannerImageUpdated = (e: any) => {
      const { componentId, updatedComponent } = e.detail;
      const updateBannerImage = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId
            ? updatedComponent
            : comp.children
            ? { ...comp, children: updateBannerImage(comp.children) }
            : comp
        );
      onUpdateComponents(updateBannerImage(components));
    };
    window.addEventListener('banner-image-updated', handleBannerImageUpdated);
    return () => window.removeEventListener('banner-image-updated', handleBannerImageUpdated);
  }, [components, onUpdateComponents]);

  useEffect(() => {
    const handleContentCardImageUpdated = (e: any) => {
      const { componentId, updatedComponent } = e.detail;
      const updateContentCardImage = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId
            ? updatedComponent
            : comp.children
            ? { ...comp, children: updateContentCardImage(comp.children) }
            : comp
        );
      onUpdateComponents(updateContentCardImage(components));
    };

    const handleTwoColumnsCardImageUpdated = (e: any) => {
      const { componentId, updatedComponent } = e.detail;
      const updateTwoColumnsCardImage = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId
            ? updatedComponent
            : comp.children
            ? { ...comp, children: updateTwoColumnsCardImage(comp.children) }
            : comp
        );
      onUpdateComponents(updateTwoColumnsCardImage(components));
    };

    const handleAddButtonToLeftColumn = (e: any) => {
      const { componentId, button } = e.detail;
      const addButtonToLeftColumn = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId && comp.type === 'two-columns-card'
            ? { ...comp, leftChildren: [...(comp.leftChildren || []), button] }
            : comp.children
            ? { ...comp, children: addButtonToLeftColumn(comp.children) }
            : comp
        );
      const updatedComponents = addButtonToLeftColumn(components);
      onUpdateComponents(updatedComponents);
      
      // Find and select the parent two-columns card instead of the button
      const findParentCard = (comps: EmailComponent[]): EmailComponent | null => {
        for (const comp of comps) {
          if (comp.id === componentId && comp.type === 'two-columns-card') {
            return comp;
          }
          if (comp.children) {
            const found = findParentCard(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const parentCard = findParentCard(updatedComponents);
      if (parentCard) {
        onSelectComponent(parentCard);
      }
      
      // Reset drag states after successful button drop
      setIsDragging(false);
      setIsDraggingFromPalette(false);
      setActiveDropZone(null);
    };

    const handleAddButtonToRightColumn = (e: any) => {
      const { componentId, button } = e.detail;
      const addButtonToRightColumn = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId && comp.type === 'two-columns-card'
            ? { ...comp, rightChildren: [...(comp.rightChildren || []), button] }
            : comp.children
            ? { ...comp, children: addButtonToRightColumn(comp.children) }
            : comp
        );
      const updatedComponents = addButtonToRightColumn(components);
      onUpdateComponents(updatedComponents);
      
      // Find and select the parent two-columns card instead of the button
      const findParentCard = (comps: EmailComponent[]): EmailComponent | null => {
        for (const comp of comps) {
          if (comp.id === componentId && comp.type === 'two-columns-card') {
            return comp;
          }
          if (comp.children) {
            const found = findParentCard(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const parentCard = findParentCard(updatedComponents);
      if (parentCard) {
        onSelectComponent(parentCard);
      }
      
      // Reset drag states after successful button drop
      setIsDragging(false);
      setIsDraggingFromPalette(false);
      setActiveDropZone(null);
    };

    const handleAddButtonToContentCard = (e: any) => {
      const { componentId, button } = e.detail;
      const addButtonToContentCard = (comps: EmailComponent[]): EmailComponent[] =>
        comps.map(comp =>
          comp.id === componentId && comp.type === 'content-card'
            ? { ...comp, children: [...(comp.children || []), button] }
            : comp.children
            ? { ...comp, children: addButtonToContentCard(comp.children) }
            : comp
        );
      const updatedComponents = addButtonToContentCard(components);
      onUpdateComponents(updatedComponents);
      
      // Find and select the parent content card instead of the button
      const findParentCard = (comps: EmailComponent[]): EmailComponent | null => {
        for (const comp of comps) {
          if (comp.id === componentId && comp.type === 'content-card') {
            return comp;
          }
          if (comp.children) {
            const found = findParentCard(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const parentCard = findParentCard(updatedComponents);
      if (parentCard) {
        onSelectComponent(parentCard);
      }
      
      // Reset drag states after successful button drop
      setIsDragging(false);
      setIsDraggingFromPalette(false);
      setActiveDropZone(null);
    };

    window.addEventListener('content-card-image-updated', handleContentCardImageUpdated);
    window.addEventListener('two-columns-card-image-updated', handleTwoColumnsCardImageUpdated);
    window.addEventListener('add-button-to-left-column', handleAddButtonToLeftColumn);
    window.addEventListener('add-button-to-right-column', handleAddButtonToRightColumn);
    window.addEventListener('add-button-to-content-card', handleAddButtonToContentCard);
    return () => {
      window.removeEventListener('content-card-image-updated', handleContentCardImageUpdated);
      window.removeEventListener('two-columns-card-image-updated', handleTwoColumnsCardImageUpdated);
      window.removeEventListener('add-button-to-left-column', handleAddButtonToLeftColumn);
      window.removeEventListener('add-button-to-right-column', handleAddButtonToRightColumn);
      window.removeEventListener('add-button-to-content-card', handleAddButtonToContentCard);
    };
  }, [components, onUpdateComponents]);

  const handleDropZoneDragOver = (e: React.DragEvent, dropZoneIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're dragging from palette (no draggedComponentId but we have drag data)
    const hasDragData = e.dataTransfer.types.length > 0;
    if (!draggedComponentId && hasDragData) {
      setIsDraggingFromPalette(true);
    }
    
    if (draggedComponentId || hasDragData) {
      setActiveDropZone(dropZoneIndex);
    }
    
    setDraggedOver('canvas');
    onDragOver(e);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only clear if we're leaving the drop zone area
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setActiveDropZone(null);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent, dropZoneIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
    setDragPreview(null);
    setActiveDropZone(null);
    setIsDraggingFromPalette(false);
    setIsDragging(false); // NEW
    
    // Check for uploaded image drop
    const uploadedImageData = e.dataTransfer.getData('application/json');
    let uploadedImage = null;
    try {
      if (uploadedImageData) {
        const parsed = JSON.parse(uploadedImageData);
        if (parsed && parsed.src) {
          uploadedImage = parsed;
        }
      }
    } catch {}

    if (uploadedImage) {
      // Handle uploaded image drop - this would need to be implemented based on your requirements
      // For now, we'll just handle component reordering
    }

    if (draggedComponentId) {
      handleComponentReorder(draggedComponentId, dropZoneIndex);
      setDraggedComponentId(null);
    } else {
      // Handle new component drop with drop zone index
      onDrop(e, undefined, dropZoneIndex);
    }
    
    setDragStartPosition(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're dragging from palette (no draggedComponentId but we have drag data)
    const hasDragData = e.dataTransfer.types.length > 0;
    if (!draggedComponentId && hasDragData) {
      setIsDraggingFromPalette(true);
    }
    
    if (draggedComponentId || hasDragData) {
      // Calculate drop position based on mouse position
      const canvas = e.currentTarget as HTMLElement;
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      
      // Find the best insertion point
      let insertIndex = components.length;
      const componentElements = canvas.querySelectorAll('[data-component-id]');
      
      for (let i = 0; i < componentElements.length; i++) {
        const element = componentElements[i] as HTMLElement;
        const elementRect = element.getBoundingClientRect();
        const elementY = elementRect.top - rect.top + elementRect.height / 2;
        
        if (y < elementY) {
          insertIndex = i;
          break;
        }
      }
      
      setActiveDropZone(insertIndex);
    }
    
    setDraggedOver('canvas');
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only clear if we're leaving the canvas area
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDraggedOver(null);
      setActiveDropZone(null);
      setIsDragging(false); // NEW
    }
  };

  const handleDrop = (e: React.DragEvent, containerId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
    setDragPreview(null);
    setActiveDropZone(null);
    setIsDraggingFromPalette(false);
    setIsDragging(false); // NEW
    
    // Check for uploaded image drop
    const uploadedImageData = e.dataTransfer.getData('application/json');
    let uploadedImage = null;
    try {
      if (uploadedImageData) {
        const parsed = JSON.parse(uploadedImageData);
        if (parsed && parsed.src) {
          uploadedImage = parsed;
        }
      }
    } catch {}

    if (uploadedImage && containerId) {
      // Find and update the image component's src
      const updated = components.map((comp: EmailComponent) =>
        comp.id === containerId && comp.type === 'image' ? {
          ...comp,
          props: {
            ...comp.props,
            src: uploadedImage.src,
            alt: uploadedImage.alt || comp.props.alt,
          },
        } : comp
      );
      onUpdateComponents(updated);
      setDragStartPosition(null);
      return;
    }

    if (draggedComponentId && activeDropZone !== null) {
      handleComponentReorder(draggedComponentId, activeDropZone);
      setDraggedComponentId(null);
    } else if (draggedComponentId && activeDropZone === null) {
      // No valid drop position - restore original position
      if (dragStartPosition) {
        onUpdateComponents(dragStartPosition.components);
      }
      setDraggedComponentId(null);
    } else if (!draggedComponentId) {
      // Handle new component drop
      onDrop(e, containerId);
    }
    
    setDragStartPosition(null);
  };

  const handleComponentDragStart = (e: React.DragEvent, componentId: string) => {
    setDraggedComponentId(componentId);
    setIsDragging(true); // NEW
    
    // Store the initial state for potential restoration
    setDragStartPosition({
      components: [...components],
      componentId
    });
    
    // Find the component being dragged
    const findComponent = (comps: EmailComponent[]): EmailComponent | null => {
      for (const comp of comps) {
        if (comp.id === componentId) return comp;
        if (comp.children) {
          const found = findComponent(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const draggedComponent = findComponent(components);
    if (draggedComponent) {
      setDragPreview({
        x: e.clientX,
        y: e.clientY,
        component: draggedComponent
      });
    }
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleComponentDrag = (e: React.DragEvent) => {
    if (dragPreview && e.clientX !== 0 && e.clientY !== 0) {
      setDragPreview(prev => prev ? {
        ...prev,
        x: e.clientX,
        y: e.clientY
      } : null);
    }
  };

  const handleComponentDragEnd = () => {
    // If no valid drop occurred, restore original position
    if (draggedComponentId && activeDropZone === null && dragStartPosition) {
      onUpdateComponents(dragStartPosition.components);
    }
    
    setDragPreview(null);
    setDraggedComponentId(null);
    setActiveDropZone(null);
    setIsDraggingFromPalette(false);
    setIsDragging(false); // NEW
    setDragStartPosition(null);
  };

  const handleComponentReorder = (draggedId: string, dropZoneIndex: number) => {
    // Remove the dragged component from its current position
    const removeComponent = (comps: EmailComponent[]): { components: EmailComponent[], removed: EmailComponent | null } => {
      for (let i = 0; i < comps.length; i++) {
        if (comps[i].id === draggedId) {
          const removed = comps[i];
          return {
            components: [...comps.slice(0, i), ...comps.slice(i + 1)],
            removed
          };
        }
        if (comps[i].children) {
          const result = removeComponent(comps[i].children || []);
          if (result.removed) {
            return {
              components: comps.map((comp, index) => 
                index === i ? { ...comp, children: result.components } : comp
              ),
              removed: result.removed
            };
          }
        }
      }
      return { components: comps, removed: null };
    };

    const { components: withoutDragged, removed } = removeComponent(components);
    
    if (!removed) {
      // Component not found - restore original position
      if (dragStartPosition) {
        onUpdateComponents(dragStartPosition.components);
      }
      return;
    }

    // Insert the component at the new position
    const insertIndex = Math.max(0, Math.min(withoutDragged.length, dropZoneIndex));
      const newComponents = [
        ...withoutDragged.slice(0, insertIndex),
        removed,
        ...withoutDragged.slice(insertIndex)
      ];
      onUpdateComponents(newComponents);
  };

  const handleDeleteComponent = (componentId: string) => {
    const deleteFromComponents = (comps: EmailComponent[]): EmailComponent[] => {
      return comps.filter(comp => {
        if (comp.id === componentId) {
          return false;
        }
        if (comp.children) {
          comp.children = deleteFromComponents(comp.children);
        }
        return true;
      });
    };

    const updatedComponents = deleteFromComponents(components);
    onUpdateComponents(updatedComponents);
    if (selectedComponent?.id === componentId) {
      onSelectComponent(null);
    }
  };

  const handleDuplicateComponent = (component: EmailComponent) => {
    const duplicateComponent = (comp: EmailComponent): EmailComponent => ({
      ...comp,
      id: `${comp.type}-${Date.now()}-${Math.random()}`,
      children: comp.children ? comp.children.map(duplicateComponent) : undefined,
    });

    const duplicatedComponent = duplicateComponent(component);
    
    const addToComponents = (comps: EmailComponent[]): EmailComponent[] => {
      for (let i = 0; i < comps.length; i++) {
        if (comps[i].id === component.id) {
          return [
            ...comps.slice(0, i + 1),
            duplicatedComponent,
            ...comps.slice(i + 1)
          ];
        }
        if (comps[i].children) {
          const updatedChildren = addToComponents(comps[i].children || []);
          if (updatedChildren !== comps[i].children) {
            return comps.map((comp, index) => 
              index === i ? { ...comp, children: updatedChildren } : comp
            );
          }
        }
      }
      return comps;
    };

    const updatedComponents = addToComponents(components);
    onUpdateComponents(updatedComponents);
  };

  const handleClearImage = (componentId: string) => {
    const clearImageInComponents = (comps: EmailComponent[]): EmailComponent[] => {
      return comps.map(comp => {
        if (comp.id === componentId) {
          return {
            ...comp,
            props: {
              ...comp.props,
              src: '',
              alt: '',
            },
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: clearImageInComponents(comp.children)
          };
        }
        return comp;
      });
    };

    const updatedComponents = clearImageInComponents(components);
    onUpdateComponents(updatedComponents);
  };

  const handleClearContentCardImage = (componentId: string) => {
    const clearImageInContentCards = (comps: EmailComponent[]): EmailComponent[] =>
      comps.map(comp =>
        comp.id === componentId && comp.type === 'content-card'
          ? { ...comp, props: { ...comp.props, src: '', alt: '' } }
          : comp.children
          ? { ...comp, children: clearImageInContentCards(comp.children) }
          : comp
      );
    onUpdateComponents(clearImageInContentCards(components));
  };

  const handleClearLeftColumnImage = (componentId: string) => {
    const clearLeftColumnImage = (comps: EmailComponent[]): EmailComponent[] =>
      comps.map(comp =>
        comp.id === componentId && comp.type === 'two-columns-card'
          ? { ...comp, props: { ...comp.props, leftColumnSrc: '', leftColumnAlt: '' } }
          : comp.children
          ? { ...comp, children: clearLeftColumnImage(comp.children) }
          : comp
      );
    onUpdateComponents(clearLeftColumnImage(components));
  };

  const handleClearRightColumnImage = (componentId: string) => {
    const clearRightColumnImage = (comps: EmailComponent[]): EmailComponent[] =>
      comps.map(comp =>
        comp.id === componentId && comp.type === 'two-columns-card'
          ? { ...comp, props: { ...comp.props, rightColumnSrc: '', rightColumnAlt: '' } }
          : comp.children
          ? { ...comp, children: clearRightColumnImage(comp.children) }
          : comp
      );
    onUpdateComponents(clearRightColumnImage(components));
  };

  // Set isDragging true on drag start (palette/component)
  useEffect(() => {
    const handlePaletteDragStart = () => setIsDragging(true);
    window.addEventListener('palette-drag-start', handlePaletteDragStart);
    return () => window.removeEventListener('palette-drag-start', handlePaletteDragStart);
  }, []);

  // Set isDragging false on drag end/leave/drop
  useEffect(() => {
    const handleDragEnd = () => {
      setIsDragging(false);
      setIsDraggingFromPalette(false);
      setActiveDropZone(null);
    };
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('dragover', handleDragEnd); // Prevent default dragover to stop drag preview
    window.addEventListener('dragleave', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('dragover', handleDragEnd);
      window.removeEventListener('dragleave', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  // Only render drop zones when isDragging or isDraggingFromPalette is true
  const renderDropZone = (index: number) => {
    if (!(isDragging || isDraggingFromPalette)) return null;
    const isActive = activeDropZone === index;
    return (
      <div
        key={`drop-zone-${index}`}
        className={
          isActive
            ? 'h-8 transition-all duration-200 rounded-lg bg-blue-100 border-2 border-blue-400 border-dashed'
            : 'h-0'
        }
        style={{
          minHeight: isActive ? '32px' : '0',
          margin: isActive ? '8px 0' : '0',
          border: isActive ? undefined : 'none',
          background: isActive ? undefined : 'none',
          transition: 'all 0.2s',
          pointerEvents: isActive ? 'auto' : 'none',
        }}
        onDragOver={(e) => handleDropZoneDragOver(e, index)}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={(e) => handleDropZoneDrop(e, index)}
      />
    );
  };

  const renderComponent = (component: EmailComponent, index: number, isNested = false) => (
    <div key={component.id} className="relative">
      <div
        data-component-id={component.id}
        className={`relative group ${selectedComponent?.id === component.id ? 'ring-2 ring-blue-500' : ''} ${isNested ? 'ml-2' : ''} hover:shadow-md transition-all duration-200 ${draggedComponentId === component.id ? 'opacity-70' : ''} ${draggedOver === component.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(component);
        }}
        draggable
        onDragStart={(e) => handleComponentDragStart(e, component.id)}
        onDrag={handleComponentDrag}
        onDragEnd={handleComponentDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDraggedOver(component.id);
          onDragOver(e);
        }}
        onDragLeave={() => setDraggedOver(null)}
        onDrop={(e) => handleDrop(e, component.id)}
        style={{ cursor: draggedComponentId ? 'grabbing' : 'move' }}
      >
        {component.type === 'banner' ? (
          <div style={{ width: '580px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto', overflow: 'visible' }}>
            <div className={`relative`} style={{ width: '100%', height: 'auto', minHeight: '90px', borderRadius: '0px', display: 'block', position: 'relative', marginTop: 0, marginBottom: 0, padding: 0, overflow: 'visible' }}>
              <EmailComponentRenderer component={component} />
              {selectedComponent?.id === component.id && (
                <div className="absolute top-2 right-1 flex space-x-3 z-30">
                  <button
                    onClick={(e) => {
                    e.stopPropagation();
                      handleDeleteComponent(component.id);
                    }}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colours hover:scale-110"
                    title="Delete component"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                    e.stopPropagation();
                      handleDuplicateComponent(component);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colours hover:scale-110"
                    title="Duplicate component"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                </div>
              )}
            </div>
          </div>
        ) : component.type === 'content-card' ? (
          <div className="rounded-lg"
               style={{ margin: '4px 0', width: '560px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <EmailComponentRenderer component={component} onClearContentCardImage={handleClearContentCardImage} />
            </div>
          </div>
        ) : component.type === 'two-columns-card' ? (
          <div className="rounded-lg"
               style={{ margin: '4px 0', width: '560px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <EmailComponentRenderer 
                component={component} 
                onClearLeftColumnImage={handleClearLeftColumnImage}
                onClearRightColumnImage={handleClearRightColumnImage}
              />
            </div>
          </div>
        ) : (
          <div style={{ width: '560px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <EmailComponentRenderer key={component.id} component={component} />
          </div>
        )}
        
        {selectedComponent?.id === component.id && component.type !== 'banner' && (
          <div className={`absolute flex space-x-3 z-20 ${
            component.type === 'content-card' 
              ? 'top-1 right-2' 
              : 'top-1 right-2'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteComponent(component.id);
              }}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colours hover:scale-110"
              title="Delete component"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateComponent(component);
              }}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colours hover:scale-110"
              title="Duplicate component"
            >
              <Copy className="w-4 h-4" />
            </button>

          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
              <div className={`flex-1 bg-grey-50 p-[1.2rem] pb-8 overflow-auto email-builder-canvas ${className || ''}`}>
                  <div className="w-full max-w-[672px] mx-auto email-builder-canvas-container">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-grey-800">Preview</h2>
          </div>
          
          <div
            className={`min-h-96 bg-white border-2 border-dashed rounded-lg p-4 m-1 transition-all duration-200 ${
              draggedOver === 'canvas' ? 'border-blue-400 bg-blue-50' : 'border-grey-300'
            }`}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e)}
          >
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Move className="w-16 h-16 text-grey-300 mb-4" />
                <p className="text-grey-500 text-lg font-medium">Drag components here to start building your email</p>
                <p className="text-grey-400 text-sm mt-2">Choose from text, images, buttons and more</p>
              </div>
            ) : (
              <div className="space-y-2 pb-80">
                {/* Render drop zones and components interleaved */}
                {renderDropZone(0)} {/* Drop zone before first component */}
                {components.map((component, index) => (
                  <React.Fragment key={component.id}>
                    {renderComponent(component, index)}
                    {index < components.length - 1 && renderDropZone(index + 1)} {/* Drop zone between components */}
                  </React.Fragment>
                ))}
                {renderDropZone(components.length)} {/* Drop zone after last component */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag Preview */}
      {dragPreview && (
        <div
          className="fixed pointer-events-none z-50 bg-white border border-grey-300 rounded-lg p-2 shadow-lg opacity-75"
          style={{
            left: dragPreview.x + 10,
            top: dragPreview.y + 10,
            transform: 'translate(0, 0)'
          }}
        >
          <div className="text-xs text-grey-600 capitalize">
            Moving: {dragPreview.component.type}
          </div>
        </div>
      )}
    </>
  );
};

export default Canvas;