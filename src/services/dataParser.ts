import Papa from 'papaparse';
import type { CoinSnapshot, HistoricalDataPoint } from '../types';

// Popular coins to feature (will be filtered from CSV)
export const FEATURED_COINS = [
    'BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'TRX', 'LINK', 'AVAX',
    'MATIC', 'DOT', 'LTC', 'SHIB', 'UNI', 'ATOM', 'XLM', 'XMR'
];

// Parse currency string like "$36,456.94" or "$22,801,222,945.00" to number
function parseCurrency(value: string): number {
    if (!value || value === '-' || value === '$ -' || value === '$-') return 0;
    const cleaned = value.replace(/[$,\s]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// Parse percentage string like "0.40%" or "-1.70%" to number
function parsePercentage(value: string): number {
    if (!value || value === '-' || value === '') return 0;
    const cleaned = value.replace('%', '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// Parse supply strings like "19,549,806" or "21 Million"
function parseSupply(value: string): string {
    if (!value) return '0';
    return value.trim();
}

// Map symbol to icon filename
function getIconUrl(symbol: string): string {
    const iconMap: Record<string, string> = {
        'BTC': '/coins/btc.png',
        'ETH': '/coins/eth.png',
        'ADA': '/coins/ada.png',
        'AVAX': '/coins/avax.png',
        'DOGE': '/coins/doge.png',
        'MATIC': '/coins/pol.png',
        'POL': '/coins/pol.png',
        'SNX': '/coins/snx.png',
        'TRX': '/coins/trx.png',
        'XRP': '/coins/xrp.png',
    };
    return iconMap[symbol] || '';
}

// Parse CSV row to CoinSnapshot
function parseRow(row: Record<string, string>): CoinSnapshot | null {
    try {
        const rank = parseInt(row['Rank'], 10);
        if (isNaN(rank)) return null;

        return {
            rank,
            name: row['Coin Name']?.trim() || '',
            symbol: row['Symbol']?.trim() || '',
            price: parseCurrency(row[' Price '] || row['Price']),
            change1h: parsePercentage(row['1h']),
            change24h: parsePercentage(row['24h']),
            change7d: parsePercentage(row['7d']),
            change30d: parsePercentage(row['30d']),
            volume24h: parseCurrency(row[' 24h Volume '] || row['24h Volume']),
            circulatingSupply: parseSupply(row['Circulating Supply']),
            totalSupply: parseSupply(row['Total Supply']),
            marketCap: parseCurrency(row[' Market Cap '] || row['Market Cap']),
            iconUrl: getIconUrl(row['Symbol']?.trim() || ''),
        };
    } catch {
        return null;
    }
}

// Parse CSV string to array of CoinSnapshots
export function parseCSV(csvString: string): CoinSnapshot[] {
    const result = Papa.parse<Record<string, string>>(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
    }

    const coins: CoinSnapshot[] = [];
    for (const row of result.data) {
        const coin = parseRow(row);
        if (coin && coin.price > 0) {
            coins.push(coin);
        }
    }

    return coins;
}

// Generate synthetic historical data from snapshot
// Uses percentage changes to extrapolate backwards
export function generateHistoricalData(
    coin: CoinSnapshot,
    days: number = 30
): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const currentPrice = coin.price;

    // Calculate daily volatility from 24h change
    const dailyVolatility = Math.abs(coin.change24h) / 100 || 0.02;

    // Estimate price 30 days ago using change30d
    const change30d = coin.change30d || 0;
    const priceMultiplier = 1 + (change30d / 100);
    const price30DaysAgo = priceMultiplier !== 0 ? currentPrice / priceMultiplier : currentPrice;

    // Linear interpolation with some noise
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Progress from 0 (30 days ago) to 1 (today)
        const progress = (days - 1 - i) / (days - 1);

        // Base price with linear interpolation
        const basePrice = price30DaysAgo + (currentPrice - price30DaysAgo) * progress;

        // Add some randomness based on volatility
        const noise = (Math.random() - 0.5) * 2 * dailyVolatility;
        const close = basePrice * (1 + noise);

        // Generate OHLC from close
        const spread = close * dailyVolatility * 0.5;
        const open = close + (Math.random() - 0.5) * spread;
        const highExtra = Math.random() * spread;
        const lowExtra = Math.random() * spread;
        const high = Math.max(open, close) + highExtra;
        const low = Math.min(open, close) - lowExtra;

        data.push({
            time: dateStr,
            open: Math.max(0, open),
            high: Math.max(0, high),
            low: Math.max(0, low),
            close: Math.max(0, close),
        });
    }

    // Ensure the last day matches current price
    if (data.length > 0) {
        data[data.length - 1].close = currentPrice;
    }

    return data;
}

// Get price for a specific day in simulation
export function getPriceForDay(
    historicalData: HistoricalDataPoint[],
    day: number
): number {
    if (day < 0 || day >= historicalData.length) {
        return historicalData[historicalData.length - 1]?.close || 0;
    }
    return historicalData[day]?.close || 0;
}

// Filter to only featured/popular coins
export function filterFeaturedCoins(coins: CoinSnapshot[]): CoinSnapshot[] {
    return coins.filter(coin => FEATURED_COINS.includes(coin.symbol));
}

// Load and parse CSV from file
export async function loadCryptoData(): Promise<{
    coins: CoinSnapshot[];
    historicalData: Record<string, HistoricalDataPoint[]>;
}> {
    try {
        const response = await fetch('/data/CryptocurrencyData.csv');
        const csvText = await response.text();
        const allCoins = parseCSV(csvText);

        // Get featured coins or top 20 by market cap
        let coins = filterFeaturedCoins(allCoins);
        if (coins.length < 10) {
            coins = allCoins.slice(0, 20);
        }

        // Generate historical data for each coin
        const historicalData: Record<string, HistoricalDataPoint[]> = {};
        for (const coin of coins) {
            historicalData[coin.symbol] = generateHistoricalData(coin, 30);
        }

        return { coins, historicalData };
    } catch (error) {
        console.error('Failed to load crypto data:', error);
        return { coins: [], historicalData: {} };
    }
}
