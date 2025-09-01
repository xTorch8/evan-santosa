import axios from "axios";
import API_PATH from "../API_PATH";
import getProductListRequest from "../../types/api/dashboard/getProductListRequest";

const getProductListHandler = async (request: getProductListRequest) => {
	try {
		const response = await axios.get(`${API_PATH}/dashboard/company/${request.companyId}/products`, {
			headers: {
				Authorization: `Bearer ${request.token}`,
			},
		});

		return response.data;
	} catch (e) {
		return e;
	}
};

export default getProductListHandler;
