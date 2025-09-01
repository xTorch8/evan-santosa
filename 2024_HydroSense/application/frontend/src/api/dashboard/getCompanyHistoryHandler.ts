import axios from "axios";
import API_PATH from "../API_PATH";


const getCompanyHistoryHandler = async (companyId: number, token: string) => {
	try {
		const response = await axios.get(`${API_PATH}/dashboard/company/${companyId}/history`, { headers: { Authorization: `Bearer ${token}` } });
		return response.data;
	} catch (e) {
		return e;
	}
};

export default getCompanyHistoryHandler;
