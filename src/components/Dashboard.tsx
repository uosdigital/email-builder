import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Loader2, FileEdit, ArrowLeft, Copy, Pencil, X, Check } from 'lucide-react';
import { api, Template } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TemplatePreview from './TemplatePreview';
import { EmailComponent } from '../types/email';

interface DashboardProps {
    onLoadTemplate: (template: Template) => void;
    onNewTemplate: () => void;
    onBack: () => void;
}

const Dashboard = ({ onLoadTemplate, onNewTemplate, onBack }: DashboardProps) => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Rename state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    // Duplicate state
    const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchTemplates();
        }
    }, [user]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await api.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget(template);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.deleteTemplate(deleteTarget.id);
            setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error('Error deleting template:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDuplicate = async (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDuplicating) return;

        setIsDuplicating(template.id);
        try {
            const newName = `${template.name} (Copy)`;
            const newTemplate = await api.createTemplate(newName, template.content);
            setTemplates(prev => [newTemplate, ...prev]);
        } catch (error) {
            console.error('Error duplicating template:', error);
        } finally {
            setIsDuplicating(null);
        }
    };

    const handleRenameClick = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(template.id);
        setEditName(template.name);
    };

    const handleCancelRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
        setEditName('');
    };

    const handleSaveRename = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editName.trim() || isRenaming) return;

        setIsRenaming(true);
        try {
            const updatedTemplate = await api.updateTemplateName(id, editName.trim());
            setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
            setEditingId(null);
        } catch (error) {
            console.error('Error renaming template:', error);
        } finally {
            setIsRenaming(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto h-full">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="sr-only">Back to editor</span>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
                            <p className="text-gray-600 mt-1">Manage your email templates</p>
                        </div>
                    </div>
                    <button
                        onClick={onNewTemplate}
                        className="flex items-center space-x-2 px-6 py-3 bg-[#440099] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New</span>
                    </button>
                </div>

                <div className="mb-8 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileEdit className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No designs yet</h3>
                        <p className="text-gray-500 mb-6">Create your first email template to get started</p>
                        <button
                            onClick={onNewTemplate}
                            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            Create New Design
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => onLoadTemplate(template)}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                            >
                                <div className="bg-gray-100 p-4 h-32 flex items-start justify-center relative overflow-hidden cursor-pointer isolate">
                                    <TemplatePreview components={(template.content as EmailComponent[]) || []} />

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                                        <span className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium text-gray-800">Edit Design</span>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                                    <div className="flex-1 min-w-0 mr-4">
                                        {editingId === template.id ? (
                                            <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveRename(template.id, e as any);
                                                        if (e.key === 'Escape') handleCancelRename(e as any);
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => handleSaveRename(template.id, e)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    disabled={isRenaming}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancelRename}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    disabled={isRenaming}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="group/title flex items-center">
                                                <h3 className="font-semibold text-gray-800 truncate max-w-[180px]" title={template.name}>
                                                    {template.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => handleRenameClick(template, e)}
                                                    className="ml-2 p-1 text-gray-400 opacity-0 group-hover/title:opacity-100 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                    title="Rename"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Edited {new Date(template.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={(e) => handleDuplicate(template, e)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Duplicate"
                                            disabled={!!isDuplicating}
                                        >
                                            {isDuplicating === template.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(template, e)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete template</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => !isDeleting && setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
