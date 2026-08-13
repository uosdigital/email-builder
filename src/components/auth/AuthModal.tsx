import React, { useState } from 'react';
import { X, Mail, Loader2, Lock, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { signInWithPassword, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus('loading');
        setMessage('');

        try {
            if (isSignUp) {
                const { error, requiresConfirmation } = await signUp(email, password);
                if (error) throw error;
                setStatus('success');
                setMessage(
                    requiresConfirmation
                        ? 'Please check your email to confirm your account.'
                        : 'Account created successfully!',
                );
            } else {
                const { error } = await signInWithPassword(email, password);
                if (error) throw error;
                setStatus('success');
                setMessage('Signed in successfully!');
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Authentication failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-96 max-w-md mx-4 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-grey-400 hover:text-grey-600 transition-colours"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-grey-800 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome'}
                    </h2>
                    <p className="text-grey-600">
                        {isSignUp ? 'Sign up to save your designs' : 'Sign in to manage your designs'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 border-b border-grey-200">
                    <button
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${!isSignUp ? 'text-[#440099] border-b-2 border-[#440099]' : 'text-grey-500 hover:text-grey-700'}`}
                        onClick={() => { setIsSignUp(false); setMessage(''); setStatus('idle'); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${isSignUp ? 'text-[#440099] border-b-2 border-[#440099]' : 'text-grey-500 hover:text-grey-700'}`}
                        onClick={() => { setIsSignUp(true); setMessage(''); setStatus('idle'); }}
                    >
                        No Account?
                    </button>
                </div>

                {status === 'success' && isSignUp ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-grey-800 mb-2">Check your email</h3>
                        <p className="text-grey-600 mb-6">{message}</p>
                        <button
                            onClick={() => { setIsSignUp(false); setStatus('idle'); }}
                            className="w-full py-3 bg-grey-100 text-grey-700 rounded-lg hover:bg-grey-200 transition-colours font-medium"
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-grey-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#440099] focus:border-transparent transition-all"
                                        disabled={status === 'loading'}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#440099] focus:border-transparent transition-all"
                                        disabled={status === 'loading'}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-[#440099] text-white rounded-lg hover:bg-[#330077] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center font-semibold"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
