import { useState } from "react";
import axios from "axios";

const Withdraw = () => {
  const [currency, setCurrency] = useState("USDTBSC");
  const [amount, setAmount] = useState("50");
  const [address, setAddress] = useState("0x4987014BA298b0ab279121918eE954e275078653");
  //const [payoutId, setPayoutId] = useState("");
  const [message, setMessage] = useState("");
  //const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:5000/api/v1/payment/payout", {
        currency,
        amount,
        address,
      });

      setMessage(`✅ Payout Created! ID: ${response.data.id}`);
      //setPayoutId(response.data.id); // Store payout ID for status check
    } catch (error) {
      setMessage("❌ Failed to create payout.");
      console.error(error.response?.data || error.message);
    }
    setLoading(false);
  };

/*   const checkPayoutStatus = async () => {
    if (!payoutId) {
      setStatus("⚠️ Please create a payout first.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/payout/${payoutId}`);
      setStatus(`🔄 Payout Status: ${response.data.status}`);
    } catch (error) {
      setStatus("❌ Failed to fetch payout status.");
      console.error(error.response?.data || error.message);
    }
    setLoading(false);
  }; */

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Create Payout</h2>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Currency (e.g., BTC)"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Recipient Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePayout}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Send Payout"}
          </button>
          {message && <p className="text-sm text-center text-gray-700">{message}</p>}
        </div>

        {/* <hr className="my-6" />

        <h2 className="text-xl font-semibold text-center text-gray-700">Check Payout Status</h2>
        <button
          onClick={checkPayoutStatus}
          disabled={loading}
          className="w-full mt-3 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
        {status && <p className="text-sm text-center mt-3 text-gray-700">{status}</p>} */}
      </div>
    </div>
  );
};

export default Withdraw;
