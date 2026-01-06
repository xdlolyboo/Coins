import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Coins } from 'lucide-react';
import { useAppStore, useCurrentProfile, useCurrentPrice } from '../stores/appStore';
import { formatCurrency, getCoinColor } from '../utils/format';

export function TradingPanel() {
    const [amount, setAmount] = useState('');

    const selectedCoin = useAppStore(state => state.selectedCoin);
    const tradeMode = useAppStore(state => state.tradeMode);
    const setTradeMode = useAppStore(state => state.setTradeMode);
    const executeTrade = useAppStore(state => state.executeTrade);
    const coins = useAppStore(state => state.coins);

    const profile = useCurrentProfile();
    const currentPrice = useCurrentPrice(selectedCoin);

    const coin = coins.find(c => c.symbol === selectedCoin);
    const walletEntry = profile?.wallet.find(w => w.symbol === selectedCoin);
    const amountNum = parseFloat(amount) || 0;
    const totalCost = amountNum * currentPrice;

    const maxBuyAmount = profile && currentPrice > 0 ? profile.balance / currentPrice : 0;
    const maxSellAmount = walletEntry?.amount || 0;

    const handleTrade = () => {
        if (amountNum <= 0) return;

        const success = executeTrade(amountNum);
        if (success) {
            setAmount('');
        }
    };

    const handleSetMax = () => {
        const max = tradeMode === 'buy' ? maxBuyAmount : maxSellAmount;
        setAmount(max.toFixed(6));
    };

    const handlePercentage = (percent: number) => {
        const max = tradeMode === 'buy' ? maxBuyAmount : maxSellAmount;
        setAmount((max * percent / 100).toFixed(6));
    };

    const canTrade = amountNum > 0 && (
        (tradeMode === 'buy' && totalCost <= (profile?.balance || 0)) ||
        (tradeMode === 'sell' && amountNum <= maxSellAmount)
    );

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Trading</h3>
                    <p className="text-xs text-gray-500">{selectedCoin}/USD</p>
                </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-xl">
                <button
                    onClick={() => setTradeMode('buy')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${tradeMode === 'buy'
                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <ArrowUpRight className="w-4 h-4" />
                    Buy
                </button>
                <button
                    onClick={() => setTradeMode('sell')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${tradeMode === 'sell'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <ArrowDownRight className="w-4 h-4" />
                    Sell
                </button>
            </div>

            {/* Current Price */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Price</span>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                            style={{
                                backgroundColor: `${getCoinColor(selectedCoin)}20`,
                                color: getCoinColor(selectedCoin)
                            }}
                        >
                            {selectedCoin.slice(0, 2)}
                        </div>
                        <span className="font-mono font-semibold text-white">{formatCurrency(currentPrice)}</span>
                    </div>
                </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                    Amount
                </label>
                <div className="relative mb-2">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="input-field pr-20 font-mono text-lg"
                        step="any"
                        min="0"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-sm text-gray-500">{selectedCoin}</span>
                        <button
                            onClick={handleSetMax}
                            className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Quick percentage buttons */}
                <div className="flex gap-2">
                    {[25, 50, 75, 100].map(percent => (
                        <button
                            key={percent}
                            onClick={() => handlePercentage(percent)}
                            className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-colors"
                        >
                            {percent}%
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Available: {tradeMode === 'buy'
                        ? formatCurrency(profile?.balance || 0)
                        : `${maxSellAmount.toFixed(4)} ${selectedCoin}`
                    }
                </p>
            </div>

            {/* Total */}
            <div className="bg-white/5 rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="font-mono font-bold text-xl text-white">{formatCurrency(totalCost)}</span>
                </div>
            </div>

            {/* Execute Button */}
            <button
                onClick={handleTrade}
                disabled={!canTrade}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${tradeMode === 'buy'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:shadow-lg hover:shadow-green-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400'
                    } disabled:cursor-not-allowed disabled:shadow-none`}
            >
                {tradeMode === 'buy' ? 'Buy' : 'Sell'} {coin?.name || selectedCoin}
            </button>
        </div>
    );
}
