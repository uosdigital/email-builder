import React, { useState } from 'react';
import { EmailComponent } from '../types/email';
import EmailComponentRenderer from './EmailComponentRenderer';
import { Monitor, Smartphone, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface PreviewPaneProps {
  components: EmailComponent[];
  globalStyles: {
    backgroundColor: string;
    fontSize: number;
    color: string;
  };
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ components, globalStyles }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isExpanded, setIsExpanded] = useState(false);

  const previewStyles = {
    backgroundColor: globalStyles.backgroundColor,
    fontSize: `${globalStyles.fontSize}px`,
    color: globalStyles.color,
    minHeight: '500px',
    padding: '20px',
  };

  if (!isExpanded) {
    return (
      <div className="w-12 bg-white border-l border-grey-200 flex flex-col items-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="p-3 text-grey-600 hover:bg-grey-100 transition-colours rounded-md"
          title="Expand Preview"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="transform rotate-90 text-grey-600 text-sm font-medium mt-8 whitespace-nowrap">
          Preview
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-grey-200 flex flex-col">
      <div className="p-4 border-b border-grey-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-grey-800">Preview</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 text-grey-600 hover:bg-grey-100 rounded-md transition-colours"
            title="Collapse Preview"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colours ${
              viewMode === 'desktop' 
                ? 'bg-blue-600 text-white' 
                : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colours ${
              viewMode === 'mobile' 
                ? 'bg-blue-600 text-white' 
                : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="border border-grey-200 rounded-lg overflow-visible shadow-sm">
          <div className="bg-grey-50 px-3 py-2 flex items-center space-x-2 border-b border-grey-200">
            <Eye className="w-4 h-4 text-grey-600" />
            <span className="text-sm text-grey-600 font-medium">
              {viewMode === 'desktop' ? 'Desktop View' : 'Mobile View'}
            </span>
          </div>
          
          <div
            className={`overflow-visible bg-white ${
              viewMode === 'desktop' ? 'w-full' : 'w-64 mx-auto'
            }`}
            style={{ maxHeight: '600px' }}
          >
            <div style={previewStyles}>
              {components.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-grey-300 mb-3">
                    <Eye className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-grey-500 font-medium">No components added yet</p>
                  <p className="text-grey-400 text-sm mt-1">Start building to see your email preview</p>
                </div>
              ) : (
                components.map((component) => (
                  <EmailComponentRenderer key={component.id} component={component} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;