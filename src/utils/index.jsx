export const formatDate = (timeStampValue) => {
	const date = new Date(timeStampValue);
	const day = date.getDate();
	const month = date.toLocaleString('en-GB', { month: 'long' });
	const year = date.getFullYear();
	return `${day} ${month}, ${year}`;
};

export const buyGainLoss = (expenseAmount, buyAmount, currentAmount) => {
	const result = (buyAmount - currentAmount) * expenseAmount;

	return (
		<span className={`${result > 0 ? 'text-green-600' : 'text-red-600'}`}>
			{result.toFixed(8)}
		</span>
	);
};

export const sellGainLoss = (expenseAmount, buyAmount, currentAmount) => {
	const result = (buyAmount - currentAmount) * expenseAmount * -1;

	return (
		<span className={`${result < 0 ? 'text-green-600' : 'text-red-600'}`}>
			{result < 0 ? Math.abs(result).toFixed(8) : `-${result.toFixed(8)}`}
		</span>
	);
};

export const balanceRatio = (balance) => {
	return (balance * 30) / 100;
};

export const isNotHaveEnoughBalance = (balance, inputAmount) => {
	if (inputAmount > balanceRatio(balance)) return true;
	else return false;
};

export const showAmountFormatted = (amount, toFixed = 2) => {
	if (amount == null || isNaN(amount)) return '0.00';

	return Number(amount)
		.toFixed(toFixed);
		//.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
