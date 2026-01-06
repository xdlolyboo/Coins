// Format number as currency
export function formatCurrency(value: number, decimals: number = 2): string {
    if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    if (value >= 1) {
        return `$${value.toFixed(decimals)}`;
    }
    // For very small numbers (like SHIB, DOGE)
    return `$${value.toFixed(6)}`;
}

// Format number with commas
export function formatNumber(value: number, decimals: number = 2): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

// Format percentage with sign
export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// Get color class based on value (positive/negative)
export function getChangeColor(value: number): string {
    if (value > 0) return 'text-positive';
    if (value < 0) return 'text-negative';
    return 'text-gray-400';
}

// Get badge class based on value
export function getChangeBadge(value: number): string {
    if (value > 0) return 'badge-positive';
    if (value < 0) return 'badge-negative';
    return 'bg-gray-700 text-gray-300';
}

// Format date for display
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Get day number from date (for simulation display)
export function getDayLabel(day: number): string {
    return `Day ${day + 1}`;
}

// Calculate P&L
export function calculatePnL(currentValue: number, initialValue: number): {
    amount: number;
    percentage: number;
} {
    const amount = currentValue - initialValue;
    const percentage = initialValue > 0 ? (amount / initialValue) * 100 : 0;
    return { amount, percentage };
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Coin icon mapping (fallback to first letter)
export function getCoinIcon(symbol: string): string {
    const iconMap: Record<string, string> = {
        BTC: '/coins/btc.png',
        ETH: '/coins/eth.png',
        ADA: '/coins/ada.png',
        AVAX: '/coins/avax.png',
        DOGE: '/coins/doge.png',
        MATIC: '/coins/pol.png',
        POL: '/coins/pol.png',
        SNX: '/coins/snx.png',
        TRX: '/coins/trx.png',
        XRP: '/coins/xrp.png',
    };
    return iconMap[symbol] || '';
}

// Generate a consistent color for a coin symbol
export function getCoinColor(symbol: string): string {
    const colors = [
        '#F7931A', // Bitcoin orange
        '#627EEA', // Ethereum blue
        '#F3BA2F', // Binance yellow
        '#00ACD1', // XRP cyan
        '#14F195', // Solana green
        '#0033AD', // Cardano blue
        '#C2A633', // Doge gold
        '#FF0000', // TRX red
        '#2A5ADA', // Chainlink blue
        '#E84142', // Avalanche red
        '#8247E5', // Polygon purple
        '#E6007A', // Polkadot pink
    ];

    // Simple hash to pick a color
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
