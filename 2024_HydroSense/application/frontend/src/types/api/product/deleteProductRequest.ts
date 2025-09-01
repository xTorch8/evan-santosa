import IRequest from "../IRequest";

type deleteProductRequest = IRequest & {
	productId: string;
};

export default deleteProductRequest;
