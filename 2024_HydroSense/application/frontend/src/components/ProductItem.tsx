import ProductItemType from "../types/components/ProductItemType";

const ProductItem = (props: ProductItemType) => {
	return (
		<div
			className="bg-biru1 flex flex-col md:flex-row border-4 border-darkblue rounded-xl my-4 items-center justify-center cursor-pointer"
			key={props.id}
			onClick={props.onClick}
		>
			<div className="w-full md:w-1/6 p-8">
				<div className="border-darkblue border-4 rounded-xl">
					<img src={props.imagePath} className="w-full rounded-xl" />
				</div>
			</div>
			<div className="w-full md:w-5/6 p-4">
				<h1 className="text-2xl font-bold text-darkblue"> {props.title} </h1>
				<p className="text-lg font-semibold text-darkblue text-justify"> {props.description} </p>
			</div>
		</div>
	);
};

export default ProductItem;
