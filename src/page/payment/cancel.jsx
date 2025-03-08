import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const Cancel = () => {
    const navigate = useNavigate(); 

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl text-red-500">Payment Cancel</h1>
            <Button color="red" className="mt-5" onClick={() => navigate("/")}>
                Back Home
            </Button>
        </div>
    );
};

export default Cancel;
