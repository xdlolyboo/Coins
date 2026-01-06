import { useState } from 'react';
import { User, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export function ProfileSelector() {
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');

    const profiles = useAppStore(state => state.profiles);
    const createProfile = useAppStore(state => state.createProfile);
    const deleteProfile = useAppStore(state => state.deleteProfile);
    const selectProfile = useAppStore(state => state.selectProfile);

    const handleCreate = () => {
        if (newName.trim()) {
            createProfile(newName.trim());
            setNewName('');
            setShowModal(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
        if (e.key === 'Escape') {
            setShowModal(false);
            setNewName('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 animate-float">
                        <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Coins
                    </h1>
                    <p className="text-gray-400 text-lg">Crypto Trading Simulator</p>
                </div>

                {/* Profiles List */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Select Profile
                    </h2>

                    {profiles.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-2">No profiles yet</p>
                            <p className="text-gray-600 text-sm">Create a profile to start trading</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {profiles.map(profile => (
                                <div
                                    key={profile.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-hover)] transition-all cursor-pointer group"
                                    onClick={() => selectProfile(profile.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {profile.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{profile.username}</p>
                                            <p className="text-sm text-gray-400">
                                                Created {new Date(profile.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteProfile(profile.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Profile Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                >
                    <Plus className="w-5 h-5" />
                    New Profile
                </button>

                {/* Create Profile Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="glass-card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-semibold mb-4">Create New Profile</h3>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter your name..."
                                className="input-field mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewName('');
                                    }}
                                    className="btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim()}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
