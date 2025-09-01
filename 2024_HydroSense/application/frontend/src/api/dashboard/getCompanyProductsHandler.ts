import axios from "axios";
import API_PATH from "../API_PATH";


const getCompanyProductsHandler = async (companyId: number, token: string) => {
	try {
		const response = await axios.get(`${API_PATH}/dashboard/company/${companyId}/products`, { headers: { Authorization: `Bearer ${token}` } });
		return response.data;
	} catch (e) {
		return e;
	}
};

export default getCompanyProductsHandler;
