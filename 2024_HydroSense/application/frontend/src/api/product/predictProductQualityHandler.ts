import axios from "axios";
import predictProductQualityRequest from "../../types/api/product/predictProductQualityRequest";
import API_PATH from "../API_PATH";

const predictProductQualityHandler = async (request: predictProductQualityRequest) => {
	try {
		const formData = new FormData();
		if (request.image) {
			formData.append("image", request.image);
		}

		const waterData = JSON.stringify({
			pH: request.pH,
			Iron: request.iron,
			Nitrate: request.nitrate,
			Chloride: request.chloride,
			Lead: request.lead,
			Turbidity: request.turbidity,
			Fluoride: request.flouride,
			Copper: request.copper,
			Odor: request.odor,
			Sulfate: request.sulfate,
			Chlorine: request.chlorine,
			Manganese: request.manganese,
			Total_Dissolved_Solids: request.totalDissolvedSolids,
			Description: request.description,
			ProductID: request.productId,
		});

		formData.append("data", waterData);

		const response = await axios.post(`${API_PATH}/product/predict-image/`, formData, {
			headers: {
				Authorization: `Bearer ${request.token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		return response.data;
	} catch (e) {
		return e;
	}
};

export default predictProductQualityHandler;
