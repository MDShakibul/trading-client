/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from '@material-tailwind/react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Swal from 'sweetalert2';
import {
	useCloseStockMutation,
	useGetCloseStockQuery,
	useGetStockQuery,
} from '../redux/api/apiSlice';
import { buyGainLoss, sellGainLoss, showAmountFormatted } from '../utils';
import { useSelector } from 'react-redux';

const Trade = () => {
	const [prices, setPrices] = useState({});
	const [isPending, startTransition] = useTransition();
	const wsRefs = useRef({}); // Store multiple WebSockets
	const reconnectTimeouts = useRef({}); // Handle reconnection delays



  const userInfo = useSelector((state) => state.userInfo.userInformation); 

	const { data: symbols, isLoading, error } = useGetStockQuery();

	const stockSymbols = useMemo(
		() => symbols?.data?.map((item) => item.stock_name) || [],
		[symbols]
	);

	const { data: closeStocks } = useGetCloseStockQuery();

	// ✅ Function to connect WebSockets for each symbol
	const connectWebSocket = (symbol) => {
		if (wsRefs.current[symbol]) {
			wsRefs.current[symbol].close(); // Close existing connection
		}

		const ws = new WebSocket(
			`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
		);

		ws.onopen = () => console.log(`✅ WebSocket connected: ${symbol}`);

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.p) {
					startTransition(() => {
						setPrices((prevPrices) => ({
							...prevPrices,
							[symbol]: parseFloat(data.p),
						}));
					});
				}
			} catch (error) {
				console.error(`❌ Error parsing WebSocket data for ${symbol}:`, error);
			}
		};

		ws.onerror = (error) => {
			console.error(`❌ WebSocket error for ${symbol}:`, error);
			reconnectWebSocket(symbol);
		};

		ws.onclose = (event) => {
			console.log(`🔴 WebSocket closed: ${symbol}, Reason: ${event.reason}`);
			reconnectWebSocket(symbol);
		};

		wsRefs.current[symbol] = ws;
	};

	// Function to auto-reconnect WebSocket
	const reconnectWebSocket = (symbol) => {
		clearTimeout(reconnectTimeouts.current[symbol]);
		reconnectTimeouts.current[symbol] = setTimeout(
			() => connectWebSocket(symbol),
			3000
		); // Reconnect after 3s
	};

	// Fetch initial prices using REST API
	const fetchInitialPrices = async () => {
		try {
			const response = await fetch(
				`https://api.binance.com/api/v3/ticker/price`
			);
			const data = await response.json();
			const initialPrices = {};
			data.forEach(({ symbol, price }) => {
				if (stockSymbols.includes(symbol)) {
					initialPrices[symbol] = parseFloat(price);
				}
			});
			setPrices(initialPrices);
		} catch (error) {
			console.error('❌ Error fetching initial prices:', error);
		}
	};

	useEffect(() => {
		if (stockSymbols.length === 0) return;

		fetchInitialPrices(); // Fetch initial prices before WebSocket updates

		stockSymbols.forEach((symbol) => connectWebSocket(symbol)); // Start WebSocket connections

		return () => {
			stockSymbols.forEach((symbol) => {
				wsRefs.current[symbol]?.close(); // Cleanup WebSockets
				clearTimeout(reconnectTimeouts.current[symbol]); // Clear timeouts
			});
		};
	}, [stockSymbols]);

	const [open, setOpen] = useState(false);
	const [selectedStock, setSelectedStock] = useState(null);

	// Handle opening modal with selected stock
	const handleClose = (stock) => {
		setSelectedStock(stock);
		setOpen(true);
	};

	const [makeCloseStocks] = useCloseStockMutation();

	const handleConfirmClose = async () => {
		const options = {
			close_amount: prices[selectedStock.stock_name],
			user_stock_id: selectedStock.id,
		};
		const response = await makeCloseStocks({
			stockName: selectedStock?.stock_name,
			data: options,
		});

		setOpen(false);
		if ('data' in response) {
			Swal.fire({
				title: 'Closed!',
				icon: 'success',
				showConfirmButton: false,
				timer: 1000,
			});
		}

		if ('error' in response) {
			Swal.fire({
				position: 'center',
				icon: 'error',
				text: `${response?.error?.data?.message}`,
				showConfirmButton: false,
				timer: 1000,
				allowOutsideClick: false,
				allowEscapeKey: false,
			});
		}
	};




  const taotalGainLoss = useMemo(() => {
	if (!symbols?.data || Object.keys(prices).length === 0) return 0;
  
	let count = 0;
  
	symbols.data.forEach((symbol) => {
	  if (symbol.trans_type === 1) {
		const stockCurrentPrice = prices[symbol.stock_name] || 0;
		count += (stockCurrentPrice - symbol.stock_current_price) * symbol.invest_amount;
	  }else{
		const stockCurrentPrice = prices[symbol.stock_name] || 0;
		count += (stockCurrentPrice - symbol.stock_current_price) * symbol.invest_amount * -1;
	  }
	});
  
	return count;
  }, [symbols, prices]);



	return (
		<div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-4">
			<h2 className="text-lg font-semibold text-center">Trading Account</h2>

			<div className="flex justify-center items-center">
				<div className="mt-2 space-y-1 text-gray-700 w-1/2 mx-auto">
					<div className="flex justify-between">
						<span>Balance:</span>
						<span className="font-semibold">{showAmountFormatted(userInfo?.acc_balance)}</span>
					</div>
					<div className="flex justify-between">
						<span>Equity:</span>
						<span className="font-semibold">{showAmountFormatted(userInfo?.acc_balance - taotalGainLoss, 8)}</span>
					</div>
					<div className="flex justify-between">
						<span>Margin:</span>
						<span className="font-semibold">5 118.14</span>
					</div>
					<div className="flex justify-between">
						<span>Free Margin:</span>
						<span className="font-semibold">32 941.96</span>
					</div>
					<div className="flex justify-between">
						<span>Margin Level (%):</span>
						<span className="font-semibold">743.63</span>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
				<div>
					<Dialog open={open} handler={() => setOpen(false)}>
						<DialogHeader>
							{selectedStock
								? `Close ${selectedStock.stock_name} Trade?`
								: 'Loading...'}
						</DialogHeader>
						<DialogBody>
							{selectedStock ? (
								<div className="space-y-2">
									<div>
										<strong>Stock:</strong> {selectedStock.stock_name}
									</div>
									<div>
										<strong>Trade Type:</strong>
										<span className="text-blue-500">
											{' '}
											{selectedStock.trans_type === 1 ? 'Buy' : 'Sell'}
										</span>
									</div>
									<div>
										<strong>Investment Amount:</strong>{' '}
										{selectedStock.invest_amount}
									</div>
									<div>
										<strong>Current Price:</strong>
										<span className="text-green-500">
											{prices[selectedStock.stock_name] || 'Loading...'}
										</span>
									</div>
									<p className="text-red-500 font-semibold">
										Are you sure you want to close this trade?
									</p>
								</div>
							) : (
								'Loading...'
							)}
						</DialogBody>
						<DialogFooter>
							<Button
								className="me-4"
								variant="gradient"
								color="red"
								onClick={() => setOpen(false)}
							>
								<span>Cancel</span>
							</Button>
							<Button
								variant="gradient"
								color="green"
								onClick={handleConfirmClose}
							>
								<span>Confirm</span>
							</Button>
						</DialogFooter>
					</Dialog>

					<h3 className="mt-4 text-lg font-semibold text-center">Positions</h3>
					{symbols?.data.map((symbol) => (
						<div
							key={symbol?.id}
							className="bg-gray-100 p-3 rounded-lg mt-2 cursor-pointer"
							onClick={() => handleClose(symbol)}
						>
							<div className="flex justify-between items-center  font-semibold">
								<span className="text-black">
									{symbol?.stock_name},{' '}
									<span className="text-blue-500">
										{symbol?.trans_type === 1 ? 'buy' : 'sell'}{' '}
										{symbol?.invest_amount}
									</span>
								</span>
								{symbol?.trans_type === 1
									? buyGainLoss(
											symbol?.invest_amount,
											symbol?.stock_current_price,
											prices[symbol?.stock_name]
									  )
									: sellGainLoss(
											symbol?.invest_amount,
											symbol?.stock_current_price,
											prices[symbol?.stock_name]
									  )}
							</div>
							<div className="text-gray-700 mt-1">
								<span>
									{prices[symbol?.stock_name]
										? prices[symbol?.stock_name]
										: 'Loading...'}{' '}
									→ {symbol?.stock_current_price}
								</span>
							</div>
						</div>
					))}
				</div>

				<div>
					<h3 className="mt-4 text-lg font-semibold text-center">Close</h3>
					{closeStocks?.data.map((closeStock) => (
						<div
							key={closeStock?.id}
							className="bg-gray-100 p-3 rounded-lg mt-2"
						>
							<div className="flex justify-between items-center text-blue-600 font-semibold">
								<span className="text-black">
									{closeStock?.stock_name},{' '}
									<span className="text-blue-500">
										close {closeStock?.invest_amount}
									</span>
								</span>
								<>
									{buyGainLoss(
										closeStock?.invest_amount,
										closeStock?.stock_current_price,
										closeStock?.close_amount
									)}
								</>
							</div>
							<div className="text-gray-700 mt-1">
								<span>
									{closeStock?.close_amount} → {closeStock?.stock_current_price}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Trade;
