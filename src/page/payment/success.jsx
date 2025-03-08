import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const Success = () => {
    const navigate = useNavigate(); 

    return (
        <div className="flex flex-col  items-center justify-center h-screen">
            <h1 className="text-2xl text-green-500">Payment Success</h1>
            <Button color="green" className="mt-5" onClick={() => navigate("/")}>Back Home</Button>
        </div>
    );
};

export default Success;
