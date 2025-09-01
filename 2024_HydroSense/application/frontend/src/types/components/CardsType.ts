type CardsType = {
	imagePath: string;
	text: string;
	key?: string | number;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

export default CardsType;
