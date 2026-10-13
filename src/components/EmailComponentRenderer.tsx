import React from 'react';
import { EmailComponent } from '../types/email';

interface EmailComponentRendererProps {
  component: EmailComponent;
  isPreview?: boolean;
  isInContentCard?: boolean;
  onClearContentCardImage?: (componentId: string) => void;
  onClearLeftColumnImage?: (componentId: string) => void;
  onClearRightColumnImage?: (componentId: string) => void;
  isMobileView?: boolean; // <-- add this prop
}

const EmailComponentRenderer: React.FC<EmailComponentRendererProps> = ({ component, isPreview = false, isInContentCard = false, isMobileView = false }) => {
  const { type, props } = component;

  // All hooks must be called at the top level
  const [isDraggingButton, setIsDraggingButton] = React.useState(false);
  const [isDragOverBanner, setIsDragOverBanner] = React.useState(false);
  const [isDragOverContentCardImage, setIsDragOverContentCardImage] = React.useState(false);
  const [isDragOverLeftColumnImage, setIsDragOverLeftColumnImage] = React.useState(false);
  const [isDragOverRightColumnImage, setIsDragOverRightColumnImage] = React.useState(false);

  // Listen for global drag state changes
  React.useEffect(() => {
    const handleDragStart = () => {
      // Check if we're dragging a button from the palette
      const checkIfDraggingButton = () => {
        const isButtonDrag = document.body.getAttribute('data-dragging-button') === 'true';
        setIsDraggingButton(isButtonDrag);
      };

      // Small delay to ensure drag data is set
      setTimeout(checkIfDraggingButton, 10);
    };

    const handleDragEnd = () => {
      setIsDraggingButton(false);
      // Clean up any remaining drag states
      document.body.removeAttribute('data-dragging-button');
    };

    const handleDrop = () => {
      setIsDraggingButton(false);
      // Clean up any remaining drag states
      document.body.removeAttribute('data-dragging-button');
    };

    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const baseStyles = {
    fontSize: `${props.fontSize || 16}px`,
    fontFamily: props.fontFamily || 'Source Sans 3, sans-serif',
    fontWeight: props.fontWeight || 'normal',
    color: props.color || '#333333',
    backgroundColor: props.backgroundColor || 'transparent',
    padding: props.padding || '8px',
    margin: props.margin || '0',
    textAlign: props.textAlign || 'left',
    borderRadius: props.borderRadius || '0',
    width: props.width || 'auto',
    height: props.height || 'auto',
  } as React.CSSProperties;

  const getButtonSize = (size: string) => {
    switch (size) {
      case 'small':
        return { padding: '10px 20px' };
      case 'large':
        return { padding: '14px 28px' };
      default:
        return { padding: '12px 24px' };
    }
  };


  if (typeof window !== 'undefined' && !document.getElementById('quill-link-style')) {
    const style = document.createElement('style');
    style.id = 'quill-link-style';
    style.innerHTML = `
      .quill-rich-text-preview a { 
        color: #440099 !important; 
        text-decoration: underline !important; 
      }
      .ql-rich-text-preview a { 
        color: #440099 !important; 
        text-decoration: underline !important; 
      }
    `;
    document.head.appendChild(style);
  }

  switch (type) {
    case 'text': {
      // Render Quill HTML output as rich text, but show a plain text fallback if content is empty
      const isContentEmpty = !props.content || props.content === '<p><br></p>';
      return (
        <div style={{
          ...baseStyles,
          fontFamily: props.fontFamily || 'Source Sans 3, sans-serif', // Use component's font family
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          {isContentEmpty ? (
            <span style={{ color: '#888' }}> </span>
          ) : (
            <div
              className="ql-rich-text-preview"
              dangerouslySetInnerHTML={{ __html: props.content || '' }}
              style={{ fontFamily: props.fontFamily || 'Source Sans 3, sans-serif' }}
            />
          )}
        </div>
      );
    }

    case 'title': {
      // Normalize heading level to lowercase and trimmed
      const HeadingTagRaw = typeof props.headingLevel === 'string' ? props.headingLevel.trim().toLowerCase() : '';
      const validHeadings = ['h1', 'h2', 'h3'] as const;
      type HeadingTagType = typeof validHeadings[number];
      const HeadingTag: HeadingTagType = validHeadings.includes(HeadingTagRaw as HeadingTagType) ? HeadingTagRaw as HeadingTagType : 'h1';
      const headingFontSizes: Record<HeadingTagType, number> = { h1: 32, h2: 24, h3: 18 };
      const fontSize = headingFontSizes[HeadingTag];
      // Add a style tag for mobile font size override
      if (typeof window !== 'undefined' && !document.getElementById('heading-mobile-style')) {
        const style = document.createElement('style');
        style.id = 'heading-mobile-style';
        style.innerHTML = `
          @media (max-width: 640px) {
            h1.email-heading-h1 { font-size: 24px !important; }
            h2.email-heading-h2 { font-size: 18px !important; }
            h3.email-heading-h3 { font-size: 16px !important; }
          }
          .force-mobile h1.email-heading-h1 { font-size: 24px !important; }
          .force-mobile h2.email-heading-h2 { font-size: 18px !important; }
          .force-mobile h3.email-heading-h3 { font-size: 16px !important; }
        `;
        document.head.appendChild(style);
      }
      console.log('HeadingTag:', HeadingTag, 'fontSize:', fontSize);
      return (
        <div style={{
          ...baseStyles,
          fontFamily: 'Georgia, serif',
          color: props.color || '#333333',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          {React.createElement(
            HeadingTag as keyof JSX.IntrinsicElements,
            {
              className: `email-heading-${HeadingTag}`,
              style: {
                margin: 0,
                fontFamily: props.fontFamily || 'Source Serif 4 Pro, serif',
                fontWeight: 'bold',
                color: props.color || '#333333',
                ...(isMobileView ? {} : { fontSize: `${fontSize}px` }), // Only set fontSize inline if not mobile view
              }
            },
            props.content || 'Click to edit title'
          )}
        </div>
      );
    }

    case 'image':
      return (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          {props.src ? (
            <img
              src={props.src}
              alt={props.alt || 'Image'}
              style={{
                ...baseStyles,
                width: props.width || '600px',
                maxWidth: '100%',
                height: props.height || 'auto',
                borderRadius: props.borderRadius || '0px',
                display: 'block',
                marginLeft: '0px',
                marginRight: '0px',
              }}
            />
          ) : (
            <div
              style={{
                ...baseStyles,
                width: props.width || '600px',
                maxWidth: '100%',
                height: props.height || '200px',
                backgroundColor: '#f3f4f6',
                border: '2px dashed #d1d5db',
                borderRadius: props.borderRadius || '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '14px',
                marginLeft: '0px',
                marginRight: '0px',
              }}
            >
              No image selected
            </div>
          )}
        </div>
      );

    case 'banner': {
      // Banner: 580px width with auto height
      const bannerStyle: React.CSSProperties = {
        ...baseStyles,
        width: '580px',
        maxWidth: '100%',
        height: 'auto',
        minHeight: '90px',
        borderRadius: '0px',
        display: 'block',
        position: 'relative',
        marginTop: 0,
        marginBottom: 0,
        padding: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
      };

      const handleBannerDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverBanner(false);
        const uploadedImageData = e.dataTransfer.getData('application/json');
        let uploadedImage = null;
        try {
          if (uploadedImageData) {
            const parsed = JSON.parse(uploadedImageData);
            if (parsed && parsed.src) {
              uploadedImage = parsed;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
        if (uploadedImage) {
          // Update the banner component with the new image
          const updatedComponent = {
            ...component,
            props: {
              ...component.props,
              src: uploadedImage.src,
              alt: uploadedImage.alt || component.props.alt,
            },
          };
          window.dispatchEvent(new CustomEvent('banner-image-updated', {
            detail: { componentId: component.id, updatedComponent }
          }));
        }
      };

      // handleClearBannerImage is defined but not used in preview mode
      // Keeping it for potential future use

      return (
        <div style={bannerStyle}>
          {props.src ? (
            <img
              src={props.src}
              alt={props.alt || 'Banner'}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                border: 'none',
                borderRadius: '0px',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '90px',
                backgroundColor: '#f3f4f6',
                border: '2px dashed #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              <span style={{ textAlign: 'center', pointerEvents: 'none' }}>
                Drag an image from "Upload Images"
              </span>
            </div>
          )}
          {/* Drop zone overlay for banner */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              cursor: 'pointer',
              background: isDragOverBanner ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.01)',
              border: isDragOverBanner ? '2px dashed #3b82f6' : 'none',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverBanner(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverBanner(false);
            }}
            onDrop={handleBannerDrop}
          />
        </div>
      );
    }

    case 'button': {
      const buttonSizeStyles = getButtonSize(props.buttonSize || 'medium');
      const buttonPosition = props.buttonPosition || 'center';
      const handleButtonClick = () => {
        if (props.href) {
          window.open(props.href, '_blank', 'noopener,noreferrer');
        }
      };

      const getButtonContainerStyle = (): React.CSSProperties => {
        switch (buttonPosition) {
          case 'left':
            return {
              textAlign: 'left' as const,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: 'auto',
              padding: '0px',
              fontFamily: 'Source Sans 3, sans-serif'
            };
          case 'right':
            return {
              textAlign: 'right' as const,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: 'auto',
              padding: '0px',
              fontFamily: 'Source Sans 3, sans-serif'
            };
          default: // center
            return {
              textAlign: 'center' as const,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'auto',
              padding: '0px',
              fontFamily: 'Source Sans 3, sans-serif'
            };
        }
      };

      return (
        <div style={getButtonContainerStyle()}>
          <button
            style={{
              backgroundColor: props.backgroundColor || '#440099',
              color: props.color || '#ffffff',
              border: 'none',
              borderRadius: '0px',
              fontFamily: 'Source Sans 3, sans-serif',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              width: 'auto',
              minWidth: '120px',
              maxWidth: '250px',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              textAlign: 'center',
              lineHeight: '1.2',
              verticalAlign: 'middle',
              boxSizing: 'border-box',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              fontSize: isMobileView ? '14px' : (isInContentCard && !isMobileView ? '16px' : (props.fontSize || 16)),
              ...buttonSizeStyles,
            }}
            onClick={handleButtonClick}
          >
            {props.content || 'Click Me'}
          </button>
        </div>
      );
    }

    case 'footer':
      return (
        <div style={{
          ...baseStyles,
          backgroundColor: props.backgroundColor || 'transparent',
          color: props.color || '#666666',
          padding: props.padding || '16px',
          textAlign: props.textAlign || 'left',
          borderTop: '1px solid #e5e7eb',
          fontSize: isMobileView ? '12px' : '14px',
          fontFamily: props.fontFamily || 'Source Sans 3, sans-serif',
        }}>
          <div style={{ margin: 0 }}>
            {props.content ? (
              <div
                className="ql-rich-text-preview"
                dangerouslySetInnerHTML={{ __html: props.content }}
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              />
            ) : (
              <span style={{ color: '#888' }}>Footer content</span>
            )}
          </div>
        </div>
      );

    case 'content-card': {
      const handleContentCardImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverContentCardImage(false);
        const uploadedImageData = e.dataTransfer.getData('application/json');
        let uploadedImage = null;
        try {
          if (uploadedImageData) {
            const parsed = JSON.parse(uploadedImageData);
            if (parsed && parsed.src) {
              uploadedImage = parsed;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
        if (uploadedImage) {
          // Update the content card component with the new image
          const updatedComponent = {
            ...component,
            props: {
              ...component.props,
              src: uploadedImage.src,
              alt: uploadedImage.alt || component.props.alt,
            },
          };
          // Dispatch event to update the component
          window.dispatchEvent(new CustomEvent('content-card-image-updated', {
            detail: { componentId: component.id, updatedComponent }
          }));
        }
      };

      return (
        <div style={{
          ...baseStyles,
          backgroundColor: '#fff',
          padding: '0',
          borderRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          margin: '16px',
          marginLeft: '16px',
          marginRight: '16px',
        }}>
          {/* Image section */}
          {props.src ? (
            <div
              data-content-card-image-drop-area
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                minHeight: '0',
                maxHeight: 'none'
              }}
            >
              <img
                src={props.src}
                alt={props.alt || 'Card Image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '0px',
                }}
              />
              {/* Drop zone overlay for existing image */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                  cursor: 'pointer',
                  background: isDragOverContentCardImage ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.01)',
                  border: isDragOverContentCardImage ? '2px dashed #3b82f6' : 'none',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'auto',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverContentCardImage(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverContentCardImage(false);
                }}
                onDrop={handleContentCardImageDrop}
              />
            </div>
          ) : (
            <div
              data-content-card-image-drop-area
              style={{
                width: '100%',
                aspectRatio: '16/9',
                minHeight: '0',
                maxHeight: 'none',
                background: isDragOverContentCardImage ? 'rgba(59, 130, 246, 0.1)' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDragOverContentCardImage ? '2px dashed #3b82f6' : '2px dashed #bdbdbd',
                color: isDragOverContentCardImage ? '#3b82f6' : '#888',
                fontSize: '15px',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOverContentCardImage(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOverContentCardImage(false);
              }}
              onDrop={handleContentCardImageDrop}
            >
              <span>Drag an image from 'Upload Images' here.</span>
            </div>
          )}
          {/* Text content */}
          <div style={{ background: '#f3f3f3', padding: '24px 20px' }}>
            <p style={{
              color: '#333',
              fontSize: isMobileView ? '16px' : '20px',
              fontWeight: 600,
              margin: 0,
              marginBottom: '10px',
              fontFamily: 'Georgia, serif'
            }}>
              {props.title || 'Your guide to Sheffield'}
            </p>
            <p style={{
              color: '#333',
              fontSize: '16px',
              margin: 0,
              marginBottom: '10px',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              {props.content || 'Add your description here.'}
            </p>
            {/* Render children (e.g., button) left-aligned and fit-content */}
            {component.children && component.children.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                {component.children.map((child) => (
                  <EmailComponentRenderer key={child.id} component={child} isInContentCard={true} isMobileView={isMobileView} />
                ))}
              </div>
            )}
            {/* Content card button drop zone */}
            {isDraggingButton && (
              <div
                data-content-card-button-drop-area
                style={{
                  marginTop: '16px',
                  minHeight: '40px',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '2px dashed #d1d5db',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Only reset if we're actually leaving the drop zone area
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  const currentTarget = e.currentTarget as HTMLElement;
                  if (!currentTarget.contains(relatedTarget)) {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = '#d1d5db';

                  // Handle button drop to content card
                  const draggedComponentType = e.dataTransfer.getData('text/plain');
                  if (draggedComponentType === 'button') {
                    const newButton: EmailComponent = {
                      id: `button-${Date.now()}`,
                      type: 'button',
                      props: {
                        content: 'Click Me',
                        backgroundColor: '#440099',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 'normal',
                        padding: '8px 16px',
                        borderRadius: '0px',
                        textAlign: 'left',
                        buttonSize: 'small',
                        buttonPosition: 'center',
                      }
                    };

                    // Dispatch event to add button to content card
                    window.dispatchEvent(new CustomEvent('add-button-to-content-card', {
                      detail: { componentId: component.id, button: newButton }
                    }));
                  }
                }}
              >
                <span>Drop button here</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'two-columns-card': {
      const handleLeftColumnImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverLeftColumnImage(false);
        const uploadedImageData = e.dataTransfer.getData('application/json');
        let uploadedImage = null;
        try {
          if (uploadedImageData) {
            const parsed = JSON.parse(uploadedImageData);
            if (parsed && parsed.src) {
              uploadedImage = parsed;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
        if (uploadedImage) {
          // Update the two columns card component with the new left column image
          const updatedComponent = {
            ...component,
            props: {
              ...component.props,
              leftColumnSrc: uploadedImage.src,
              leftColumnAlt: uploadedImage.alt || component.props.leftColumnAlt,
            },
          };
          // Dispatch event to update the component
          window.dispatchEvent(new CustomEvent('two-columns-card-image-updated', {
            detail: { componentId: component.id, updatedComponent }
          }));
        }
      };

      const handleRightColumnImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRightColumnImage(false);
        const uploadedImageData = e.dataTransfer.getData('application/json');
        let uploadedImage = null;
        try {
          if (uploadedImageData) {
            const parsed = JSON.parse(uploadedImageData);
            if (parsed && parsed.src) {
              uploadedImage = parsed;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
        if (uploadedImage) {
          // Update the two columns card component with the new right column image
          const updatedComponent = {
            ...component,
            props: {
              ...component.props,
              rightColumnSrc: uploadedImage.src,
              rightColumnAlt: uploadedImage.alt || component.props.rightColumnAlt,
            },
          };
          // Dispatch event to update the component
          window.dispatchEvent(new CustomEvent('two-columns-card-image-updated', {
            detail: { componentId: component.id, updatedComponent }
          }));
        }
      };

      return (
        <div style={{
          ...baseStyles,
          backgroundColor: '#fff',
          padding: '0',
          borderRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          margin: '16px',
          marginLeft: '16px',
          marginRight: '16px',
        }}>
          {/* Two columns content */}
          <div style={{ background: 'transparent', padding: '0px' }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '0px',
              flexDirection: isMobileView ? 'column' : 'row'
            }}>
              {/* Left column */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0px',
                padding: '0px',
                backgroundColor: '#f3f3f3',
                marginBottom: '0px',
                width: isMobileView ? '100%' : 'auto'
              }}>
                {/* Left column image */}
                {props.leftColumnSrc ? (
                  <div style={{ position: 'relative', width: '100%', marginBottom: '12px', aspectRatio: '16/9', minHeight: '0' }}>
                    <img
                      src={props.leftColumnSrc}
                      alt={props.leftColumnAlt || 'Left Column Image'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '0px',
                      }}
                    />

                    {/* Drop zone overlay for existing left column image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10,
                        cursor: 'pointer',
                        background: isDragOverLeftColumnImage ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.01)',
                        border: isDragOverLeftColumnImage ? '2px dashed #3b82f6' : 'none',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'auto',
                        borderRadius: '0px',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOverLeftColumnImage(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOverLeftColumnImage(false);
                      }}
                      onDrop={handleLeftColumnImageDrop}
                    />
                  </div>
                ) : (
                  <div
                    data-left-column-image-drop-area
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      minHeight: '0',
                      background: isDragOverLeftColumnImage ? 'rgba(59, 130, 246, 0.1)' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isDragOverLeftColumnImage ? '2px dashed #3b82f6' : '2px dashed #bdbdbd',
                      color: isDragOverLeftColumnImage ? '#3b82f6' : '#888',
                      fontSize: '12px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      marginBottom: '12px',
                      borderRadius: '0px',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOverLeftColumnImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOverLeftColumnImage(false);
                    }}
                    onDrop={handleLeftColumnImageDrop}
                  >
                    <span>Drag image here</span>
                  </div>
                )}
                {/* Left column text content */}
                <div style={{ padding: '0px 16px', marginTop: '16px', marginBottom: '16px' }}>
                  <p style={{
                    color: '#333',
                    fontSize: isMobileView ? '16px' : '18px',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '8px',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {props.leftColumnTitle || 'Left Column Title'}
                  </p>
                  <div
                    className="ql-rich-text-preview"
                    dangerouslySetInnerHTML={{ __html: props.leftColumnContent || 'Add your left column description here.' }}
                    style={{
                      fontFamily: 'Source Sans 3, sans-serif',
                      color: '#333',
                      fontSize: '16px',
                      margin: 0,
                      marginBottom: '10px'
                    }}
                  />
                </div>
                {/* Render left column children (e.g., button) */}
                {component.leftChildren && component.leftChildren.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    padding: '0px 16px'
                  }}>
                    {component.leftChildren.map((child) => (
                      <EmailComponentRenderer key={child.id} component={child} isInContentCard={true} isMobileView={isMobileView} />
                    ))}
                  </div>
                )}
                {/* Left column button drop zone */}
                {isDraggingButton && (
                  <div
                    data-left-column-button-drop-area
                    style={{
                      marginTop: '16px',
                      marginBottom: '16px',
                      minHeight: '40px',
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '2px dashed #d1d5db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                      margin: '16px 16px 16px 16px',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only reset if we're actually leaving the drop zone area
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const currentTarget = e.currentTarget as HTMLElement;
                      if (!currentTarget.contains(relatedTarget)) {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                      e.currentTarget.style.borderColor = '#d1d5db';

                      // Handle button drop to left column
                      const draggedComponentType = e.dataTransfer.getData('text/plain');
                      if (draggedComponentType === 'button') {
                        const newButton: EmailComponent = {
                          id: `button-${Date.now()}`,
                          type: 'button',
                          props: {
                            content: 'Click Me',
                            backgroundColor: '#440099',
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: 'normal',
                            padding: '8px 16px',
                            borderRadius: '0px',
                            textAlign: 'left',
                            buttonSize: 'small',
                            buttonPosition: 'center',
                          }
                        };

                        // Dispatch event to add button to left column
                        window.dispatchEvent(new CustomEvent('add-button-to-left-column', {
                          detail: { componentId: component.id, button: newButton }
                        }));
                      }
                    }}
                  >
                    <span>Drop button here</span>
                  </div>
                )}
              </div>
              {/* Right column */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0px',
                padding: '0px',
                backgroundColor: '#f3f3f3',
                marginBottom: '0px',
                width: isMobileView ? '100%' : 'auto'
              }}>
                {/* Right column image */}
                {props.rightColumnSrc ? (
                  <div style={{ position: 'relative', width: '100%', marginBottom: '12px', aspectRatio: '16/9', minHeight: '0' }}>
                    <img
                      src={props.rightColumnSrc}
                      alt={props.rightColumnAlt || 'Right Column Image'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '0px',
                      }}
                    />

                    {/* Drop zone overlay for existing right column image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10,
                        cursor: 'pointer',
                        background: isDragOverRightColumnImage ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.01)',
                        border: isDragOverRightColumnImage ? '2px dashed #3b82f6' : 'none',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'auto',
                        borderRadius: '0px',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOverRightColumnImage(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOverRightColumnImage(false);
                      }}
                      onDrop={handleRightColumnImageDrop}
                    />
                  </div>
                ) : (
                  <div
                    data-right-column-image-drop-area
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      minHeight: '0',
                      background: isDragOverRightColumnImage ? 'rgba(59, 130, 246, 0.1)' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isDragOverRightColumnImage ? '2px dashed #3b82f6' : '2px dashed #bdbdbd',
                      color: isDragOverRightColumnImage ? '#3b82f6' : '#888',
                      fontSize: '12px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      marginBottom: '12px',
                      borderRadius: '0px',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOverRightColumnImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOverRightColumnImage(false);
                    }}
                    onDrop={handleRightColumnImageDrop}
                  >
                    <span>Drag image here</span>
                  </div>
                )}
                {/* Right column text content */}
                <div style={{ padding: '0px 16px', marginTop: '16px', marginBottom: '16px' }}>
                  <p style={{
                    color: '#333',
                    fontSize: isMobileView ? '16px' : '18px',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '8px',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {props.rightColumnTitle || 'Right Column Title'}
                  </p>
                  <div
                    className="ql-rich-text-preview"
                    dangerouslySetInnerHTML={{ __html: props.rightColumnContent || 'Add your right column description here.' }}
                    style={{
                      fontFamily: 'Source Sans 3, sans-serif',
                      color: '#333',
                      fontSize: '16px',
                      margin: 0,
                      marginBottom: '10px'
                    }}
                  />
                </div>
                {/* Render right column children (e.g., button) */}
                {component.rightChildren && component.rightChildren.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    padding: '0px 16px'
                  }}>
                    {component.rightChildren.map((child) => (
                      <EmailComponentRenderer key={child.id} component={child} isInContentCard={true} isMobileView={isMobileView} />
                    ))}
                  </div>
                )}
                {/* Right column button drop zone */}
                {isDraggingButton && (
                  <div
                    data-right-column-button-drop-area
                    style={{
                      marginTop: '16px',
                      marginBottom: '16px',
                      minHeight: '40px',
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '2px dashed #d1d5db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                      margin: '16px 16px 16px 16px',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only reset if we're actually leaving the drop zone area
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const currentTarget = e.currentTarget as HTMLElement;
                      if (!currentTarget.contains(relatedTarget)) {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                      e.currentTarget.style.borderColor = '#d1d5db';

                      // Handle button drop to right column
                      const draggedComponentType = e.dataTransfer.getData('text/plain');
                      if (draggedComponentType === 'button') {
                        const newButton: EmailComponent = {
                          id: `button-${Date.now()}`,
                          type: 'button',
                          props: {
                            content: 'Click Me',
                            backgroundColor: '#440099',
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: 'normal',
                            padding: '8px 16px',
                            borderRadius: '0px',
                            textAlign: 'left',
                            buttonSize: 'small',
                            buttonPosition: 'center',
                          }
                        };

                        // Dispatch event to add button to right column
                        window.dispatchEvent(new CustomEvent('add-button-to-right-column', {
                          detail: { componentId: component.id, button: newButton }
                        }));
                      }
                    }}
                  >
                    <span>Drop button here</span>
                  </div>
                )}
              </div>
            </div>
            {/* Remove the container-level children rendering since we now have separate left and right children */}
          </div>
        </div>
      );
    }

    case 'divider':
      return (
        <div style={{ ...baseStyles, backgroundColor: isPreview ? 'transparent' : baseStyles.backgroundColor }}>
          <hr
            style={{
              border: 'none',
              height: '1px',
              backgroundColor: props.color || '#e5e7eb',
              margin: props.margin || '16px 0',
            }}
          />
        </div>
      );

    case 'spacer':
      return (
        <div
          style={{
            height: props.height || '20px',
            backgroundColor: isPreview ? 'transparent' : '#f0f0f0',
            border: isPreview ? 'none' : '1px dashed #ccc',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666',
            margin: '4px 0',
          }}
        >
          {!isPreview && `Spacer (${props.height || '20px'})`}
        </div>
      );

    default:
      return <div>Unknown component type: {type}</div>;
  }
};

export default EmailComponentRenderer;