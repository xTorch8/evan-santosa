import ModalType from "../types/components/ModalType";
import successIcon from "../assets/success_icon.png";
import cleanIcon from "../assets/clean_icon.png";
import dirtyIcon from "../assets/dirty_icon.png";
import Button from "./Button";

const Modal = (props: ModalType) => {
	return (
		<div className="bg-darkblue w-[25rem] md:w-[50rem] h-[20rem] md:h-[25rem] block mx-auto fixed top-0 bottom-0 left-0 right-0 m-auto border-2 border-color4 z-10 drop-shadow-2xl">
			<div className="bg-navy flex flex-row justify-between p-4">
				<h1 className="text-white"> HydroSense </h1>
				<p className="text-white cursor-pointer" onClick={props.onClose}>
					X
				</p>
			</div>
			<div className="bg-darkblue px-4 pt-4">
				<div>
					<img src={props.icon == "success" ? successIcon : props.icon == "clean" ? cleanIcon : dirtyIcon} className="block mx-auto mt-8 w-1/6" />
					<h1 className="text-2xl font-bold text-center text-white my-4"> {props.message} </h1>
					<Button text="Confirm" isPrimary={false} style="tertiary" onClick={props.onConfirm} />
				</div>
			</div>
		</div>
	);
};

export default Modal;
