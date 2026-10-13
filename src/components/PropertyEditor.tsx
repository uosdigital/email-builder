import React, { useState, useEffect } from 'react';
import { EmailComponent } from '../types/email';
import { Settings } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

interface PropertyEditorProps {
  selectedComponent: EmailComponent | null;
  onUpdateComponent: (component: EmailComponent) => void;
  globalStyles: {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    color: string;
  };
  onUpdateGlobalStyles: (styles: {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    color: string;
  }) => void;
}

// Register custom fonts with proper names
const Font = Quill.import('formats/font');
Font.whitelist = ['source-sans-3', 'source-serif-4-pro'];
Quill.register(Font, true);

// Add custom styles for Quill editor
if (typeof window !== 'undefined' && !document.getElementById('quill-custom-styles')) {
  const style = document.createElement('style');
  style.id = 'quill-custom-styles';
  style.innerHTML = `
    .ql-editor {
      font-size: 16px !important;
      color: #333333 !important;
    }
    .ql-editor.ql-blank::before {
      font-size: 16px !important;
      color: #9ca3af !important;
      font-style: normal !important;
    }
    .ql-editor p {
      font-size: 16px !important;
      color: #333333 !important;
    }
    .ql-editor.ql-blank::before {
      content: attr(data-placeholder);
    }
  `;
  document.head.appendChild(style);
}

// Custom hook to ensure Quill tooltip is visible
function useQuillTooltipVisibility() {
  useEffect(() => {
    const handleTooltipShow = () => {
      const tooltip = document.querySelector('.ql-tooltip') as HTMLElement;
      if (tooltip) {
        // Force the tooltip to be positioned correctly
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '9999';
        tooltip.style.overflow = 'visible';
        tooltip.style.maxWidth = 'none';
        tooltip.style.whiteSpace = 'nowrap';

        // Try to get the selected text position from Quill
        const quillEditor = document.querySelector('.ql-editor') as HTMLElement;
        if (quillEditor) {
          // Get the current selection range
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Position tooltip near the selected text
            let left = rect.left;
            let top = rect.bottom + 5;

            // If no selection rect (collapsed selection), use cursor position
            if (rect.width === 0 && rect.height === 0) {
              const editorRect = quillEditor.getBoundingClientRect();
              left = editorRect.left;
              top = editorRect.top + 30; // Position below the first line
            }

            // Calculate position to ensure tooltip is fully visible
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Ensure tooltip doesn't overflow right edge
            if (left + tooltipRect.width > viewportWidth - 20) {
              left = viewportWidth - tooltipRect.width - 20;
            }

            // Ensure tooltip doesn't overflow left edge
            if (left < 20) {
              left = 20;
            }

            // Ensure tooltip doesn't overflow bottom edge
            if (top + tooltipRect.height > viewportHeight - 20) {
              top = rect.top - tooltipRect.height - 5; // Position above the text
            }

            // Ensure tooltip doesn't overflow top edge
            if (top < 20) {
              top = 20;
            }

            // Apply the calculated position
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
          }
        }
      }
    };

    // Check for tooltip periodically and when it appears
    const interval = setInterval(handleTooltipShow, 50);

    // Also listen for DOM changes to catch when tooltip appears
    const observer = new MutationObserver(handleTooltipShow);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({
  selectedComponent,
  onUpdateComponent,
  globalStyles,
  onUpdateGlobalStyles,
}: PropertyEditorProps) => {

  const colors = [
    { hex: '#440099', name: 'Purple' },
    { hex: '#24125E', name: 'Dark Purple' },
    { hex: '#7000FF', name: 'Violet' },
    { hex: '#A78CFA', name: 'Light Purple' },
    { hex: '#C6BBFF', name: 'Lavender' },
    { hex: '#F8F8F9', name: 'Light Grey' },
    { hex: '#131E29', name: 'Dark Grey' },
    { hex: '#E7004C', name: 'Red' },
    { hex: '#981F92', name: 'Purple Pink' },
    { hex: '#005A8F', name: 'Blue' },
    { hex: '#005750', name: 'Dark Green' },
    { hex: '#FF6371', name: 'Coral' },
    { hex: '#FF79E1', name: 'Pink' },
    { hex: '#00BBCC', name: 'Cyan' },
    { hex: '#3BD4AE', name: 'Mint' },
    { hex: '#FF9664', name: 'Orange' },
    { hex: '#DAA8E2', name: 'Lavender Pink' },
    { hex: '#9ADBE8', name: 'Light Cyan' },
    { hex: '#A1DED2', name: 'Light Mint' }
  ];

  const [selectedColumn, setSelectedColumn] = useState<'left' | 'right'>('left');

  // Ensure Quill tooltip is visible
  useQuillTooltipVisibility();

  const handlePropertyChange = (property: string, value: string | number) => {
    if (selectedComponent) {
      const updatedComponent: EmailComponent = {
        ...selectedComponent,
        props: {
          ...selectedComponent.props,
          [property]: value,
        },
      };
      onUpdateComponent(updatedComponent);
    }
  };


  // Function to find and update a child component
  const handleChildComponentUpdate = (childId: string, property: string, value: string | number) => {
    if (!selectedComponent) return;

    // Handle two-columns card button updates
    if (selectedComponent.type === 'two-columns-card') {
      const column = selectedColumn || 'left';
      const childrenArray = column === 'left' ? selectedComponent.leftChildren : selectedComponent.rightChildren;

      if (!childrenArray) return;

      const updateChild = (children: EmailComponent[]): EmailComponent[] => {
        return children.map(child => {
          if (child.id === childId) {
            return {
              ...child,
              props: {
                ...child.props,
                [property]: value,
              },
            };
          }
          if (child.children) {
            return {
              ...child,
              children: updateChild(child.children),
            };
          }
          return child;
        });
      };

      const updatedComponent: EmailComponent = {
        ...selectedComponent,
        [column === 'left' ? 'leftChildren' : 'rightChildren']: updateChild(childrenArray),
      };
      onUpdateComponent(updatedComponent);
      return;
    }

    // Handle regular children updates (for content-card, etc.)
    if (!selectedComponent.children) return;

    const updateChild = (children: EmailComponent[]): EmailComponent[] => {
      return children.map(child => {
        if (child.id === childId) {
          return {
            ...child,
            props: {
              ...child.props,
              [property]: value,
            },
          };
        }
        if (child.children) {
          return {
            ...child,
            children: updateChild(child.children),
          };
        }
        return child;
      });
    };

    const updatedComponent: EmailComponent = {
      ...selectedComponent,
      children: updateChild(selectedComponent.children),
    };
    onUpdateComponent(updatedComponent);
  };

  // Function to remove a button from the selected column
  const handleRemoveButton = (buttonId: string) => {
    if (!selectedComponent) return;

    if (selectedComponent.type === 'content-card') {
      const updatedComponent: EmailComponent = {
        ...selectedComponent,
        children: selectedComponent.children?.filter(child => child.id !== buttonId) || [],
      };
      onUpdateComponent(updatedComponent);
    } else if (selectedComponent.type === 'two-columns-card') {
      const column = selectedColumn || 'left';
      const updatedComponent: EmailComponent = {
        ...selectedComponent,
        [column === 'left' ? 'leftChildren' : 'rightChildren']:
          (column === 'left' ? selectedComponent.leftChildren : selectedComponent.rightChildren)?.filter(child => child.id !== buttonId) || [],
      };
      onUpdateComponent(updatedComponent);
    }
  };

  return (
    <div className="h-full overflow-y-auto min-h-0 border-l border-grey-200" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
      <div className="p-4 pb-20 space-y-8">
        {!selectedComponent ? (
          <div className="text-center py-8 ">
            <Settings className="w-12 h-12 text-grey-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-grey-700 mb-2">Properties</h2>
            <p className="text-grey-500 text-sm p-1">Select a component to edit its properties</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-grey-800 mb-2">Properties</h2>
              <div className="text-base text-grey-600">Editing: <span className="font-medium capitalize">{selectedComponent.type}</span></div>
            </div>
            <div className="space-y-8">
              {/* --- Content Section --- */}
              {(selectedComponent.type === 'text' || selectedComponent.type === 'title' || selectedComponent.type === 'button' || selectedComponent.type === 'footer' || selectedComponent.type === 'content-card' || selectedComponent.type === 'two-columns-card') && (
                <section>
                  <h4 className="text-xl font-semibold text-grey-700 mb-4">Content</h4>
                  {selectedComponent.type === 'text' && (
                    <>
                      <div style={{ position: 'relative', overflow: 'visible', zIndex: 100 }}>
                        <ReactQuill
                          key={`text-editor-${selectedComponent.id}`}
                          value={selectedComponent.props.content || ''}
                          onChange={(value: string) => handlePropertyChange('content', value)}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                              ['link'],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link']}
                          className="mb-4"
                          data-placeholder="Enter your text here..."
                          style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                        />
                      </div>

                      {/* Font Size Control */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Font Size</label>
                        <input
                          type="range"
                          min="10"
                          max="36"
                          value={selectedComponent.props.fontSize || 16}
                          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                          className="w-full mb-2"
                        />
                        <span className="text-sm text-grey-500">{selectedComponent.props.fontSize || 16}px</span>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Text Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colors.map((color: { hex: string; name: string }) => (
                            <div key={color.hex} className="relative group">
                              <button
                                onClick={() => handlePropertyChange('color', color.hex)}
                                className={`w-12 h-8 rounded-md border-2 transition-all duration-200 ${selectedComponent.props.color === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                                  }`}
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {color.hex}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedComponent.type === 'title' && (
                    <>
                      <input
                        type="text"
                        value={selectedComponent.props.content || ''}
                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md mb-2"
                        placeholder="Title text"
                        style={{ fontFamily: 'Georgia, serif' }}
                      />
                      <div className="mb-2">
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Heading Level</label>
                        <select
                          value={selectedComponent.props.headingLevel || 'h1'}
                          onChange={(e) => handlePropertyChange('headingLevel', e.target.value)}
                          className="w-full px-3 py-2 border border-grey-300 rounded-md"
                        >
                          <option value="h1">H1</option>
                          <option value="h2">H2</option>
                          <option value="h3">H3</option>
                        </select>
                      </div>

                      {/* Font Size Control for Title */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Font Size</label>
                        <input
                          type="range"
                          min="16"
                          max="48"
                          value={selectedComponent.props.fontSize || 24}
                          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                          className="w-full mb-2"
                        />
                        <span className="text-sm text-grey-500">{selectedComponent.props.fontSize || 24}px</span>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Text Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colors.map((color: { hex: string; name: string }) => (
                            <div key={color.hex} className="relative group">
                              <button
                                onClick={() => handlePropertyChange('color', color.hex)}
                                className={`w-12 h-8 rounded-md border-2 transition-all duration-200 ${selectedComponent.props.color === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                                  }`}
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {color.hex}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedComponent.type === 'button' && (
                    <>
                      <input
                        type="text"
                        value={selectedComponent.props.content || ''}
                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md mb-2"
                        placeholder="Button text"
                      />
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Button Position</label>
                        <select
                          value={selectedComponent.props.buttonPosition || 'center'}
                          onChange={(e) => handlePropertyChange('buttonPosition', e.target.value)}
                          className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </>
                  )}
                  {selectedComponent.type === 'footer' && (
                    <>
                      <input
                        type="text"
                        value={selectedComponent.props.content || ''}
                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md"
                        placeholder="Footer content"
                      />
                      <div>
                        <label className="block text-sm font-semibold text-grey-700 mb-2">Text Color</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {colors.map((color: { hex: string; name: string }) => (
                            <div key={color.hex} className="relative group">
                              <button
                                onClick={() => handlePropertyChange('color', color.hex)}
                                className={`w-12 h-8 rounded-md border-2 transition-all duration-200 ${selectedComponent.props.color === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                                  }`}
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {color.hex}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedComponent.type === 'content-card' && (
                    <>
                      <input
                        type="text"
                        value={selectedComponent.props.title || ''}
                        onChange={(e) => handlePropertyChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md mb-2"
                        placeholder="Add title..."
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}
                      />
                      <textarea
                        value={selectedComponent.props.content || ''}
                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md"
                        rows={3}
                        placeholder="Add content..."
                        style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                      />
                    </>
                  )}
                  {selectedComponent.type === 'two-columns-card' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-grey-600 mb-1">Left Title</label>
                          <input
                            type="text"
                            value={selectedComponent.props.leftColumnTitle || ''}
                            onChange={(e) => handlePropertyChange('leftColumnTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                            placeholder="Add title..."
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-grey-600 mb-1">Right Title</label>
                          <input
                            type="text"
                            value={selectedComponent.props.rightColumnTitle || ''}
                            onChange={(e) => handlePropertyChange('rightColumnTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                            placeholder="Add title..."
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-grey-600 mb-1">Left Content</label>
                          <div style={{ position: 'relative', overflow: 'visible', zIndex: 100 }}>
                            <ReactQuill
                              key={`left-content-editor-${selectedComponent.id}`}
                              value={selectedComponent.props.leftColumnContent || ''}
                              onChange={(value: string) => handlePropertyChange('leftColumnContent', value)}
                              modules={{
                                toolbar: [
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                  ['link'],
                                  ['clean']
                                ]
                              }}
                              formats={['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link']}
                              className="mb-4 text-grey-400"
                              data-placeholder="Add content..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-grey-600 mb-1">Right Content</label>
                          <div style={{ position: 'relative', overflow: 'visible', zIndex: 100 }}>
                            <ReactQuill
                              key={`right-content-editor-${selectedComponent.id}`}
                              value={selectedComponent.props.rightColumnContent || ''}
                              onChange={(value: string) => handlePropertyChange('rightColumnContent', value)}
                              modules={{
                                toolbar: [
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                  ['link'],
                                  ['clean']
                                ]
                              }}
                              formats={['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link']}
                              className="mb-4 text-grey-400"
                              data-placeholder="Add content..."
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* --- Actions Section (for buttons) --- */}
              {selectedComponent.type === 'button' && (
                <section>
                  <h4 className="text-xl font-semibold text-grey-700 mb-4">Actions</h4>
                  <input
                    type="url"
                    value={selectedComponent.props.href || ''}
                    onChange={(e) => handlePropertyChange('href', e.target.value)}
                    className="w-full px-4 py-3 border border-grey-300 rounded-md text-base"
                    placeholder="Button link (URL)"
                  />
                  <div className="mb-4 mt-4">
                    <label className="block text-base font-semibold text-grey-700 mb-3">Background Color</label>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {colors.map((color: { hex: string; name: string }) => (
                        <div key={color.hex} className="relative group">
                          <button
                            onClick={() => handlePropertyChange('backgroundColor', color.hex)}
                            className={`w-12 h-10 rounded-md border-2 transition-all duration-200 ${selectedComponent.props.backgroundColor === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                              }`}
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {color.hex}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-base font-semibold text-grey-700 mb-3">Text Color</label>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {colors.map((color: { hex: string; name: string }) => (
                        <div key={color.hex} className="relative group">
                          <button
                            onClick={() => handlePropertyChange('color', color.hex)}
                            className={`w-12 h-10 rounded-md border-2 transition-all duration-200 ${selectedComponent.props.color === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                              }`}
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {color.hex}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Unified Button Settings Editor */}
              {(selectedComponent.type === 'content-card' || selectedComponent.type === 'two-columns-card') && (
                <section className="relative">
                  <h4 className="text-xl font-semibold text-grey-700 mb-4">Button Settings</h4>
                  {/* Column selector for two-columns card */}
                  {selectedComponent.type === 'two-columns-card' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-grey-600 mb-2">Select Column</label>
                      <select
                        value={selectedColumn || 'left'}
                        onChange={(e) => setSelectedColumn(e.target.value as 'left' | 'right')}
                        className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                      >
                        <option value="left">Left Column</option>
                        <option value="right">Right Column</option>
                      </select>
                    </div>
                  )}
                  {/* Button list scrollable */}
                  <div style={{ paddingRight: 8 }}>
                    {(() => {
                      let buttons: EmailComponent[] = [];
                      if (selectedComponent.type === 'content-card') {
                        buttons = selectedComponent.children?.filter(child => child.type === 'button') || [];
                      } else if (selectedComponent.type === 'two-columns-card') {
                        const column = selectedColumn || 'left';
                        buttons = column === 'left'
                          ? (selectedComponent.leftChildren?.filter(child => child.type === 'button') || [])
                          : (selectedComponent.rightChildren?.filter(child => child.type === 'button') || []);
                      }
                      if (buttons.length === 0) {
                        return (
                          <div className="text-sm text-grey-300 pr-3 bg-grey-50 rounded p-3">
                            {selectedComponent.type === 'content-card'
                              ? 'No buttons in content card'
                              : `No buttons in ${selectedColumn || 'left'} column`
                            }
                          </div>
                        );
                      }
                      return buttons.map((button, index) => (
                        <div key={button.id} className="space-y-3 p-3 bg-grey-50 rounded-lg mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-grey-600">Button {index + 1}</span>
                            <button
                              onClick={() => handleRemoveButton(button.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-600 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={button.props.content || ''}
                              onChange={(e) => handleChildComponentUpdate(button.id, 'content', e.target.value)}
                              className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                              placeholder="Button text"
                              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-600 mb-1">Button Link</label>
                            <input
                              type="url"
                              value={button.props.href || ''}
                              onChange={(e) => handleChildComponentUpdate(button.id, 'href', e.target.value)}
                              className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                              placeholder="https://example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-600 mb-1">Button Position</label>
                            <select
                              value={button.props.buttonPosition || 'center'}
                              onChange={(e) => handleChildComponentUpdate(button.id, 'buttonPosition', e.target.value)}
                              className="w-full px-3 py-2 border border-grey-300 rounded-md text-sm"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-600 mb-1">Background Color</label>
                            <div className="grid grid-cols-4 gap-2">
                              {colors.map((color: { hex: string; name: string }) => (
                                <div key={color.hex} className="relative group">
                                  <button
                                    onClick={() => handleChildComponentUpdate(button.id, 'backgroundColor', color.hex)}
                                    className={`w-12 h-8 rounded border-2 transition-all duration-200 ${button.props.backgroundColor === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                                      }`}
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {color.hex}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-600 mb-1">Text Color</label>
                            <div className="grid grid-cols-4 gap-2">
                              {colors.map((color: { hex: string; name: string }) => (
                                <div key={color.hex} className="relative group">
                                  <button
                                    onClick={() => handleChildComponentUpdate(button.id, 'color', color.hex)}
                                    className={`w-12 h-8 rounded border-2 transition-all duration-200 ${button.props.color === color.hex ? 'border-blue-500 scale-110' : 'border-grey-300 hover:border-grey-400'
                                      }`}
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {color.hex}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              )}

              {/* --- Spacer Component Section --- */}
              {selectedComponent.type === 'spacer' && (
                <section>
                  <h4 className="text-xl font-semibold text-grey-700 mb-4">Spacing</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-grey-700 mb-2">Spacer Height</label>
                    <div className="flex space-x-2">
                      {[12, 16, 20].map((spacing) => (
                        <button
                          key={spacing}
                          onClick={() => handlePropertyChange('height', `${spacing}px`)}
                          className={`px-3 py-2 rounded-md border transition-colours ${selectedComponent.props.height === `${spacing}px`
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-grey-700 border-grey-300 hover:bg-grey-50'
                            }`}
                        >
                          {spacing}px
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-grey-500 mt-2">Controls the vertical spacing between components</p>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyEditor;