import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Navbar from "../../components/Navbar";
import checkSign from "../../assets/check-sign.svg";
import API_PATH from "../../api/API_PATH";

const ForgotPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const inputStyle = "w-[400px] px-[4px] py-[16px] mt-[8px] mb-[20px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-color_secondary rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none";

    const handleForgot = async() => {
        setError("");

        try{
            const response = await axios.post(`${API_PATH}/api/auth/request-password-reset`, {
                email: email,
            });

            if (response.status === 200){
                setShowModal(true);
            }
        }catch(err){
            setError("Email not Found. Please check and try again.");
        }
    }

    const handleLogin = async () => {
        navigate("/login")
    }

    return (
        <>
            <Navbar currentPage="Forgot"/>
            <div className="min-h-screen flex flex-row items-center justify-center bg-white">

                <div className="z-10 bg-color_secondary w-full max-w-[500px] min-h-[400px] flex flex-col align-items justify-content shadow-[0_5px_5px_rgba(0,0,0,0.25)]">
                    <h1 className="text-2xl font-bold text-center mb-[10px] mt-[30px]">Forgot Password?</h1>

                    <p className="ml-[50px] max-w-[430px] mb-[30px]">Please enter the email address you’d like your password reset information sent to</p>

                    {error && (
                        <div className="text-[red] px-[4px] py-[4px] mb-[10px] ml-[42px] mr-[42px] bg-light_red">
                            {error}
                        </div>
                    )}

                    <div>
                        <form className="space-y-[12px] flex flex-col items-center" onSubmit={(e) => {
                            e.preventDefault();
                            handleForgot();
                        }}>

                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyle}
                            />
                            <div>
                                <button
                                    type="submit"
                                    className="cursor-pointer shadow-[0_3px_3px_rgba(0,0,0,0.25)] w-[408px] mt-[20px] bg-color_primary text-[18px] font-bold py-[10px] rounded-lg hover:bg-grey border-none transition-all duration-300 ease-in-out hover:ring-2 ring-dark_grey"
                                >
                                    Request Reset Link
                                </button>    
                            </div>
                            
                        </form>    
                    </div>
                

                    <p className="text-center text-sm mt-4">
                    Remember your password?{" "}
                        <a onClick={handleLogin} className="text-biru no-underline hover:underline cursor-pointer">
                            Log in
                        </a>
                    </p>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
                        <div className="fixed inset-0 flex justify-center items-center opacity-70 z-49 bg-color_primary min-w-screen min-h-screen">

                        </div>
                        <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
                            <h2 className="text-xl font-bold mb-0">Success!</h2>
                            <img src={checkSign} alt="check" className="size-[96px]" />
                            <p className="break-all max-w-[300px] text-center mb-auto flex flex-col items-center">Password reset token has been sent to <b className="text-center mb-auto">{email}</b></p>
                            <p>____________________________________________</p>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    navigate(`/reset-password`);
                                }}
                                className="bg-ijo text-color_primary font-bold px-[20px] py-[6px] mb-[8px] ml-auto mr-[10px] shadow border-none rounded hover:bg-ijoHover transition-all duration-300 ease-in-out shadow-[0_2px_3px_rgba(0,0,0,0.25)] cursor-pointer"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );

};

export default ForgotPage