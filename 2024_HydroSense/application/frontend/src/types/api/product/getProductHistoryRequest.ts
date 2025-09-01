import IRequest from "../IRequest";

type getProductHistoryRequest = IRequest & {
    productId: string;
}

export default getProductHistoryRequest;