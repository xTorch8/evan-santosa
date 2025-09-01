import { useNavigate } from "react-router";
import NavbarType from "../types/components/NavbarType";
import logo from "../assets/logo.png";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = (props: NavbarType) => {
	const authContext = useContext(AuthContext);

	const links = [
		{
			text: "Dashboard",
			isActive: props.currentPage == "Dashboard",
			link: "/dashboard",
			roleAuthorized: [1, 2, 3],
		},
		{
			text: "Product",
			isActive: props.currentPage == "Product",
			link: "/products",
			roleAuthorized: [1, 3],
		},
		{
			text: "Profile",
			isActive: props.currentPage == "Profile",
			link: "/profile",
			roleAuthorized: [1, 3],
		},
		{
			text: "Logout",
			isActive: false,
			link: "../login",
			roleAuthorized: [2],
			onClick: () => {
				localStorage.removeItem("token");
				navigate("../login");
			},
		},
	];

	const navigate = useNavigate();

	return (
		<header className="bg-navy p-4 flex flex-row justify-between top-0 sticky">
			<div>
				<img src={logo} alt="HydroSense logo" />
			</div>
			<nav>
				<ul className="flex flex-row">
					{links.map((item, index) => {
						let isUserAuthorized = false;
						for (let i = 0; i < item.roleAuthorized.length; i++) {
							if (item.roleAuthorized[i] == authContext?.user?.role) {
								isUserAuthorized = true;
								break;
							}
						}

						if (!isUserAuthorized) {
							return <></>;
						}

						let className = "mx-4 cursor-pointer ";

						if (item.isActive) {
							className += "text-biru5 underline decoration-biru5";
						} else {
							className += "text-white hover:underline hover:decoration-biru-5 hover:text-biru5";
						}

						return (
							<li key={index}>
								<a className={className} onClick={item.onClick == null || item.onClick == undefined ? () => navigate(item.link) : item.onClick}>
									{item.text}
								</a>
							</li>
						);
					})}
				</ul>
			</nav>
		</header>
	);
};

export default Navbar;
