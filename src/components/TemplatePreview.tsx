import React from 'react';
import { EmailComponent } from '../types/email';
import EmailComponentRenderer from './EmailComponentRenderer';

interface TemplatePreviewProps {
  components: EmailComponent[];
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ components }) => {
  if (!components || components.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-xs text-gray-400">No content yet</span>
      </div>
    );
  }

  // Base width used in the main canvas
  const BASE_WIDTH = 600;
  const SCALE = 0.18;

  return (
    <div className="w-full h-full flex items-start justify-center overflow-hidden">
      <div
        className="origin-top"
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: 'top center',
          width: BASE_WIDTH,
        }}
      >
        <div
          className="bg-white mx-auto"
          style={{
            width: BASE_WIDTH,
            boxShadow: '0 0 0 1px rgba(209, 213, 219, 0.6)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 12 }}>
            {components.map((component) => (
              <div key={component.id} style={{ marginBottom: 8 }}>
                <EmailComponentRenderer component={component} isPreview />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;


