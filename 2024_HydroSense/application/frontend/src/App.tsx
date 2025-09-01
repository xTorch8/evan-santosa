import { BrowserRouter, Route, Routes } from "react-router";
import ProductListPage from "./pages/Products/ProductListPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import { AuthProvider } from "./context/AuthContext";
import AddProductPage from "./pages/Products/AddProductPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import LandingPage from "./pages/LandingPage";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="login" element={<LoginPage />} />
					<Route path="register" element={<RegisterPage />} />
					<Route path="products" element={<ProductListPage />} />
					<Route path="products/detail" element={<ProductDetailPage />} />
					<Route path="products/add" element={<AddProductPage />} />
					<Route path="dashboard" element={<DashboardPage />} />
					<Route path="profile" element={<ProfilePage />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
