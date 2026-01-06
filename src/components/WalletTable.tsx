import { Wallet } from 'lucide-react';
import { useAppStore, useCurrentProfile } from '../stores/appStore';
import { formatCurrency, getChangeColor, formatPercentage, getCoinColor } from '../utils/format';

export function WalletTable() {
    const profile = useCurrentProfile();
    const historicalData = useAppStore(state => state.historicalData);
    const currentDay = useAppStore(state => state.currentDay);
    const selectCoin = useAppStore(state => state.selectCoin);

    if (!profile) return null;

    // Filter to only show coins with holdings
    const holdings = profile.wallet.filter(entry => entry.amount > 0);

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Wallet</h3>
                    <p className="text-xs text-gray-500">{holdings.length} assets</p>
                </div>
            </div>

            {holdings.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No holdings yet</p>
                    <p className="text-gray-600 text-sm">Buy some crypto to get started</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wider pb-2 px-3 border-b border-white/5">
                        <span className="col-span-4">Asset</span>
                        <span className="col-span-2 text-right">Holdings</span>
                        <span className="col-span-2 text-right">Price</span>
                        <span className="col-span-2 text-right">Value</span>
                        <span className="col-span-2 text-right">P&L</span>
                    </div>

                    {/* Asset Rows */}
                    {holdings.map(entry => {
                        const coinData = historicalData[entry.symbol];
                        const currentPrice = coinData?.[currentDay]?.close || 0;
                        const currentValue = entry.amount * currentPrice;
                        const costBasis = entry.amount * entry.avgBuyPrice;
                        const pnl = currentValue - costBasis;
                        const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                        const isPositive = pnl >= 0;

                        return (
                            <div
                                key={entry.symbol}
                                onClick={() => selectCoin(entry.symbol)}
                                className="grid grid-cols-12 gap-2 py-3 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors items-center group"
                            >
                                {/* Asset */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${getCoinColor(entry.symbol)}25, ${getCoinColor(entry.symbol)}10)`,
                                            color: getCoinColor(entry.symbol)
                                        }}
                                    >
                                        {entry.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{entry.symbol}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[80px]">{entry.name}</p>
                                    </div>
                                </div>

                                {/* Holdings */}
                                <p className="col-span-2 text-right font-mono text-sm text-gray-300">
                                    {entry.amount < 1 ? entry.amount.toFixed(6) : entry.amount.toFixed(4)}
                                </p>

                                {/* Price */}
                                <p className="col-span-2 text-right font-mono text-sm text-gray-400">
                                    {formatCurrency(currentPrice)}
                                </p>

                                {/* Value */}
                                <p className="col-span-2 text-right font-mono font-semibold text-white">
                                    {formatCurrency(currentValue)}
                                </p>

                                {/* P&L */}
                                <div className="col-span-2 text-right">
                                    <p className={`font-mono text-sm font-medium ${getChangeColor(pnl)}`}>
                                        {isPositive ? '+' : ''}{formatCurrency(pnl)}
                                    </p>
                                    <p className={`text-xs ${isPositive ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                        {formatPercentage(pnlPercentage)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Cash Row */}
                    <div className="grid grid-cols-12 gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 items-center mt-2">
                        <div className="col-span-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold text-sm">$</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">USD</p>
                                <p className="text-xs text-gray-500">Cash Balance</p>
                            </div>
                        </div>
                        <p className="col-span-2 text-right font-mono text-sm text-gray-400">—</p>
                        <p className="col-span-2 text-right font-mono text-sm text-gray-400">$1.00</p>
                        <p className="col-span-2 text-right font-mono font-semibold text-white">
                            {formatCurrency(profile.balance)}
                        </p>
                        <p className="col-span-2 text-right font-mono text-sm text-gray-400">—</p>
                    </div>
                </div>
            )}
        </div>
    );
}
