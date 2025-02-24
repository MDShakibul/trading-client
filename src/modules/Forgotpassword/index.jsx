/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
	useForgotPasswordMutation,
	useResetPasswordMutation,
} from '../../redux/api/apiSlice';

const Forgotpassword = ({ isForgotPage = true }) => {
	const [isDisabled, setIsDisabled] = useState(false);
	const [resetPassword, { isLoading, isError, isSuccess }] = useResetPasswordMutation();
	const [forgotPassword, { isforgotPasswordLoading, isforgotPasswordError, isforgotPasswordSuccess }] =
	useForgotPasswordMutation();
	const navigate = useNavigate();
	const [data, setData] = useState({
		...(isForgotPage
			? {
					phone_number: '',
			  }
			: {
					new_password: '',
					confirm_password: '',
			  }),
	});

	const { token } = useParams();
	//console.log(token)
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsDisabled(true);
		let response;

		if (isForgotPage) {
			const options = {
				data,
			};

			response = await forgotPassword(options);
		} else {
			if(data?.new_password !== data?.confirm_password){
				Swal.fire({
					position: 'center',
					icon: 'error',
					text: `Password does not match`,
					showConfirmButton: false,
					timer: 1000,
					allowOutsideClick: false,
					allowEscapeKey: false,
				});
				setIsDisabled(false);
				return 0;
			}
			response = await resetPassword({token, data});
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
					if (isForgotPage) {

						//navigate('/');
					} else {
						navigate('/users/sign_in');
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
					Welcome Back
				</div>
				<div className="text-xl font-light mb-10">
					{' '}
					{isForgotPage
						? 'Enter email if you forgot'
						: 'Enter your new password'}{' '}
				</div>

				<form
					className="w-full flex flex-col items-center"
					onSubmit={handleSubmit}
				>
					{isForgotPage && (
						<Input
							label="Email Address"
							name="phone_number"
							type="email"
							placeholder="Enter your email"
							className="mb-6"
							isRequired={true}
							value={data?.phone_number}
							onChange={(e) =>
								setData({ ...data, phone_number: e.target.value })
							}
						/>
					)}
					{!isForgotPage && (
						<>
							<Input
								label="New Password"
								type="password"
								name="new_password"
								placeholder="Enter your new password"
								className="mb-6"
								isRequired={true}
								value={data?.new_password}
								onChange={(e) =>
									setData({ ...data, new_password: e.target.value })
								}
							/>
							<Input
								label="Confirm Password"
								type="password"
								name="confirm_password"
								placeholder="Enter your confirm password"
								className="mb-6"
								isRequired={true}
								value={data?.confirm_password}
								onChange={(e) =>
									setData({ ...data, confirm_password: e.target.value })
								}
							/>
						</>
					)}

					<Button
						label={isForgotPage ? 'Verify' : 'Confirm'}
						type="submit"
						disabled={isDisabled}
						className="w-3/4 mb-2"
					/>
				</form>
				<div>
					{isForgotPage ? "Didn't have an account" : 'Alredy have an account?'}{' '}
					<span
						className="text-primary cursor-pointer underline"
						onClick={() => {
							navigate(`/users/sign_in`);
						}}
					>
						Sign in
					</span>
				</div>
			</div>
		</div>
	);
};

export default Forgotpassword;
