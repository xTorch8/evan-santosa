import InputType from "../types/components/InputType";

const Input = (props: InputType) => {
	let color = "text-black";
	if (props.color == "white") {
		color = "text-white";
	}

	if (props.type != "image") {
		return (
			<div className="flex flex-col">
				<label className={"text-md font-semibold " + color} htmlFor={props.id}>
					{props.label}:
				</label>
				<input
					className="px-4 py-2 rounded-2xl bg-white border-4 border-biru2 mt-2 text-black"
					id={props.id}
					name={props.name}
					type={props.type}
					placeholder={props.placeholder}
					onChange={props.onChange}
					value={props.type == "number" ? (props.value == undefined || isNaN(parseFloat(props.value.toString())) ? 0 : props.value) : props.value}
					disabled={props.isDisabled ?? false}
				/>
			</div>
		);
	} else {
		return <>In development</>;
		// const location = useLocation();
		// const { image } = location.state || {};
		// const [productImage, setImage] = useState<string | undefined>(image);

		// useEffect(() => {
		// 	if (image) {
		// 		setImage(image);
		// 	}
		// }, []);

		// const imageChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		// 	const file = event.target.files?.[0];
		// 	if (file) {
		// 		const reader = new FileReader();
		// 		reader.onload = () => {
		// 			if (typeof reader.result === "string") {
		// 				setImage(reader.result);
		// 			}
		// 		};
		// 		reader.readAsDataURL(file);
		// 	}
		// };

		// let height = "h-[8.5rem]";
		// if (props.imageHeight != null) {
		// 	height = `h-[${props.imageHeight}rem]`;
		// }

		// let inputImageClass = `rounded-2xl ${height} block mx-auto`;
		// let containerImageClass = `rounded-2xl bg-white border-4 border-biru2 mt-2 text-black cursor-pointer ${height}`;

		// return (
		// 	<div className="flex flex-col row-span-2">
		// 		<label className={"text-lg font-semibold " + color} htmlFor={props.id}>
		// 			{props.label}:
		// 		</label>
		// 		<div
		// 			className={containerImageClass}
		// 			onClick={() => {
		// 				document.getElementById(props.id)?.click();
		// 			}}
		// 		>
		// 			<img src={productImage} className={inputImageClass} />
		// 		</div>
		// 		<input
		// 			className="hidden"
		// 			id={props.id}
		// 			name={props.name}
		// 			type="file"
		// 			accept=".png,.jpg,.jpeg"
		// 			onChange={imageChangeHandler}
		// 			disabled={props.isDisabled ?? false}
		// 		/>
		// 	</div>
		// );
	}
};

export default Input;
