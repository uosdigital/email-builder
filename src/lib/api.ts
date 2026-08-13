import { supabase } from './supabase';

export interface Template {
    id: string;
    user_id: string;
    name: string;
    content: any;
    created_at: string;
    updated_at: string;
}

// Helper to get current user ID and verify session
async function getCurrentUserId(): Promise<string> {
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        console.error('No active session:', sessionError);
        throw new Error('User not authenticated. Please sign in again.');
    }

    // Then get the user to verify
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error('Failed to get user:', error);
        throw new Error('User not authenticated. Please sign in again.');
    }

    console.log('Current user ID:', user.id);
    return user.id;
}

export const api = {
    async getTemplates(): Promise<Template[]> {
        // Get current user ID to filter templates
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            throw new Error(error.message || 'Failed to fetch templates');
        }

        return (data || []) as Template[];
    },

    async createTemplate(name: string, content: any): Promise<Template> {
        // Get current user ID to associate template with user
        const userId = await getCurrentUserId();

        console.log('Creating template for user:', userId);

        const { data, error } = await supabase
            .from('templates')
            .insert({ user_id: userId, name, content })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            // Provide more helpful error message
            if (error.message?.includes('row-level security')) {
                throw new Error('Permission denied. Please ensure you are signed in and RLS policies are configured correctly.');
            }

            throw new Error(error.message || 'Failed to create template');
        }

        return data as Template;
    },

    async updateTemplate(id: string, name: string, content: any): Promise<Template> {
        // Get current user ID to ensure user owns the template
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from('templates')
            .update({ name, content })
            .eq('id', id)
            .eq('user_id', userId) // Ensure user owns this template
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Failed to update template');
        }

        if (!data) {
            throw new Error('Template not found or you do not have permission to update it');
        }

        return data as Template;
    },

    async updateTemplateName(id: string, name: string): Promise<Template> {
        // Get current user ID to ensure user owns the template
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from('templates')
            .update({ name })
            .eq('id', id)
            .eq('user_id', userId) // Ensure user owns this template
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Failed to update template name');
        }

        if (!data) {
            throw new Error('Template not found or you do not have permission to update it');
        }

        return data as Template;
    },

    async deleteTemplate(id: string): Promise<void> {
        // Get current user ID to ensure user owns the template
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Ensure user owns this template

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Failed to delete template');
        }
    },
};
