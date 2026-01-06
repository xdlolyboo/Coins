import { useAppStore } from '../stores/appStore';
import { formatCurrency, formatPercentage, getCoinColor } from '../utils/format';

export function CoinSelector() {
    const coins = useAppStore(state => state.coins);
    const selectedCoin = useAppStore(state => state.selectedCoin);
    const selectCoin = useAppStore(state => state.selectCoin);
    const historicalData = useAppStore(state => state.historicalData);
    const currentDay = useAppStore(state => state.currentDay);

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Markets
                </h3>
                <span className="text-xs text-gray-500">{coins.length} coins</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {coins.slice(0, 16).map(coin => {
                    const isSelected = selectedCoin === coin.symbol;
                    const coinData = historicalData[coin.symbol];
                    const currentPrice = coinData?.[currentDay]?.close || coin.price;
                    const prevPrice = coinData?.[Math.max(0, currentDay - 1)]?.close || currentPrice;
                    const dayChange = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
                    const isPositive = dayChange >= 0;

                    return (
                        <button
                            key={coin.symbol}
                            onClick={() => selectCoin(coin.symbol)}
                            className={`
                relative p-4 rounded-xl border transition-all duration-200 text-left group
                ${isSelected
                                    ? 'bg-white/5 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                }
              `}
                        >
                            {/* Coin Icon/Symbol */}
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-sm font-bold transition-transform group-hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${getCoinColor(coin.symbol)}25, ${getCoinColor(coin.symbol)}10)`,
                                    color: getCoinColor(coin.symbol)
                                }}
                            >
                                {coin.symbol.slice(0, 3)}
                            </div>

                            {/* Coin Info */}
                            <p className="font-semibold text-white truncate">{coin.symbol}</p>
                            <p className="text-xs text-gray-500 truncate mb-2">{coin.name}</p>

                            {/* Price */}
                            <p className="font-mono text-sm text-white mb-1">
                                {formatCurrency(currentPrice)}
                            </p>

                            {/* Day Change */}
                            <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${isPositive
                                    ? 'bg-green-500/15 text-green-400'
                                    : 'bg-red-500/15 text-red-400'
                                }`}>
                                <span>{isPositive ? '↑' : '↓'}</span>
                                <span>{formatPercentage(Math.abs(dayChange))}</span>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
