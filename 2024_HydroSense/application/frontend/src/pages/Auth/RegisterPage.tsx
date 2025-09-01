import React, { useState } from "react";
// import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const navigate = useNavigate();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData({ ...formData, [id]: value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setError("");
		setSuccessMessage("");

		const { firstName, lastName, email, password, confirmPassword } = formData;

		if (!firstName || !lastName || !email || !password || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
		if (!passwordRegex.test(password)) {
			setError("Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.");
			return;
		}

		try {
			setLoading(true);
			const response = await fetch("https://api.hydrosense.nextora.my.id/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					first_name: firstName,
					last_name: lastName,
					email: email,
					password: password,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSuccessMessage(result.message);
				setFormData({
					firstName: "",
					lastName: "",
					email: "",
					password: "",
					confirmPassword: "",
				});
				navigate("../login");
			} else {
				setError(result.message || "Something went wrong. Please try again.");
			}
		} catch (err) {
			setError("Failed to register. Please check your network connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="bg-[#002B58] p-8 rounded-lg shadow-lg max-w-sm w-full">
				<h2 className="text-3xl font-bold text-center text-white mb-6">Register</h2>

				{error && <p className="text-red-500 text-center mb-4">{error}</p>}
				{successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

				<form id="style-7" className="max-h-[400px] overflow-y-auto" onSubmit={handleSubmit}>
					<div className="mb-2">
						<label htmlFor="firstName" className="block text-lg text-white text-base">
							First Name
						</label>
						<input
							type="text"
							id="firstName"
							value={formData.firstName}
							onChange={handleInputChange}
							placeholder="Enter your First Name"
							className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div className="mb-2 mt-2">
						<label htmlFor="lastName" className="block text-lg text-white text-base">
							Last Name
						</label>
						<input
							type="text"
							id="lastName"
							value={formData.lastName}
							onChange={handleInputChange}
							placeholder="Enter your Last Name"
							className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div className="mb-2 mt-2">
						<label htmlFor="email" className="block text-lg text-white text-base">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Enter your email"
							className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div className="mb-2 mt-2">
						<label htmlFor="password" className="block text-lg text-white text-base">
							Password
						</label>
						<input
							type="password"
							id="password"
							value={formData.password}
							onChange={handleInputChange}
							placeholder="Enter your password"
							className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div className="mb-2 mt-2">
						<label htmlFor="confirmPassword" className="block text-lg text-white text-base">
							{" "}
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleInputChange}
							placeholder="Confirm your password"
							className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-2 py-2 bg-white text-[#002B58] font-semibold rounded-lg hover:bg-[#B6CDFF] focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						{loading ? "Registering..." : "REGISTER"}
					</button>

					<span className="text-sm text-[#BFCAD5]">
						Already have an account?
						<a href="#" className="text-indigo-600 hover:text-[#92DFF3] cursor-pointer" onClick={() => navigate("../login")}>
							{" "}
							Login
						</a>
					</span>
				</form>
			</div>

			<style>
				{`
                    #style-7::-webkit-scrollbar-track {
                        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                        background-color: #F5F5F5;
                        border-radius: 10px;
                    }

                    #style-7::-webkit-scrollbar {
                        width: 10px;
                        background-color: #F5F5F5;
                    }

                    #style-7::-webkit-scrollbar-thumb {
                        border-radius: 10px;
                        background-image: -webkit-gradient(linear,
                                                            left bottom,
                                                            left top,
                                                            color-stop(0.44, rgb(122, 153, 217)),
                                                            color-stop(0.72, rgb(73, 125, 189)),
                                                            color-stop(0.86, rgb(28, 58, 148)));
                    }
                `}
			</style>
		</div>
	);
};

export default RegisterPage;
