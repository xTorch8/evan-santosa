import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import ExpandingCard from "../../components/ExpandingCard";
import { API_PATH } from "../../api/API_PATH";
import checkSign from "../../assets/check-sign.svg";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const[loading, setLoading] = useState(false);
    const[error, setError] = useState("");
    const[successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const inputStyle = "w-[400px] px-[4px] py-[12px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const { name, email, password, confirmPassword } = formData;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all the fields.");
            return;
        }
        if (password != confirmPassword){
            setError("Passwords don't match")
            return;
        }

        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)){
            setError("Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character.");
            return;
        }

        try{
            setLoading(true);
            const response = await fetch(`${API_PATH}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                }),
            });

            const result = await response.json();

            if (result.message === "User registered, please verify your email."){
                setShowModal(true);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            }
            else if (result.message === "Email already registered") {
                setError("An account with this email already exists.");
                setShowModal(false);
            }
        }catch(err){
            setError("Failed to register. Please check your network connection.");
        }finally{
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        navigate("/login");
    }

    return (
        <>
            <Navbar currentPage="Register"/>
            <div className="min-h-screen flex flex-row items-center justify-center bg-white">

                <div className="flex justify-center items-center">
                <ExpandingCard/>   
                </div>
                
                <div className="z-10 bg-grey w-full max-w-[500px] min-h-[500px] flex flex-col align-items justify-content shadow-[0_5px_5px_rgba(0,0,0,0.25)]">
                    <h1 className="text-2xl font-bold text-center">Register</h1>

                    {error && (
                    <div className="text-[red] px-[4px] py-[4px] mb-[10px] ml-[42px] mr-[42px] bg-light_red">
                        {error}
                    </div>
                    )}

                    {successMessage && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
                        {successMessage}
                    </div>
                    )}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-[12px] flex flex-col justify-center items-center">
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={inputStyle}
                            />

                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={inputStyle}
                            />
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={inputStyle}
                            />
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={inputStyle}
                            />
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer shadow-[0_3px_3px_rgba(0,0,0,0.25)] w-[350px] mt-[30px] bg-color_primary text-[18px] font-bold py-[10px] rounded-lg hover:bg-color_secondary border-none transition-all duration-300 ease-in-out hover:ring-2 ring-dark_grey"
                                >
                                    {loading ? "Signing up..." : "Sign in"}
                                </button>    
                            </div>
                            
                        </form>    
                    </div>
                

                    <p className="text-center text-sm mt-4">
                    Already have an account?{" "}
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
                            <p className="break-all max-w-[290px] text-center mb-auto flex flex-col items-center"><strong>A verification email has been sent.</strong>
                                Please check your inbox and verify your email before logging in.</p>
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
        
    )

};

export default RegisterPage