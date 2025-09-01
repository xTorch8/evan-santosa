import ButtonTypes from "../types/components/ButtonType";

const Button = (props: ButtonTypes) => {
	let align = "mx-auto ";
	if (props.align == "left") {
		align += "md:float-left";
	} else if (props.align == "right") {
		align += "md:float-right";
	}

	if (props.isPrimary == null || props.isPrimary == true || props.style == "primary") {
		let style = "bg-biru5 rounded-lg block px-4 py-2 text-white border-biru1 border-2 font-semibold " + align;
		return (
			<button onClick={props.onClick} className={style}>
				{props.text}
			</button>
		);
	} else {
		if (props.style == "tertiary") {
			let style = "bg-navy rounded-xl block mx-auto px-4 py-2 text-black font-semibold text-white border-color4 border-2 " + align;
			return (
				<button onClick={props.onClick} className={style}>
					{props.text}
				</button>
			);
		} else {
			let style = "bg-biru2 rounded-lg block mx-auto px-4 py-2 text-black font-semibold " + align;
			return (
				<button onClick={props.onClick} className={style}>
					{props.text}
				</button>
			);
		}
	}
};

export default Button;
