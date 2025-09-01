import axios from "axios";
import deleteProductRequest from "../../types/api/product/deleteProductRequest";
import API_PATH from "../API_PATH";

const deleteProductHandler = async (request: deleteProductRequest) => {
	try {
		const response = await axios.delete(`${API_PATH}/product/delete/${request.productId}`, {
			headers: {
				Authorization: `Bearer ${request.token}`,
			},
		});

		return response.data;
	} catch (e) {
		return e;
	}
};

export default deleteProductHandler;
