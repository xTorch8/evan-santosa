import { useNavigate } from "react-router";
import logo from "../assets/logo.png";

const LandingPage = () => {
	const pageStyle = {
		backgroundColor: "#002B58",
		minHeight: "100vh",
	};

	const navigate = useNavigate();

	return (
		<div style={pageStyle} className="flex justify-center align-middle items-center">
			<div>
				<h1 className="text-white text-2xl font-bold"> Welcome to </h1>
				<img src={logo} className="w-[20rem]" />

				<div className="mt-8 flex flex-row items-center justify-center">
					<button className="bg-white rounded-xl px-4 py-2 font-bold mx-4" onClick={() => navigate("register")}>
						REGISTER
					</button>
					<button className="bg-white rounded-xl px-4 py-2 font-bold mx-4" onClick={() => navigate("login")}>
						LOGIN
					</button>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
