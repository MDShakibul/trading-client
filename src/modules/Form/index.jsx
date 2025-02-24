/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
	useCreateUserMutation,
	useLoginMutation,
} from '../../redux/api/apiSlice';
import { login } from '../../redux/features/auth/authSlice';
import { useAppDispatch } from '../../redux/hook';

const Form = ({ isSignInPage = true }) => {
	const [isDisabled, setIsDisabled] = useState(false);
	const [signup, { isLoading, isError, isSuccess }] = useCreateUserMutation();
	const [signin, { isSignInLoading, isSignInError, isSignInSuccess }] =
		useLoginMutation();
	const navigate = useNavigate();
	const [data, setData] = useState({
		...(!isSignInPage && {
			name: '',
		}),
		phone_number: '',
		password: '',
	});

	const dispatch = useAppDispatch();
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsDisabled(true);
		let response;

		if (isSignInPage) {
			const options = {
				data,
			};
			response = await signin(options);
		} else {
			response = await signup(data);
		}

		if ('data' in response) {
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
					if (isSignInPage) {
						dispatch(
							login({
								user_id: response?.data?.data?.user_id,
								access_token: response?.data?.data?.access_token,
							})
						);
						navigate('/');
					} else {
						navigate('/users/otp', { state: { data: response?.data } });
					}
				}
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
			setIsDisabled(false);
		}
	};

	return (
		<div className="bg-[#e1edff] h-screen flex justify-center items-center rounded">
			<div className="bg-white w-[600px] h-[800px] shadow-lg flex flex-col justify-center items-center">
				<div className="text-4xl font-extrabold ">
					Welcome {isSignInPage && 'Back'}
				</div>
				<div className="text-xl font-light mb-10">
					{' '}
					{isSignInPage
						? 'Sing in to  get explore'
						: 'Sign up to get started'}{' '}
				</div>

				<form
					className="w-full flex flex-col items-center"
					onSubmit={handleSubmit}
				>
					{!isSignInPage && (
						<Input
							label="Name"
							name="name"
							placeholder="Enter your full name"
							className="mb-6"
							isRequired={true}
							value={data?.name}
							onChange={(e) => setData({ ...data, name: e.target.value })}
						/>
					)}
					<Input
						label="Email Address"
						name="phone_number"
						type="email"
						placeholder="Enter your email"
						className="mb-6"
						isRequired={true}
						value={data?.phone_number}
						onChange={(e) => setData({ ...data, phone_number: e.target.value })}
					/>
					<Input
						label="Password"
						type="password"
						name="password"
						placeholder="Enter your password"
						className={isSignInPage ? 'mb-2' : 'mb-14'}
						isRequired={true}
						value={data?.password}
						onChange={(e) => setData({ ...data, password: e.target.value })}
					/>
					{isSignInPage && (
						<div className="w-full text-right mb-14 mr-32">
							<Link to="/users/forgot-password" className="text-blue-600 cursor-pointer hover:underline">
								Forgot Password?
							</Link>
						</div>
					)}
					<Button
						label={isSignInPage ? 'Sign in' : 'Sign up'}
						type="submit"
						disabled={isDisabled}
						className="w-3/4 mb-2"
					/>
				</form>
				<div>
					{isSignInPage ? "Didn't have an account" : 'Alredy have an account?'}{' '}
					<span
						className="text-primary cursor-pointer underline"
						onClick={() => {
							navigate(`/users/${!isSignInPage ? 'sign_in' : 'sign_up'}`);
						}}
					>
						{isSignInPage ? 'Sign up' : 'Sign in'}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Form;
