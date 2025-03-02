import React, { useState } from "react";
import axios from "axios";

const Payment = () => {
    const [invoice, setInvoice] = useState(null);

    const createInvoice = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/v1/payment/create-invoice", {
                price_amount: 0.5, // $5
                price_currency: "usd",
                //pay_currency: "usdttrc20", 
            });

            setInvoice(response?.data?.data);
        } catch (error) {
            console.error("Error creating invoice:", error);
        }
    };
    console.log(invoice)

    return (
        <div className="container">
            <h1>NOWPayments Demo</h1>
            <button onClick={createInvoice}>Create Invoice</button>

            {invoice && (
                <div className="invoice-box">
                    <h2>Send Deposit</h2>
                    <img src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${invoice.pay_address}`} alt="QR Code" />
                    {/* <p>Amount: {invoice.price_amount} {invoice.pay_currency.toUpperCase()}</p> */}
                    <p>Address: {invoice.pay_address}</p>
                    <a href={invoice?.invoice_url} target="_blank" rel="noopener noreferrer">
                        Pay Now
                    </a>
                </div>
            )}
        </div>
    );
};

export default Payment;
