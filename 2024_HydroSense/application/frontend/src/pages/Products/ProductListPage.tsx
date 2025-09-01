import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import ProductItem from "../../components/ProductItem";
import getProductListHandler from "../../api/dashboard/getProductListHandler";
import getProductListRequest from "../../types/api/dashboard/getProductListRequest";
import axios from "axios";
import getProductListResult from "../../types/api/dashboard/getProductListResult";
import { AuthContext } from "../../context/AuthContext";

const ProductListPage = () => {
	let navigate = useNavigate();

	const [data, setData] = useState<getProductListResult[]>([]);

	const authContext = useContext(AuthContext);

	if (authContext == null) {
		navigate("../login");
	} else if (authContext.user?.role == 2) {
		navigate("../dashboard");
	}

	useEffect(() => {
		const fetchProductList = async () => {
			try {
				const request: getProductListRequest = {
					companyId: authContext?.user?.companyId.toString()!,
					token: authContext?.token!,
				};

				const response = await getProductListHandler(request);

				if (axios.isAxiosError(response)) {
					if (response.status === 401) {
						navigate("../login");
					} else {
						alert(`Error: ${response.message}`);
					}
				} else {
					setData(response);
				}
			} catch (e) {
				setData([]);
			}
		};

		fetchProductList();
	}, []);

	return (
		<>
			<Navbar currentPage="Product" />

			<div className="md:flex md:flex-row md:justify-center md:items-center md:align-middle md:w-4/5 mx-auto">
				<div className="w-full md:w-3/5">
					<h1 className="text-4xl text-underline text-center md:text-right font-bold mt-8 underline"> Product List </h1>
				</div>
				<div className="w-full mt-8 md:w-2/5">
					<Button
						text="Add Product"
						isPrimary={true}
						align="right"
						onClick={() => {
							navigate("add");
						}}
					/>
				</div>
			</div>

			<div className="mx-auto w-1/2 mt-8 md:w-4/5">
				{data.map((item) => {
					return (
						<ProductItem
							id={item.product_id.toString()}
							key={item.product_id.toString()}
							title={item.product_name}
							description={item.product_description}
							imagePath={item.product_image}
							onClick={() => {
								navigate("/products/detail", {
									state: {
										id: item.product_id,
										name: item.product_name,
										image: item.product_image,
										description: item.product_description,
									},
								});
							}}
						/>
					);
				})}
			</div>
		</>
	);
};

export default ProductListPage;
