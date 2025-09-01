import IProductDetailForm from "./IProductDetailForm";

interface IAddProductForm extends IProductDetailForm {
	productName: string;
	productDescription: string;
	productImage: string;
}

export default IAddProductForm;
