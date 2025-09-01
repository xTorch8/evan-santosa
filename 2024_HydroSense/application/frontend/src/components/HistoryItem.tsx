import HistoryItemType from "../types/components/HistoryItemType";
import correctIcon from "../assets/correct_icon.png";
import wrongIcon from "../assets/wrong_icon.png";

const HistoryItem = (props: HistoryItemType) => {
	return (
		<div className="w-full bg-darkblue pl-4 pr-8 py-2 flex md:flex-row border-2 border-biru2 text-white">
			<div className="w-[10%]">
				<img src={props.isClean ? correctIcon : wrongIcon} className="block mx-auto" />
			</div>
			<div className="w-[20%] md:w-[15%]">
				<p> {props.time}</p>
			</div>
			<div className="w-[25%] md:w-[15%]">
				<p> {props.date} </p>
			</div>
			<div className="w-[45%]">
				<p> {props.name} </p>
			</div>
			<div className="hidden md:block w-[15%]">
				<p className="text-right"> {props.isClean ? "Clean" : "Dirty"}</p>
			</div>
		</div>
	);
};

export default HistoryItem;
