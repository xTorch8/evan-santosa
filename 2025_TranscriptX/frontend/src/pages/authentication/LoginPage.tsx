import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Navbar from "../../components/Navbar";
import ExpandingCardLogin from "../../components/ExpandingCardLogin";
import API_PATH from "../../api/API_PATH";
import { decodeJWT } from "../../utils/Helper";


const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const authContext = useContext(AuthContext)
    const [noLogin, setNoLogin] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token){
            setNoLogin(false);
        }else{
            setNoLogin(true);
        }    
    })
    

    const handleLogin = async() => {
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try{
            const response = await axios.post(`${API_PATH}/api/auth/login`, {
                email: email,
                password: password,
            });

            const token = response.data.payload.access_token;
            const decoded = decodeJWT(token);
            const userId = decoded.payload.sub;

            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);

            authContext?.updateTokenHandler(token);
            alert("Login successful!");
            navigate("/Tools")
        }catch (err){
            setError("Login failed. Please check your email and password.");
        }
    };

    const handleRegister = async () => {
        navigate("/register");
    }

    const handleForgot = async () => {
        navigate("/forgot")
    }

    const inputStyle = "w-[400px] px-[4px] py-[16px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-color_secondary rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none";

    return (
        <>
            <Navbar currentPage="Login"/>
            {!noLogin && <div className="min-h-screen flex flex-row items-center justify-center bg-white">
                
                <div className="z-10 bg-color_secondary w-full max-w-[500px] min-h-[500px] flex flex-col align-items justify-content shadow-[0_5px_5px_rgba(0,0,0,0.25)]">
                    <h1 className="text-2xl font-bold text-center mb-[40px] mt-[50px]">Login</h1>

                    {error &&
                    <div className="text-[red] px-[4px] py-[4px] mb-[10px] ml-[42px] mr-[42px] bg-light_red">
                        {error}
                    </div>
                    }

                    <div>
                        <form className="space-y-[12px] flex flex-col items-center">

                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyle}
                            />
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyle}
                            />

                            <a onClick={handleForgot} className="text-biru no-underline hover:underline text-[16px] mt-[8px] mr-[280px] cursor-pointer">
                                Forgot Password?
                            </a>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleLogin}
                                    className="cursor-pointer shadow-[0_3px_3px_rgba(0,0,0,0.25)] w-[350px] mt-[20px] bg-color_primary text-[18px] font-bold py-[10px] rounded-lg hover:bg-grey border-none transition-all duration-300 ease-in-out hover:ring-2 ring-dark_grey"
                                >
                                    Login
                                </button>    
                            </div>
                            
                        </form>    
                    </div>
                

                    <p className="text-center text-sm mt-4">
                    Don't have an account?{" "}
                        <a onClick={handleRegister} className="text-biru no-underline hover:underline cursor-pointer">
                            Create one
                        </a>
                    </p>
                </div>

                <div className="flex justify-center items-center">
                    <ExpandingCardLogin/>   
                </div>
            </div>
            }
            {noLogin && 
            <div className="flex flex-row h-screen items-center justify-center">
                <p>Please go back.</p>
            </div>
            }
        </>
    );

};

export default LoginPage