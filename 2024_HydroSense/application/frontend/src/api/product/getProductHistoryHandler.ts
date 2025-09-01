import axios from "axios";
import API_PATH from "../API_PATH";
import getProductHistoryRequest from "../../types/api/product/getProductHistoryRequest";

const getProductHistoryHandler = async (request: getProductHistoryRequest) => {
	try {
		const response = await axios.get(`${API_PATH}/product/history/${request.productId}`, {
			headers: {
				Authorization: `Bearer ${request.token}`,
			},
		});

		return response.data;
	} catch (e) {
		return e;
	}
};

export default getProductHistoryHandler;
