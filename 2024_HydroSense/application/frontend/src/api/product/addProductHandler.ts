import axios from "axios";
import addProductRequest from "../../types/api/product/addProductRequest";
import API_PATH from "../API_PATH";

const addProductHandler = async (request: addProductRequest) => {
	try {
		const formData = new FormData();

		formData.append("Name", request.name);
		formData.append("Description", request.description);

		if (request.image) {
			formData.append("image", request.image);
		}

		const waterData = JSON.stringify({
			pH: request.waterData.pH,
			Iron: request.waterData.iron,
			Nitrate: request.waterData.nitrate,
			Chloride: request.waterData.chloride,
			Lead: request.waterData.lead,
			Turbidity: request.waterData.turbidity,
			Fluoride: request.waterData.flouride,
			Copper: request.waterData.copper,
			Odor: request.waterData.odor,
			Sulfate: request.waterData.sulfate,
			Chlorine: request.waterData.chlorine,
			Manganese: request.waterData.manganese,
			Total_Dissolved_Solids: request.waterData.totalDissolvedSolids,
			Description: request.description,
		});

		formData.append("water_data", waterData);

		const response = await axios.post(`${API_PATH}/product/save/`, formData, {
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

export default addProductHandler;
