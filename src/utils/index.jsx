export const formatDate = (timeStampValue) => {
	const date = new Date(timeStampValue);
	const day = date.getDate();
	const month = date.toLocaleString('en-GB', { month: 'long' });
	const year = date.getFullYear();
	return `${day} ${month}, ${year}`;
};


export const buyGainLoss = (expenseAmount, buyAmount, currentAmount) => {
	const result =  (currentAmount - buyAmount) * expenseAmount;

	return <span className={`${result > 0 ? 'text-green-600' : 'text-red-600'}`}>{result.toFixed(3)}</span>
}

export const sellGainLoss = (expenseAmount, buyAmount, currentAmount) => {
	const result =  (currentAmount - buyAmount) * expenseAmount;

	return <span className={`${result < 0 ? 'text-green-600' : 'text-red-600'}`}>{result < 0 ? Math.abs(result).toFixed(3) : `-${result.toFixed(3)}`}</span>
}
