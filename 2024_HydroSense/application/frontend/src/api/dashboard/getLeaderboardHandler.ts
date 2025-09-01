import axios from "axios";
import API_PATH from "../API_PATH";
import IRequest from "../../types/api/IRequest";

const getLeaderboardHandler = async (request: IRequest) => {
	try {
		const response = await axios.get(`${API_PATH}/dashboard/leaderboard`, {
			headers: { Authorization: `Bearer ${request.token}` },
		});
		return response.data;
	} catch (e) {
		return e;
	}
};

export default getLeaderboardHandler;
