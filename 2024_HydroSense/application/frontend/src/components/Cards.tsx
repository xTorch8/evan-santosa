import CardsType from "../types/components/CardsType";

const Cards = (props: CardsType) => {
	return (
		<div
			className="bg-biru1 text-biru5 w-full my-2 md:my-4 rounded-2xl border-solid border-biru5 border-4 block mx-auto hover:border-black hover:bg-biru5 hover:text-white group"
			onClick={props.onClick}
		>
			<div className="overflow-hidden">
				<img src={props.imagePath} className="w-full rounded-t-xl transition-transform duration-300 group-hover:scale-125" />
			</div>
			<div className="py-6 border-solid border-biru5 border-t-4 group-hover:border-black">
				<h1 className="text-2xl text-center font-bold"> {props.text} </h1>
			</div>
		</div>
	);
};

export default Cards;
