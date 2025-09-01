import { createContext, ReactNode, useEffect, useState } from "react";
import AuthType from "../types/model/UserType";
import getUserInformationHandler from "../api/auth/getUserInformationHandler";
import axios from "axios";
// import { useNavigate } from "react-router";

interface IAuthContext {
	user: AuthType | null;
	token: string | null;
	updateTokenHandler: (jwt: string) => void;
	isTokenValidHandler: () => {};
}

interface IAuthProvider {
	children: ReactNode;
}

const AuthContext = createContext<IAuthContext | null>(null);

const AuthProvider: React.FC<IAuthProvider> = ({ children }) => {
	const [user, setUser] = useState<AuthType | null>(null);

	const [token, setToken] = useState<string>(localStorage.getItem("token") ?? "token");

	const isTokenValidHandler = async (): Promise<boolean> => {
		try {
			const response = await getUserInformationHandler({ token: token });

			if (axios.isAxiosError(response)) {
				console.error("Token validation failed:", response.message);
				return false;
			}

			setUser({
				firstName: response.first_name,
				lastName: response.last_name,
				email: response.email,
				role: response.role,
				companyId: response.company_id,
			});

			return true;
		} catch (error) {
			console.error("Error during token validation:", error);

			setUser(null);

			return false;
		}
	};

	const updateTokenHandler = (jwt: string): void => {
		setToken(jwt);
	};

	const updateUserHandler = async (): Promise<void> => {
		try {
			const response = await getUserInformationHandler({ token: token });

			if (axios.isAxiosError(response)) {
				setUser(null);
			}

			setUser({
				firstName: response.first_name,
				lastName: response.last_name,
				email: response.email,
				role: response.role,
				companyId: response.company_id,
			});
		} catch (error) {
			// navigate("../login");
			setUser(null);
		}
	};

	useEffect(() => {
		const main = async () => {
			await updateUserHandler();
		};

		main();
	}, [token]);

	return <AuthContext.Provider value={{ user, token, updateTokenHandler, isTokenValidHandler }}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
