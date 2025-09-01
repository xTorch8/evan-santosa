type ModalType = {
	onConfirm?: () => void;
	onClose?: () => void;
	icon: "clean" | "dirty" | "success";
	message: string;
};

export default ModalType;
