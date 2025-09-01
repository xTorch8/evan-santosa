import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Navbar from "../../components/Navbar";
import defaultImage from "../../assets/default_pfp.png";
import correctIcon from "../../assets/correct_icon.png";
import wrongIcon from "../../assets/wrong_icon.png";
import goldMedal from "../../assets/gold_medal.png";
import silverMedal from "../../assets/silver_medal.png";
import bronzeMedal from "../../assets/bronze_medal.png";

const DashboardPage = () => {
	const navigate = useNavigate();
	const authContext = useContext(AuthContext);

	const [leaderboard, setLeaderboardData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
	const [companyProducts, setCompanyProducts] = useState<Record<number, any[]>>({});

	const [history, setHistory] = useState<any[]>([]);

	const [companyImages, setCompanyImages] = useState<Record<number, string>>({});

	useEffect(() => {
		const validateAndFetchData = async () => {
			if (authContext == null || authContext.isTokenValidHandler() == false) {
				navigate("../login");
				return;
			}

			var leaderboardData = [];

			try {
				const leaderboardResponse = await axios.get("https://api.hydrosense.nextora.my.id/dashboard/leaderboard", {
					headers: { Authorization: `Bearer ${authContext.token}` },
				});

				leaderboardData = leaderboardResponse.data;

				setLeaderboardData(leaderboardData);
			} catch (e) {
				if (axios.isAxiosError(e) && e.status == 401) {
					navigate("../login");
				}
				setLeaderboardData([]);
			}

			try {
				const historyResponse = await axios.get("https://api.hydrosense.nextora.my.id/dashboard/company/history", {
					headers: { Authorization: `Bearer ${authContext.token}` },
				});

				setHistory(historyResponse.data);
			} catch (e) {
				setHistory([]);
			}

			try {
				const imageRequests = leaderboardData.map((company: any) =>
					axios
						.get(`https://api.hydrosense.nextora.my.id/dashboard/companies/${company.company_id}`, {
							headers: { Authorization: `Bearer ${authContext.token}` },
						})
						.then((response) => ({
							companyId: company.company_id,
							image: response.data.image,
						}))
						.catch(() => ({
							companyId: company.company_id,
							image: defaultImage, // default just in case nggak ada pfp
						}))
				);

				const imageResults = await Promise.all(imageRequests);
				const imagesMap: Record<number, string> = {};
				imageResults.forEach((result) => {
					imagesMap[result.companyId] = result.image;
				});

				setCompanyImages(imagesMap);
			} catch (e) {
				setCompanyImages([]);
			} finally {
				setIsLoading(false);
			}
		};

		validateAndFetchData();
	}, []);

	// useEffect(() => {
	// 	const validateAndFetchData = async () => {
	// 		if (authContext == null || authContext.isTokenValidHandler() == false) {
	// 			navigate("../login");
	// 			return;
	// 		}

	// 		try {
	// 			const leaderboardResponse = await axios.get("https://api.hydrosense.nextora.my.id/dashboard/leaderboard", {
	// 				headers: { Authorization: `Bearer ${authContext.token}` },
	// 			});

	// 			const leaderboardData = leaderboardResponse.data;
	// 			setLeaderboardData(leaderboardData);

	// 			if (authContext != null && authContext.user?.role != undefined && authContext.user?.role != 2) {
	// 				const historyResponse = await axios.get("https://api.hydrosense.nextora.my.id/dashboard/company/history", {
	// 					headers: { Authorization: `Bearer ${authContext.token}` },
	// 				});
	// 				setHistory(historyResponse.data);
	// 			} else {
	// 				setHistory([]);
	// 			}

	// 			// Ambil pfp company
	// 			const imageRequests = leaderboardData.map((company: any) =>
	// 				axios
	// 					.get(`https://api.hydrosense.nextora.my.id/dashboard/companies/${company.company_id}`, {
	// 						headers: { Authorization: `Bearer ${authContext.token}` },
	// 					})
	// 					.then((response) => ({
	// 						companyId: company.company_id,
	// 						image: response.data.image,
	// 					}))
	// 					.catch(() => ({
	// 						companyId: company.company_id,
	// 						image: defaultImage, // default just in case nggak ada pfp
	// 					}))
	// 			);

	// 			const imageResults = await Promise.all(imageRequests);
	// 			const imagesMap: Record<number, string> = {};
	// 			imageResults.forEach((result) => {
	// 				imagesMap[result.companyId] = result.image;
	// 			});

	// 			setCompanyImages(imagesMap);
	// 		} catch (error) {
	// 			if (axios.isAxiosError(error)) {
	// 				if (error.status == 401) {
	// 					navigate("../login");
	// 				}
	// 			}
	// 			setLeaderboardData([]);
	// 			setHistory([]);
	// 		} finally {
	// 			setIsLoading(false);
	// 		}
	// 	};

	// 	validateAndFetchData();
	// }, []);

	const toggleCompanyProducts = async (companyId: number) => {
		if (expandedCompany === companyId) {
			setExpandedCompany(null);
			return;
		}

		if (!companyProducts[companyId]) {
			try {
				const response = await axios.get(`https://api.hydrosense.nextora.my.id/dashboard/company/${companyId}/products`, {
					headers: { Authorization: `Bearer ${authContext?.token}` },
				});
				setCompanyProducts((prev) => ({ ...prev, [companyId]: response.data }));
			} catch (error) {
				console.error("Error fetching company products:", error);
			}
		}
		setExpandedCompany(companyId);
	};

	return (
		<>
			<Navbar currentPage="Dashboard" />
			<h1 className="text-4xl font-bold text-center mt-8 underline">Leaderboard</h1>

			{isLoading ? (
				<p className="text-center mt-4 animate-pulse">Loading...</p>
			) : (
				<div className="container mx-auto p-8">
					<ul className="rounded-lg shadow-md divide-y">
						{leaderboard
							.sort((a, b) => b.clean_count / b.total_products - a.clean_count / a.total_products)
							.map((company, index) => {
								let blockColor =
									index === 0
										? "bg-gold hover:bg-darkblue hover:text-white focus-within:bg-darkblue focus-within:text-white rounded-lg mb-1"
										: index === 1
										? "bg-silver hover:bg-darkblue hover:text-white focus-within:bg-darkblue focus-within:text-white rounded-lg mb-1"
										: index === 2
										? "bg-bronze hover:bg-darkblue hover:text-white focus-within:bg-darkblue focus-within:text-white rounded-lg mb-1"
										: "bg-biru2 hover:bg-darkblue hover:text-white focus-within:bg-darkblue focus-within:text-white rounded-lg mb-1";

								blockColor += " p-4 cursor-pointer transition duration-300 ease-in-out hover:opacity-100";

								const medal = index === 0 ? goldMedal : index === 1 ? silverMedal : index === 2 ? bronzeMedal : null;

								return (
									<div key={`c-${company.company_id}`} className={blockColor} onClick={() => toggleCompanyProducts(company.company_id)}>
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{/* Icon Ranking */}
												{medal ? (
													<img src={medal} alt="medal" className="w-6 h-6 rounded-full border-2 border-darkblue" />
												) : (
													<span className="bg-white text-black px-1.5 rounded-full border-2 border-darkblue text-sm">{index + 1}</span>
												)}

												{/* PFP Company */}
												<img
													src={companyImages[company.company_id] || defaultImage}
													alt={company.company_name}
													className="w-10 h-10 object-cover rounded-full"
												/>

												{/* Nama Company */}
												<span className="font-bold text-lg">{company.company_name}</span>
											</div>

											{/* Dropdown Button */}
											<button className={`transition-transform duration-300 ${expandedCompany === company.company_id ? "rotate-180" : "rotate-0"}`}>
												▼
											</button>
										</div>

										{/* Bagian Dropdown */}
										{expandedCompany === company.company_id && (
											<div className="mt-2 bg-blue-100 rounded-lg p-2">
												{companyProducts[company.company_id]?.map((product) => (
													<div key={`p-${product.product_id}`} className="flex justify-between items-center px-2">
														<span className="text-darkblue font-semibold">{product.product_name}</span>
														<span className="text-darkblue font-semibold">{product.result}</span>
													</div>
												))}
												<div className="bg-darkblue text-white p-2 mt-2 rounded-lg">
													<span>Rata-Rata: </span>
													<strong>
														{companyProducts[company.company_id]
															? ((company.clean_count / companyProducts[company.company_id].length) * 100).toFixed(2) + "%" + " Clean"
															: "0%"}
													</strong>
												</div>
											</div>
										)}
									</div>
								);
							})}
					</ul>
				</div>
			)}

			{/* History */}
			{authContext != null && authContext?.user?.role != 2 ? (
				<>
					<h2 className="text-3xl font-bold text-center mt-12 underline">Product Check History</h2>
					<div className="mx-auto w-4/5 mt-8 mb-10">
						<table className="w-full border-collapse border text-white bg-darkblue size-16 font-semibold">
							<tbody>
								{history.map((item) => (
									<tr key={`H-${item.product_id}-${item.date}-${item.time}`} className="border-b text-center text-lg">
										<td className="text-center">
											<img src={item.result === "Clean" ? correctIcon : wrongIcon} alt={item.result} className="w-6 h-6 inline-block" />
										</td>
										<td className="text-center">{item.time}</td>
										<td className="text-center">{item.date}</td>
										<td className="text-center">{item.product_name}</td>
										<td className="text-center">{item.result}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			) : (
				<></>
			)}
		</>
	);
};

export default DashboardPage;
