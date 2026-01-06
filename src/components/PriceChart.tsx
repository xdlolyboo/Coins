import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useAppStore } from '../stores/appStore';
import { getCoinColor } from '../utils/format';

export function PriceChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const selectedCoin = useAppStore(state => state.selectedCoin);
    const historicalData = useAppStore(state => state.historicalData);
    const currentDay = useAppStore(state => state.currentDay);
    const coins = useAppStore(state => state.coins);

    const coinData = historicalData[selectedCoin];
    const coin = coins.find(c => c.symbol === selectedCoin);

    // Create chart on mount
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#71717a',
                fontFamily: "'Inter', -apple-system, sans-serif",
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: 'rgba(59, 130, 246, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
                horzLine: {
                    color: 'rgba(59, 130, 246, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.15,
                    bottom: 0.15,
                },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chartRef.current = chart;

        // Create candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        seriesRef.current = candlestickSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);
        handleResize();

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []);

    // Update data when coin or day changes
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current || !coinData) return;

        const chart = chartRef.current;
        const candlestickSeries = seriesRef.current;

        // Only show data up to currentDay
        const visibleData = coinData.slice(0, currentDay + 1).map(d => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        })) as CandlestickData<Time>[];

        candlestickSeries.setData(visibleData);

        // Fit content with some padding
        chart.timeScale().fitContent();
    }, [selectedCoin, coinData, currentDay]);

    // Calculate current price and change
    const currentPrice = coinData?.[currentDay]?.close || 0;
    const prevPrice = coinData?.[Math.max(0, currentDay - 1)]?.close || currentPrice;
    const priceChange = currentPrice - prevPrice;
    const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0;
    const isPositive = priceChange >= 0;

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${getCoinColor(selectedCoin)}30, ${getCoinColor(selectedCoin)}10)`,
                            color: getCoinColor(selectedCoin),
                            border: `1px solid ${getCoinColor(selectedCoin)}30`
                        }}
                    >
                        {selectedCoin.slice(0, 2)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white">{coin?.name || selectedCoin}</h3>
                        <p className="text-sm text-gray-500">{selectedCoin}/USD • Synthetic Data</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-white">
                        ${currentPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: currentPrice < 1 ? 6 : 2
                        })}
                    </p>
                    {currentDay > 0 && (
                        <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{isPositive ? '↑' : '↓'}</span>
                            <span>${Math.abs(priceChange).toFixed(2)}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div ref={chartContainerRef} className="h-[350px]" />
        </div>
    );
}
