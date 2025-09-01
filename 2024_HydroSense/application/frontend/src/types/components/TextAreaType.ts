type TextAreaType = {
	id: string;
	name: string;
	label: string;
	placeholder?: string;
	width?: string;
	isDisabled?: boolean;
	value?: string | number;
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	color?: "black" | "white";
};

export default TextAreaType;
