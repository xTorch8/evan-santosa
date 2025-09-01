import axios from "axios";
import API_PATH from "../API_PATH";
import getProductLastComponentRequest from "../../types/api/product/getProductLastComponentRequest";

const getProductLastComponentHandler = async (request: getProductLastComponentRequest) => {
	try {
		const response = await axios.get(`${API_PATH}/product/last-component/${request.productId}`, {
			headers: {
				Authorization: `Bearer ${request.token}`,
			},
		});

		return response.data;
	} catch (e) {
		return e;
	}
};

export default getProductLastComponentHandler;
