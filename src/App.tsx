import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ComponentPalette from './components/ComponentPalette';
import Canvas from './components/Canvas';
import PropertyEditor from './components/PropertyEditor';
import { EmailComponent } from './types/email';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import Dashboard from './components/Dashboard';
import { api } from './lib/api';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<EmailComponent | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [draggedData, setDraggedData] = useState<any>(null);
  const [history, setHistory] = useState<EmailComponent[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [globalStyles, setGlobalStyles] = useState({
    backgroundColor: '#f3f4f6',
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Arial, sans-serif',
  });

  // Auth & Dashboard State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('Untitled Design');

  // Save dialog & toast state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { user } = useAuth();

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Auto-save functionality
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedComponents, setLastSavedComponents] = useState<string>('');

  useEffect(() => {
    // Only auto-save if user is logged in and we have a template ID
    if (!user || !currentTemplateId) {
      return;
    }

    const currentComponentsStr = JSON.stringify(components);

    // Check if components have actually changed
    if (currentComponentsStr === lastSavedComponents) {
      return;
    }

    // Mark as unsaved
    setAutoSaveStatus('unsaved');

    // Debounce auto-save by 2 seconds
    const autoSaveTimer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await api.updateTemplate(currentTemplateId, templateName, components);
        setLastSavedComponents(currentComponentsStr);
        setAutoSaveStatus('saved');
        // Show brief success indicator
        setTimeout(() => {
          if (autoSaveStatus === 'saved') {
            setAutoSaveStatus('saved');
          }
        }, 1000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('unsaved');
        setToast({ type: 'error', message: 'Auto-save failed. Please save manually.' });
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [components, user, currentTemplateId, templateName, lastSavedComponents]);


  // Sidebar resizing state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(250);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      if (newWidth > 160 && newWidth < 400) {
        setLeftSidebarWidth(newWidth);
        document.body.style.cursor = 'col-resize';
      }
    }
    if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 600) {
        setRightSidebarWidth(newWidth);
        document.body.style.cursor = 'col-resize';
      }
    }
  }, [isResizingLeft, isResizingRight]);

  // Keyboard event handling for Delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Delete or Backspace key is pressed and a component is selected
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedComponent) {
        // Prevent default behavior only if we're not in an input field
        const target = event.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true';

        if (!isInputField) {
          event.preventDefault();
          handleDeleteSelectedComponent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);

  const handleDeleteSelectedComponent = () => {
    if (!selectedComponent) return;

    const deleteFromComponents = (comps: EmailComponent[]): EmailComponent[] => {
      return comps.filter(comp => {
        if (comp.id === selectedComponent.id) {
          return false;
        }
        if (comp.children) {
          comp.children = deleteFromComponents(comp.children);
        }
        return true;
      });
    };

    const updatedComponents = deleteFromComponents(components);
    handleUpdateComponents(updatedComponents);
    setSelectedComponent(null);
  };

  const addToHistory = useCallback((newComponents: EmailComponent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newComponents]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUpdateComponents = useCallback((newComponents: EmailComponent[]) => {
    console.log('[App] handleUpdateComponents newComponents:', newComponents);
    setComponents(newComponents);
    addToHistory(newComponents);
  }, [addToHistory]);

  const handleDragStart = (type: string, data?: any) => {
    setDraggedComponentType(type);
    setDraggedData(data);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, containerId?: string, dropZoneIndex?: number) => {
    e.preventDefault();
    if (draggedComponentType) {
      const newComponent: EmailComponent = {
        id: `${draggedComponentType}-${Date.now()}`,
        type: draggedComponentType === 'uploaded-image' ? 'image' : draggedComponentType as any,
        props: getDefaultProps(draggedComponentType, draggedData),
      };

      if (containerId) {
        // Add to container
        const addToContainer = (comps: EmailComponent[]): EmailComponent[] => {
          return comps.map(comp => {
            if (comp.id === containerId) {
              return {
                ...comp,
                children: [...(comp.children || []), newComponent]
              };
            }
            if (comp.children) {
              return {
                ...comp,
                children: addToContainer(comp.children)
              };
            }
            return comp;
          });
        };
        const newComponents = addToContainer(components);
        handleUpdateComponents(newComponents);
      } else {
        // Add to main canvas at specific position
        const insertIndex = dropZoneIndex !== undefined ? Math.max(0, Math.min(components.length, dropZoneIndex)) : components.length;
        const newComponents = [
          ...components.slice(0, insertIndex),
          newComponent,
          ...components.slice(insertIndex)
        ];
        handleUpdateComponents(newComponents);
      }

      setDraggedComponentType(null);
      setDraggedData(null);
    }
  };

  const getDefaultProps = (type: string, data?: any) => {
    switch (type) {
      case 'text':
        return {
          content: 'Edit this text',
          fontSize: 16,
          fontWeight: 'normal' as const,
          color: '#333333',
          backgroundColor: 'transparent',
          padding: '8px 0',
        };
      case 'title':
        return {
          content: 'Edit this title',
          fontSize: 24,
          fontWeight: 'bold' as const,
          color: '#333333',
          backgroundColor: 'transparent',
          padding: '8px 0',
          headingLevel: 'h1' as const,
        };
      case 'image':
      case 'uploaded-image':
        return {
          src: data?.src || '',
          alt: data?.alt || 'Image',
          width: '100%',
          height: 'auto',
          borderRadius: '0px',
          backgroundColor: 'transparent',
        };
      case 'banner':
        return {
          src: data?.src || '',
          alt: data?.alt || 'Banner',
          width: '100%',
          height: 'auto',
          borderRadius: '0px',
          backgroundColor: 'transparent',
          isBanner: true,
        };
      case 'button':
        return {
          content: 'Click Me',
          backgroundColor: '#440099',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'normal' as const,
          padding: '10px 20px',
          borderRadius: '4px',
          textAlign: 'left' as const,
          buttonSize: 'medium' as const,
        };
      case 'footer':
        return {
          content: '<p>© The University of Sheffield 2025</p><br><p>This email was sent by: The University of Sheffield<br>Western Bank, Sheffield, S10 2TN, GB<br>Privacy | Unsubscribe</p><br><p>If this email has reached you by mistake, please do not read, copy or use it or show it to anyone else, and then be kind enough to let us know. It is your responsibility to make sure this email is virus free. The University of Sheffield accepts no responsibility for any loss or damage in any way arising from its use.</p>',
          backgroundColor: 'transparent',
          color: '#666666',
          fontSize: 14,
          fontWeight: 'normal' as const,
          padding: '16px',
          textAlign: 'left' as const,
        };
      case 'content-card':
        return {
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          title: 'Your guide to Sheffield',
          content: 'Add your description here.',
          children: [{
            id: `button-${Date.now()}`,
            type: 'button' as const,
            props: {
              content: 'Learn More',
              backgroundColor: '#440099',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 'normal' as const,
              padding: '8px 16px',
              borderRadius: '4px',
              textAlign: 'left' as const,
              buttonSize: 'small' as const,
            }
          }]
        };
      case 'two-columns-card':
        return {
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          title: 'Your guide to Sheffield',
          content: 'Add your description here.',
          leftColumnTitle: '',
          leftColumnContent: '',
          leftColumnSrc: '',
          leftColumnAlt: '',
          rightColumnTitle: '',
          rightColumnContent: '',
          rightColumnSrc: '',
          rightColumnAlt: '',
          leftChildren: [],
          rightChildren: []
        };
      case 'divider':
        return {
          color: '#e5e7eb',
          margin: '16px 0',
          backgroundColor: 'transparent',
        };
      case 'spacer':
        return {
          height: '20px',
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const handleUpdateComponent = (updatedComponent: EmailComponent) => {
    const updateInComponents = (comps: EmailComponent[]): EmailComponent[] => {
      return comps.map(comp => {
        if (comp.id === updatedComponent.id) {
          // Merge props and children instead of replacing the whole object
          return {
            ...comp,
            ...updatedComponent,
            props: { ...comp.props, ...updatedComponent.props },
            children: updatedComponent.children !== undefined ? updatedComponent.children : comp.children,
            leftChildren: updatedComponent.leftChildren !== undefined ? updatedComponent.leftChildren : comp.leftChildren,
            rightChildren: updatedComponent.rightChildren !== undefined ? updatedComponent.rightChildren : comp.rightChildren,
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateInComponents(comp.children)
          };
        }
        return comp;
      });
    };

    const newComponents = updateInComponents(components);
    handleUpdateComponents(newComponents);
    setSelectedComponent(updatedComponent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
      setSelectedComponent(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
      setSelectedComponent(null);
    }
  };


  const generateEmailHTML = (components: EmailComponent[], globalStyles: { backgroundColor: string; fontSize: number; color: string }) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;700&family=Source+Serif+4+Pro:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: inherit; /* Inherit from parent */
      font-size: ${globalStyles.fontSize}px;
      color: ${globalStyles.color};
      background-color: ${globalStyles.backgroundColor};
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
    }
    .two-columns-container {
      display: flex;
      gap: 20px;
      margin-bottom: 0px;
    }
    .two-columns-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-radius: 0px;
      padding: 0px;
      background-color: #f8f9f9;
      margin-bottom: 0px;
    }
    @media (max-width: 768px) {
      .two-columns-container {
        flex-direction: column;
      }
      .two-columns-column {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Email content will be rendered by EmailJS -->
  </div>
</body>
</html>`;
  };

  const openSaveDialog = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!templateName.trim()) {
      setToast({ type: 'error', message: 'Please enter a name for your design.' });
      return;
    }

    setIsSaving(true);
    try {
      if (currentTemplateId) {
        await api.updateTemplate(currentTemplateId, templateName.trim(), components);
      } else {
        const newTemplate = await api.createTemplate(templateName.trim(), components);
        setCurrentTemplateId(newTemplate.id);
      }
      setLastSavedComponents(JSON.stringify(components));
      setAutoSaveStatus('saved');
      setIsSaveDialogOpen(false);
      setToast({ type: 'success', message: 'Design saved successfully.' });
    } catch (error) {
      console.error('Error saving:', error);
      setToast({ type: 'error', message: 'Failed to save design. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (template: any) => {
    setComponents(template.content);
    setCurrentTemplateId(template.id);
    setTemplateName(template.name);
    setShowDashboard(false);
  };

  const handleNewTemplate = () => {
    setComponents([]);
    setCurrentTemplateId(null);
    setTemplateName('Untitled Design');
    setShowDashboard(false);
  };

  return (
    <div className="h-screen flex flex-col bg-grey-50">
      <Header
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        components={components}
        globalStyles={globalStyles}
        generateEmailHTML={generateEmailHTML}
        onSave={openSaveDialog}
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
        onSignIn={() => setShowAuthModal(true)}
        autoSaveStatus={autoSaveStatus}
      />

      {showDashboard ? (
        <Dashboard
          onLoadTemplate={handleLoadTemplate}
          onNewTemplate={handleNewTemplate}
          onBack={() => setShowDashboard(false)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div
            className="flex-shrink-0 overflow-y-auto sticky top-0 h-full bg-white"
            style={{ width: leftSidebarWidth }}
          >
            <ComponentPalette onDragStart={handleDragStart} />
          </div>

          {/* Left Resize Handle */}
          <div
            className="w-4 hover:w-4 flex justify-center cursor-col-resize z-10 hover:bg-blue-50 transition-colors group relative -ml-2"
            onMouseDown={startResizingLeft}
          >
            <div className="w-px h-full bg-grey-200 group-hover:bg-blue-400 transition-colors" />
          </div>

          <div className="flex-1 min-w-0 flex justify-center overflow-y-auto bg-grey-50">
            <div className="w-full max-w-[800px] py-8">
              <Canvas
                components={components}
                onUpdateComponents={handleUpdateComponents}
                onSelectComponent={setSelectedComponent}
                selectedComponent={selectedComponent}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            </div>
          </div>

          {/* Right Resize Handle */}
          <div
            className="w-4 hover:w-4 flex justify-center cursor-col-resize z-10 hover:bg-blue-50 transition-colors group relative -mr-2"
            onMouseDown={startResizingRight}
          >
            <div className="w-px h-full bg-grey-200 group-hover:bg-blue-400 transition-colors" />
          </div>

          <div
            className="bg-white flex flex-col flex-shrink-0 transition-all duration-75 sticky top-0 h-full"
            style={{ width: rightSidebarWidth }}
          >
            <PropertyEditor
              selectedComponent={selectedComponent}
              onUpdateComponent={handleUpdateComponent}
              globalStyles={globalStyles}
              onUpdateGlobalStyles={setGlobalStyles}
            />
          </div>
        </div>
      )}

      {/* Save Design Modal */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-grey-900 mb-2">Save design</h2>
            <p className="text-sm text-grey-600 mb-4">
              Enter a name for your design so you can find it later.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-grey-700 mb-1">
                Design name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#440099] focus:border-transparent text-sm"
                placeholder="Untitled Design"
                autoFocus
                disabled={isSaving}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsSaveDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-grey-700 bg-grey-100 rounded-lg hover:bg-grey-200 transition-colours"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-2 text-sm font-medium text-white bg-[#440099] rounded-lg hover:bg-[#3a007f] transition-colours disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;