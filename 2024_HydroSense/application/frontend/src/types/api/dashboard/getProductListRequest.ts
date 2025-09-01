import IRequest from "../IRequest";

type getProductListRequest = IRequest & {
	companyId: string;
};

export default getProductListRequest;
