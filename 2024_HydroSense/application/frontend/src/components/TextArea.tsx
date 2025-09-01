import TextAreaType from "../types/components/TextAreaType";

const TextArea = (props: TextAreaType) => {
	let color = "text-black";
	if (props.color == "white") {
		color = "text-white";
	}

	return (
		<div className="flex flex-col">
			<label className={"text-md font-semibold " + color} htmlFor={props.id}>
				{props.label}:
			</label>
			<textarea
				className="px-4 py-2 rounded-2xl bg-white border-4 border-biru2 mt-2 text-black resize-none h-[14.5rem]"
				id={props.id}
				name={props.name}
				placeholder={props.placeholder}
				onChange={props.onChange}
				value={props.value}
			/>
		</div>
	);
};

export default TextArea;
