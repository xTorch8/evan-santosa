type ButtonTypes = {
	text: string;
	isPrimary?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	align?: "left" | "center" | "right";
	style?: "primary" | "secondary" | "tertiary";
};

export default ButtonTypes;
