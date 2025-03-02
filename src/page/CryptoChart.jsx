/* eslint-disable no-unused-vars */
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	IconButton,
	Input,
	Typography,
} from '@material-tailwind/react';
import { CircleX } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import Chart from 'react-apexcharts';
import Swal from 'sweetalert2';
import { useStockBuySellMutation } from '../redux/api/apiSlice';
import { isNotHaveEnoughBalance, showAmountFormatted } from '../utils';
import { useSelector } from 'react-redux';

const TradingChart = () => {
	const [series, setSeries] = useState([{ data: [] }]);
	/* 	const [volumeSeries, setVolumeSeries] = useState([{ data: [] }]); */
	const [symbol, setSymbol] = useState('ethbtc');
	const [symbols, setSymbols] = useState([]);
	const [intervals, setIntervals] = useState('1m');
	const [modalType, setModalType] = useState('');
	const [currentRate, setCurrentRate] = useState(0);
	const [amount, setAmount] = useState('');
	const [open, setOpen] = useState(false);
	const [showErrorMessage, setShowErrorMessage] = useState(false);
	const [showErrorMessageForBalanec, setShowErrorMessageForBalanec] = useState(false);



	// User information
	const userInfo = useSelector((state) => state.userInfo.userInformation); 

	// Fetch available trading pairs
	useEffect(() => {
		fetch('https://api.binance.com/api/v3/ticker/price')
			.then((response) => response.json())
			.then((data) => {
				setSymbols(data.map((item) => item.symbol.toLowerCase()));
			})
			.catch((error) => console.error('Error fetching symbols:', error));
	}, []);

	// Fetch historical candlestick data
	useEffect(() => {
		fetch(
			`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${intervals}&limit=50`
		)
			.then((response) => response.json())
			.then((data) => {
				const formattedData = data.map((d) => ({
					x: new Date(d[0]),
					y: [
						parseFloat(d[1]),
						parseFloat(d[2]),
						parseFloat(d[3]),
						parseFloat(d[4]),
					],
				}));

				/* 				const volumeData = data.map((d) => ({
					x: new Date(d[0]),
					y: parseFloat(d[5]),
				})); */

				setSeries([{ data: formattedData }]);
				/* setVolumeSeries([{ data: volumeData }]); */
			})
			.catch((error) =>
				console.error('Error fetching historical data:', error)
			);
	}, [symbol, intervals]);

	// WebSocket for real-time price updates
	useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
  
    ws.binaryType = "arraybuffer"; // Improve WebSocket performance
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //console.log(event?.data?.p)
      setCurrentRate(parseFloat(data.p));
    };
  
    ws.onerror = (error) => console.error("WebSocket error:", error);
  
    return () => {
      ws.close();
    };
  }, [symbol]);


	// WebSocket for real-time updates
	useEffect(() => {
		const ws = new WebSocket(
			`wss://stream.binance.com:9443/ws/${symbol}@kline_${intervals}`
		);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.k) {
				const kline = data.k;
				const newKline = {
					x: new Date(kline.t),
					y: [
						parseFloat(kline.o),
						parseFloat(kline.h),
						parseFloat(kline.l),
						parseFloat(kline.c),
					],
				};

				/* const newVolume = {
					x: new Date(kline.t),
					y: parseFloat(kline.v),
				}; */

				setSeries((prevSeries) => [
					{ data: [...prevSeries[0].data, newKline].slice(-50) },
				]);
				/* setVolumeSeries((prevVolume) => [
					{ data: [...prevVolume[0].data, newVolume].slice(-50) },
				]); */
			}
		};

		ws.onerror = (error) => console.error('WebSocket error:', error);

		return () => {
			ws.close();
		};
	}, [symbol, intervals]);

	// Buy/Sell Modal
	const handleBuySellClick = (type) => {
		setModalType(type);
		setOpen(!open);
		setAmount("");
	};

	const [stockBuySell, { isLoading, isError, isSuccess }] =
		useStockBuySellMutation();
	const handleConfirm = async () => {
		if (!amount) {
			setShowErrorMessage(true);
			return;
		}

		if(isNotHaveEnoughBalance(userInfo?.acc_balance, parseFloat(amount))){
			setShowErrorMessageForBalanec(true);
			return;
		}

		const options = {
			data: {
				stock_name: symbol?.toUpperCase(),
				trans_type: modalType == 'buy' ? '1' : '2',
				invest_amount: parseFloat(amount),
				stock_current_price: parseFloat(currentRate),
			},
		};
		
		const response = await stockBuySell(options);
		if ('data' in response) {
			setOpen(!open);
			Swal.fire({
				position: 'center',
				icon: 'success',
				text: `${response?.data?.message}`,
				showConfirmButton: false,
				timer: 2000,
				allowOutsideClick: false,
				allowEscapeKey: false,
			}).then((result) => {
				
				if (result.dismiss === Swal.DismissReason.timer) {
					
					setAmount('');
				}
			});
		}

		if ('error' in response) {
			setOpen(!open);
			setAmount('');
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

	// ApexCharts options
	const lastPrice =
		series[0]?.data?.length > 0
			? series[0].data[series[0].data.length - 1].y[3]
			: currentRate;

	const isPriceDropping = lastPrice > currentRate;

	const options = {
		chart: {
			type: 'candlestick',
			height: 500,
			background: '#0f172a',
			foreColor: '#ffffff',
		},
		xaxis: { type: 'datetime', labels: { style: { colors: '#ffffff' } } },
		yaxis: {
			tooltip: { enabled: true },
			labels: { style: { colors: '#ffffff' } },
		},
		grid: { borderColor: '#4b5563' },
		annotations: {
			yaxis: [
				{
					y: currentRate,
					borderColor: isPriceDropping ? '#F6465D' : '#2EBD85',
					label: {
						borderColor: isPriceDropping ? '#F6465D' : '#2EBD85',
						style: {
							color: '#fff',
							background: isPriceDropping ? '#F6465D' : '#2EBD85',
						},
						text: `Latest Price: ${currentRate}`,
					},
				},
			],
		},
	};

	/* 	const volumeOptions = {
		chart: {
			type: 'bar',
			height: 150,
			background: '#0f172a',
			foreColor: '#ffffff',
		},
		xaxis: { type: 'datetime', labels: { style: { colors: '#ffffff' } } },
		yaxis: { labels: { style: { colors: '#ffffff' } } },
		grid: { borderColor: '#4b5563' },
	}; */

	return (
		<div
			style={{ background: '#0f172a', padding: '20px', borderRadius: '10px' }}
		>
		<div className='flex justify-between mb-3'>

			<h2 className='text-white text-2xl'>Real-Time Trading Chart</h2>
			<h2 className='text-white text-2xl'>Total Balance: {showAmountFormatted(userInfo?.acc_balance)}</h2>
		</div>

			<select
				onChange={(e) => {
					setSymbol(e.target.value);
					setCurrentRate(0);
				}}
				value={symbol}
				style={{ padding: '5px', marginBottom: '10px' }}
			>
				{symbols.map((sym) => (
					<option key={sym} value={sym}>
						{sym.toUpperCase()}
					</option>
				))}
			</select>

			<select
				onChange={(e) => setIntervals(e.target.value)}
				value={intervals}
				style={{ padding: '5px', marginBottom: '10px', marginLeft: '10px' }}
			>
				<option value="1s">1 Second</option>
				<option value="1m">1 Minute</option>
				<option value="30m">30 Minutes</option>
				<option value="1h">1 Hour</option>
				<option value="12h">12 Hours</option>
				<option value="1d">1 Day</option>
				<option value="1w">1 Week</option>
				<option value="1M">1 Month</option>
			</select>

			<Chart
				options={options}
				series={series}
				type="candlestick"
				height={500}
			/>
			{/* 			<Chart
				options={volumeOptions}
				series={volumeSeries}
				type="bar"
				height={200}
			/> */}

			{currentRate ? (
				<div className="flex w-max gap-4">
					<Button onClick={() => handleBuySellClick('buy')} color="green">
						Buy
					</Button>
					<Button onClick={() => handleBuySellClick('sell')} color="red">
						Sell
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-4">
					<Button color="green" loading={true}>
						Loading
					</Button>
					<Button color="red" loading={true}>
						Loading
					</Button>
				</div>
			)}

			<Dialog
				size="sm"
				open={open}
				handler={handleBuySellClick}
				className="p-4"
			>
				<DialogHeader className="relative m-0 block">
					<Typography variant="h4" color="blue-gray">
						{modalType === 'buy' ? 'Buy' : 'Sell'} {symbol.toUpperCase()}
					</Typography>
					
					<Typography className="mt-1 font-normal text-gray-600">
						Current Rate:{' '}
						<strong
							className={isPriceDropping ? 'text-red-500' : 'text-green-500'}
						>
							{currentRate}
						</strong>
					</Typography>
					<IconButton
						size="sm"
						variant="text"
						className="!absolute right-3.5 top-3.5"
						onClick={handleBuySellClick}
					>
						<CircleX className="stroke-2" size={20} />
					</IconButton>
				</DialogHeader>
				<DialogBody className="space-y-4 pb-6">
					<div>
						<Typography
							variant="small"
							color="blue-gray"
							className="mb-2 text-left font-medium"
						>
							Expense <small className="text-red-600">*</small>
						</Typography>
						<Input
							type="number"
							color="gray"
							size="lg"
							placeholder="eg. 10 or 10.50"
							name="expenses"
							className="placeholder:opacity-100 focus:!border-t-gray-900"
							containerProps={{
								className: '!min-w-full',
							}}
							labelProps={{
								className: 'hidden',
							}}
							value={amount}
							onChange={(e) => {
								setAmount(e.target.value);
								setShowErrorMessage(false);
								setShowErrorMessageForBalanec(false);
							}}
						/>
						{showErrorMessage ? (
							<small className="text-red-600">Expense required</small>
						) : null}
						{showErrorMessageForBalanec ? (
							<small className="text-red-600">Not have enough balance for expenses</small>
						) : null}
					</div>
				</DialogBody>
				<DialogFooter>
					<Button className="ml-auto" onClick={handleConfirm}>
						Confirm
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
};

export default TradingChart;
