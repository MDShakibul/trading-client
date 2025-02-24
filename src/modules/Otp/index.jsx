/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import Button from '../../components/Button';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSignUpVerifiedOtpMutation } from '../../redux/api/apiSlice';
import { useAppDispatch } from '../../redux/hook';
import { register } from '../../redux/features/auth/authSlice';

const Otp = () => {
    const [otpVerify, { isLoading, isError, isSuccess }] = useSignUpVerifiedOtpMutation();
	const [otp, setOtp] = useState(["", "", "", "", ""]);
	const inputRefs = useRef([]);
    const [isDisabled, setIsDisabled] = useState(false);

    const location = useLocation();
    const phone_number = location?.state?.data?.data?.phone_number || '';
    const name = location?.state?.data?.data?.name || '';
    const password = location?.state?.data?.data?.password || '';




	const handleChange = (e, index) => {
		const value = e.target.value;
		if (value.match(/[0-9]/)) {
			const newOtp = [...otp];
			newOtp[index] = value;
			setOtp(newOtp);
			if (index < otp.length - 1 && value !== "") {
				inputRefs.current[index + 1].focus();
			}
		}
	};


	const handleBackspace = (e, index) => {
		if (e.key === "Backspace" && otp[index] !== "") {
			e.preventDefault();
			
			const newOtp = [...otp];
			newOtp[index] = "";
			setOtp(newOtp);

			if (index > 0) {
				inputRefs.current[index - 1].focus();
			}
		}
	};
    


    const navigate = useNavigate();
    const dispatch = useAppDispatch();


	const handleSubmit = async(e) => {
		e.preventDefault();
        const options = {
            data:{

                phone_number,
                password,
                name,
                otp: parseInt(otp.join(''))
            }
        }



        const response = await otpVerify(options);

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
                            dispatch(
                                register({
                                    user_id: response?.data?.data?.user_id,
                                    access_token: response?.data?.data?.access_token,
                                })
                            );
                                navigate('/');
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
					OTP Verify
				</div>
				<div className="text-xl font-light mb-10">
					Please enter correct OTP
				</div>

				{/* OTP Form */}
				<form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
					<div className="flex space-x-4 mb-8">
						{otp.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)} // Store input reference
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(e, index)}
								onKeyDown={(e) => handleBackspace(e, index)}
								className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:border-primary"
							/>
						))}
					</div>

					<Button label="Verify OTP" type="submit" disabled={isDisabled} className="w-3/4 mb-2" />
				</form>

				
			</div>
		</div>
	);
};

export default Otp;
