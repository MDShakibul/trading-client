/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { Button } from "@material-tailwind/react";
import { useSelector } from "react-redux";

const Payment = () => {
    const [invoice, setInvoice] = useState(null);
    const token = useSelector((state) => state?.auth?.access_token);

    const createInvoice = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/payment/create-invoice",
                {
                    price_amount: 2, // $50
                },
                {
                    headers: {
                        authorization: token, // Add your token
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response?.data?.data);
            setInvoice(response?.data?.data);

            if(response?.data?.data && response?.data?.data?.invoice_url){
                window.location.href = response?.data?.data?.invoice_url;
            }
                else{
                console.log('Failed to create invoice: ', response?.data?.data);
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
        }
    };
    

    return (
        <div className="container">
            <h1>NOWPayments Demo</h1>
            <Button color="green" onClick={createInvoice}>Create Invoice</Button>

            {/* {invoice && (
                <div className="invoice-box">
                    <h2>Send Deposit</h2>
                    <img src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${invoice.pay_address}`} alt="QR Code" />
                    <p>Amount: {invoice.price_amount} {invoice.pay_currency.toUpperCase()}</p>
                    <p>Address: {invoice.pay_address}</p>
                    <a href={invoice?.invoice_url} target="_blank" rel="noopener noreferrer">
                        Pay Now
                    </a>
                </div>
            )} */}
        </div>
    );
};

export default Payment;
