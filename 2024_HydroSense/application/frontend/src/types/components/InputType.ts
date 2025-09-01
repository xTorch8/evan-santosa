type InputType = {
	id: string;
	name: string;
	label: string;
	type: "text" | "number" | "email" | "image";
	placeholder?: string;
	width?: string;
	isDisabled?: boolean;
	value?: string | number;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	color?: "black" | "white";
	imageHeight?: number;
};

export default InputType;
