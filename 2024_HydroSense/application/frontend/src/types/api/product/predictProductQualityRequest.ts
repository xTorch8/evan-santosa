import IProductDetailForm from "../../model/IProductDetailForm";
import IRequest from "../IRequest";

type predictProductQualityRequest = IRequest &
	IProductDetailForm & {
		productId: string;
		image: File;
		description: string;
	};

export default predictProductQualityRequest;
