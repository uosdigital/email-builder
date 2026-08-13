import React, { useState, useEffect } from 'react';
import { Send, Undo, Redo, X, Eye, Monitor, Smartphone, Download, FilePenLine, User as UserIcon, LogOut, Layout, Save, CircleUser, SquareUser, UserRound } from 'lucide-react';
import emailjs from '@emailjs/browser';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import { EmailComponent } from '../types/email';
import EmailComponentRenderer from './EmailComponentRenderer';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  components: EmailComponent[];
  globalStyles: {
    backgroundColor: string;
    fontSize: number;
    color: string;
  };
  generateEmailHTML: (components: EmailComponent[], globalStyles: {
    backgroundColor: string;
    fontSize: number;
    color: string;
  }) => string;
  onSave: () => void;
  onToggleDashboard: () => void;
  onSignIn: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'unsaved';
}

const Header: React.FC<HeaderProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  components,
  globalStyles,
  generateEmailHTML,
  onSave,
  onToggleDashboard,
  onSignIn,
  autoSaveStatus = 'saved',
}) => {
  const { user, signOut } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [exporting, setExporting] = useState<'none' | 'png'>('none');
  const previewRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showPreviewModal) {
      document.body.classList.add('modal-preview-open');
    } else {
      document.body.classList.remove('modal-preview-open');
    }
    return () => document.body.classList.remove('modal-preview-open');
  }, [showPreviewModal]);

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;

    setIsSending(true);
    setEmailStatus('idle');
    setErrorMessage('');

    try {
      // Generate the email HTML content
      const emailHTML = generateEmailHTML(components, globalStyles);

      // EmailJS configuration - You'll need to replace these with your actual values
      const serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
      const templateID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
      const publicKey = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

      // Template parameters for EmailJS
      const templateParams = {
        to_email: testEmail,
        from_name: 'Email Builder',
        subject: 'Test Email from Email Builder',
        html_content: emailHTML,
        reply_to: 'noreply@emailbuilder.com'
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceID,
        templateID,
        templateParams,
        publicKey
      );

      if (response.status === 200) {
        setEmailStatus('success');
        setTimeout(() => {
          setShowEmailModal(false);
          setTestEmail('');
          setEmailStatus('idle');
        }, 2000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error: unknown) {
      const err = error as { text?: string; message?: string };
      console.error('Email sending failed:', error);
      setEmailStatus('error');
      setErrorMessage(err.text || err.message || 'Failed to send email. Please check your EmailJS configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  // Export PNG
  const handleExportPNG = async () => {
    setExporting('png');
    try {
      if (previewRef.current) {
        const dataUrl = await htmlToImage.toPng(previewRef.current, { pixelRatio: 2 });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `email-preview-${viewMode}-${timestamp}.png`;
        saveAs(dataUrl, filename);
      }
    } finally {
      setExporting('none');
    }
  };

  const previewStyles = {
    backgroundColor: '#ffffff',
    fontSize: `${globalStyles.fontSize}px`,
    color: globalStyles.color,
    minHeight: '500px',
    padding: '20px',
  };

  return (
    <>
      <header className="bg-white border-b border-grey-200 px-6 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={onToggleDashboard}>
              <FilePenLine className="w-8 h-8 text-[#440099] ml-3" />
              <h1 className="font-semibold text-grey-800 px-2" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '1.6rem' }}>Email Builder</h1>
            </div>
            <div className="h-6 w-px bg-grey-300 mx-4" />
            <div className="flex items-center space-x-2">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded-md transition-colours ${canUndo
                  ? 'text-grey-600 hover:bg-grey-100'
                  : 'text-grey-300 cursor-not-allowed'
                  }`}
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded-md transition-colours ${canRedo
                  ? 'text-grey-600 hover:bg-grey-100'
                  : 'text-grey-300 cursor-not-allowed'
                  }`}
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            {autoSaveStatus && autoSaveStatus !== 'saved' && (
              <span className={`text-xs ${autoSaveStatus === 'saving' ? 'text-blue-600' : 'text-orange-600'
                }`}>
                {autoSaveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-xs text-green-600">✓ Saved</span>
            )}
          </div>

          <div className="flex items-center space-x-3 mr-4">
            {user && (
              <button
                onClick={onToggleDashboard}
                className="flex items-center space-x-2 px-4 py-2 text-grey-700 hover:bg-grey-100 rounded-md transition-colours"
              >
                <Layout className="w-4 h-4" />
                <span className="text-sm font-medium">My Files</span>
              </button>
            )}
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-4 py-2 text-grey-700 hover:bg-grey-100 rounded-md transition-colours"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Save</span>
            </button>
            <div className="h-6 w-px bg-grey-300 mx-2" />

            <button
              onClick={handlePreview}
              className="flex items-center space-x-2 px-4 py-2 text-grey-700 hover:bg-grey-100 rounded-md transition-colours"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview</span>
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="hidden flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span className="text-sm font-semibold">Send Test</span>
            </button>

            <div className="ml-2 pl-2 border-l border-grey-300">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-grey-600 hidden md:inline-block">{user.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-grey-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colours"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-[#440099] rounded-md hover:bg-[#330077] transition-colours shadow-sm"
                >
                  <UserRound className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-grey-800">Send Test Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-grey-400 hover:text-grey-600 transition-colours"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-grey-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${emailStatus === 'error'
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-grey-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                disabled={isSending}
              />
              {emailStatus === 'error' && errorMessage && (
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              )}
              {emailStatus === 'success' && (
                <p className="mt-2 text-sm text-green-600">✓ Test email sent successfully!</p>
              )}
            </div>

            {/* EmailJS Setup Instructions */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Setup Required:</strong> To send emails, configure EmailJS:
              </p>
              <ol className="text-xs text-blue-700 space-y-1 ml-4">
                <li>1. Create account at <a href="https://emailjs.com" target="_blank" className="underline">emailjs.com</a></li>
                <li>2. Add email service (Gmail, Outlook, etc.)</li>
                <li>3. Create email template</li>
                <li>4. Update service ID, template ID, and public key in code</li>
              </ol>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailStatus('idle');
                  setErrorMessage('');
                }}
                className="flex-1 px-4 py-3 text-grey-700 border border-grey-300 rounded-lg hover:bg-grey-50 transition-colours font-medium"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={!isValidEmail(testEmail) || isSending}
                className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 font-semibold border min-h-[48px] ${isValidEmail(testEmail) && !isSending
                  ? emailStatus === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-grey-300 text-grey-500 border-grey-300 cursor-not-allowed'
                  }`}
              >
                {isSending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : emailStatus === 'success' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>✓ Sent!</span>
                  </div>
                ) : (
                  'Send Test Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="modal-overlay">
          <div className={`modal-preview ${viewMode === 'desktop' ? 'modal-preview-desktop' : 'modal-preview-mobile'}`}>
            {/* Existing modal content start */}
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-grey-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colours ${viewMode === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                      }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">Desktop</span>
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colours ${viewMode === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                      }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">Mobile</span>
                  </button>
                  {/* Export Buttons */}
                  <button
                    onClick={handleExportPNG}
                    disabled={exporting !== 'none'}
                    className="flex items-center space-x-1 px-2 py-2 rounded-md border border-grey-200 bg-grey-50 hover:bg-grey-100 text-grey-700 text-xs"
                    title="Export as PNG"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PNG</span>
                  </button>
                  {exporting !== 'none' && (
                    <span className="ml-2 text-xs text-blue-600 animate-pulse">Exporting...</span>
                  )}
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-grey-400 hover:text-grey-600 transition-colours"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <div className="flex justify-center">
                  <div
                    className={`bg-white border border-grey-200 rounded-lg overflow-hidden shadow-sm ${viewMode === 'desktop' ? 'w-full max-w-[672px]' : 'w-80 force-mobile'
                      }`}
                  >
                    <div className="bg-grey-50 px-4 py-2 flex items-center space-x-2 border-b border-grey-200">
                      <Eye className="w-4 h-4 text-grey-600" />
                      <span className="text-sm text-grey-600 font-medium">
                        {viewMode === 'desktop' ? 'Desktop View' : 'Mobile View'}
                      </span>
                    </div>
                    {/* Attach ref here for PNG export */}
                    <div style={previewStyles} ref={previewRef}>
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
                          component.type === 'banner' ? (
                            <div key={component.id} style={{ width: '580px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto', padding: 0, overflow: 'visible' }}>
                              <EmailComponentRenderer component={component} isPreview={true} isMobileView={viewMode === 'mobile'} />
                            </div>
                          ) : component.type === 'content-card' ? (
                            <div key={component.id} style={{ width: '560px', maxWidth: '100%', margin: '0 auto' }}>
                              <EmailComponentRenderer key={component.id} component={component} isPreview={true} isMobileView={viewMode === 'mobile'} />
                            </div>
                          ) : component.type === 'two-columns-card' ? (
                            <div key={component.id} style={{ width: '560px', maxWidth: '100%', margin: '0 auto' }}>
                              <EmailComponentRenderer key={component.id} component={component} isPreview={true} isMobileView={viewMode === 'mobile'} />
                            </div>
                          ) : (
                            <div key={component.id} style={{ width: '560px', maxWidth: '100%', margin: '0 auto' }}>
                              <EmailComponentRenderer key={component.id} component={component} isPreview={true} isMobileView={viewMode === 'mobile'} />
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Existing modal content end */}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;