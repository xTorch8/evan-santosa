type ProductItemType = {
	id: string;
	key: string;
	imagePath: string;
	title: string;
	description: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

export default ProductItemType;
