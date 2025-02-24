import { ChartCandlestick, Home, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hook';
import { logout } from '../../redux/features/auth/authSlice';

const TaskDashboard = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const dispatch = useAppDispatch();
	const handleLogout = () => {
		dispatch(
			logout()
		);
		navigate('/users/sign_in');
	};

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white p-5 transform ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform md:translate-x-0 md:relative md:w-64 z-50`}
			>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">Dasboard</h2>
					<button
						onClick={() => setIsSidebarOpen(false)}
						className="md:hidden text-white"
					>
						✕
					</button>
				</div>
				<nav className="space-y-4">
					<Link
						to="/"
						className={`flex items-center text-lg hover:text-gray-400 active:text-blue-600 ${
							location.pathname === '/' ? 'text-gray-400' : ''
						}`}
					>
						<Home size={20} className="mr-2" /> Home
					</Link>
					<Link
						to="/trade"
						className={`flex items-center text-lg hover:text-gray-400 active:text-blue-600 ${
							location.pathname === '/trade' ? 'text-gray-400' : ''
						}`}
					>
						<ChartCandlestick size={20} className="mr-2" /> Trade
					</Link>
				</nav>
				<button
					onClick={handleLogout}
					className="absolute bottom-5 flex items-center text-lg text-red-500 hover:text-red-400"
				>
					<LogOut size={20} className="mr-2" /> Logout
				</button>
			</div>

			{/* Overlay for mobile sidebar */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)}

			{/* Content Area */}
			<div className="flex-1 p-5">
			{/* Mobile Sidebar Toggle */}
			<button
					onClick={() => setIsSidebarOpen(true)}
					className="md:hidden text-gray-900 p-2"
				>
					<Menu size={24} />
				</button>
				{/* The Outlet renders the appropriate component based on the route */}
				<Outlet />
			</div>
		</div>
	);
};

export default TaskDashboard;
