import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import checkSign from "../../assets/check-sign.svg";
import API_PATH from "../../api/API_PATH";

const ResetPage = () => {
    
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const inputStyle = "w-[400px] px-[4px] py-[16px] mt-[8px] mb-[20px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-color_secondary rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none";

    const handleReset = async () => {
        setError("");

        if (!token || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)){
            setError("Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.");
            return;
        }

        try {
            const response = await axios.post(`${API_PATH}/api/auth/reset-password`, {
                token,
                new_password: newPassword,
            });

            if (response.status === 200) {
                setShowModal(true);
            }
        } catch (err) {
            setError("Reset failed. Token may be expired or invalid.");
        }
    };

    return (
        <>
            <Navbar currentPage="Reset" />

            <div className="min-h-screen flex justify-center items-center bg-white">
                <div className="z-10 bg-color_secondary w-full max-w-[500px] min-h-[450px] flex flex-col align-items justify-content shadow-[0_5px_5px_rgba(0,0,0,0.25)]">
                    <form
                        className="space-y-[12px] flex flex-col items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleReset();
                        }}
                    >
                        <h1 className="text-2xl font-bold mb-4 text-center mt-[50px]">Reset Your Password</h1>
                        {error && <p className="text-[red] px-[4px] py-[4px] mb-[10px] ml-[42px] mr-[42px] bg-light_red max-w-[400px]">{error}</p>}
                        <input 
                            type="text" 
                            placeholder="Enter reset token from email"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputStyle}
                        />
                        <button
                            type="submit"
                            className="cursor-pointer shadow-[0_3px_3px_rgba(0,0,0,0.25)] w-[408px] mt-[20px] bg-color_primary text-[18px] font-bold py-[10px] rounded-lg hover:bg-grey border-none transition-all duration-300 ease-in-out hover:ring-2 ring-dark_grey"
                        >
                            Reset Password
                        </button>
                    </form>    
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
                        <div className="fixed inset-0 flex justify-center items-center opacity-70 z-49 bg-color_primary min-w-screen min-h-screen">

                        </div>
                        <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
                            <h2 className="text-xl font-bold mb-0">Success!</h2>
                            <img src={checkSign} alt="check" className="size-[96px]" />
                            <p className="break-all max-w-[300px] text-center mb-auto flex flex-col items-center">Reset Password Successful</p>
                            <p>____________________________________________</p>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    navigate(`/login`);
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

export default ResetPage;
