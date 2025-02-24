/* eslint-disable react/prop-types */
const Input = ({
	label = '',
	name = '',
	type = 'text',
	className = '',
	inputClassName = '',
	isRequired = false,
	placeholder = '',
	value='',
	onChange = () => {}
}) => {
	return (
		<div className={`w-3/4 ${className}`}>
			<label htmlFor={name} className="block text-sm fpmt-medium text-gray-800">
				{label}
				<span className=" text-red-700 ">{isRequired ? '*' : null}</span>
			</label>
			<input
				type={type}
				id={name}
				className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${inputClassName}`}
				placeholder={placeholder}
				name={name}
				required={isRequired}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
};

export default Input;
