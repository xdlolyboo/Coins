import { TrendingUp, User, LogOut } from 'lucide-react';
import { useCurrentProfile, useTotalPortfolioValue, useAppStore } from '../stores/appStore';
import { formatCurrency, formatPercentage, calculatePnL } from '../utils/format';

export function Header() {
    const profile = useCurrentProfile();
    const logout = useAppStore(state => state.logout);
    const totalValue = useTotalPortfolioValue();

    const pnl = profile ? calculatePnL(totalValue, profile.initialBalance) : { amount: 0, percentage: 0 };
    const isPositive = pnl.amount >= 0;

    return (
        <header className="glass-card px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            CTIS <span className="text-blue-400">v2</span>
                        </h1>
                        <p className="text-xs text-gray-500">Crypto Trading Simulator</p>
                    </div>
                </div>

                {/* Profile Info */}
                {profile && (
                    <div className="flex items-center gap-8">
                        {/* Portfolio Value */}
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Portfolio Value</p>
                            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(totalValue)}</p>
                            <div className={`flex items-center justify-end gap-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {isPositive ? '+' : ''}{formatPercentage(pnl.percentage)}
                                </span>
                                <span className="font-mono">
                                    {isPositive ? '+' : ''}{formatCurrency(pnl.amount)}
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-14 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

                        {/* Cash Balance */}
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cash Balance</p>
                            <p className="text-lg font-bold font-mono text-white">{formatCurrency(profile.balance)}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-14 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{profile.username}</p>
                                <p className="text-xs text-gray-500">Trader</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="ml-2 p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
