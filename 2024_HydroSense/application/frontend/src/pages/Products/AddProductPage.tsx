import { useNavigate } from "react-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import TextArea from "../../components/TextArea";
import IAddProductForm from "../../types/model/IAddProductForm";
import addProductRequest from "../../types/api/product/addProductRequest";
import addProductHandler from "../../api/product/addProductHandler";
import axios from "axios";
import convertBlobToFileHandler from "../../utils/convertBlobToFileHandler";
import Modal from "../../components/Modal";

const AddProductPage = () => {
	const authContext = useContext(AuthContext);

	const navigate = useNavigate();

	if (authContext == null) {
		navigate("../login");
	} else if (authContext.user?.role == 2) {
		navigate("../dashboard");
	}

	const pageStyle = {
		backgroundColor: "#002B58",
		minHeight: "100vh",
	};

	const [step, setStep] = useState<number>(1);

	const [formState, setFormState] = useState<IAddProductForm>({
		productName: "",
		productDescription: "",
		productImage: "",
		pH: 0,
		lead: 0,
		odor: 0,
		totalDissolvedSolids: 0,
		iron: 0,
		turbidity: 0,
		sulfate: 0,
		nitrate: 0,
		flouride: 0,
		chlorine: 0,
		chloride: 0,
		copper: 0,
		manganese: 0,
	});

	const formChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name } = event.target;

		if (name === "image" && event.target instanceof HTMLInputElement && event.target.files) {
			const file = event.target.files[0];
			if (file) {
				const imageUrl = URL.createObjectURL(file);
				setFormState((prevState) => ({
					...prevState,
					productImage: imageUrl,
				}));
			}
		} else {
			const { value } = event.target;
			setFormState((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}
	};

	const step1 = (
		<>
			<div className="w-4/5 flex flex-col md:flex-row mx-auto mt-16 justify-center items-stretch">
				<div className="w-full md:w-1/2 mx-4">
					<Input
						id="input-name"
						name="productName"
						label="Product Name"
						type="text"
						color="white"
						placeholder="....."
						value={formState.productName}
						onChange={formChangeHandler}
					/>
					<br></br>
					<TextArea
						id="input-description"
						name="productDescription"
						label="Product Description"
						color="white"
						placeholder="....."
						value={formState.productDescription}
						onChange={formChangeHandler}
					/>
				</div>
				<div className="w-full md:w-1/2 mx-4 mt-4 md:mt-0">
					<div className="flex flex-col row-span-2">
						<label className="text-lg font-semibold text-white" htmlFor="input-image">
							Image (Opsional)
						</label>
						<div
							className="rounded-2xl bg-white border-4 border-biru2 mt-2 text-black cursor-pointer h-[21rem]"
							onClick={() => {
								document.getElementById("input-image")?.click();
							}}
						>
							<img src={formState.productImage} className="rounded-2xl h-[21rem] block mx-auto" />
						</div>
						<input className="hidden" id="input-image" name="image" type="file" accept=".png,.jpg,.jpeg" onChange={formChangeHandler} />
					</div>
				</div>
			</div>
		</>
	);

	const step2 = (
		<>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-4/5 mx-auto mt-8">
				<Input label="pH" id="input-pH" name="pH" type="number" placeholder="7.2" value={formState.pH} onChange={formChangeHandler} color="white" />
				<Input
					label="Lead (mg/L)"
					id="input-lead"
					name="lead"
					type="number"
					placeholder="0.003"
					value={formState.lead}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Odor"
					id="input-odor"
					name="odor"
					type="number"
					placeholder=""
					value={formState.odor}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Total Dissolved Solids (mg/L)"
					id="input-tds"
					name="totalDissolvedSolids"
					type="number"
					placeholder="200"
					color="white"
					value={formState.totalDissolvedSolids}
					onChange={formChangeHandler}
				/>
				<Input
					label="Iron (mg/L)"
					id="input-iron"
					name="iron"
					type="number"
					placeholder="0.15"
					value={formState.iron}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Turbidity (NTU)"
					id="input-turbidity"
					name="turbidity"
					type="number"
					placeholder="0.5"
					value={formState.turbidity}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Sulfate (mg/L)"
					id="input-sulfate"
					name="sulfate"
					type="number"
					placeholder="25"
					value={formState.sulfate}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Nitrate (mg/L)"
					id="input-nitrate"
					name="nitrate"
					type="number"
					placeholder="3.0"
					value={formState.nitrate}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Flouride (mg/L)"
					id="input-flouride"
					name="flouride"
					type="number"
					placeholder="0.7"
					value={formState.flouride}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Chlorine (mg/L)"
					id="input-chlorine"
					name="chlorine"
					type="number"
					placeholder="0.5"
					value={formState.chlorine}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Chloride (mg/L)"
					id="input-chloride"
					name="chloride"
					type="number"
					placeholder="20"
					value={formState.chloride}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Copper (mg/L)"
					id="input-copper"
					name="copper"
					type="number"
					placeholder="0.1"
					value={formState.copper}
					onChange={formChangeHandler}
					color="white"
				/>
				<Input
					label="Manganese (mg/L)"
					id="input-manganese"
					name="manganese"
					type="number"
					placeholder="0.05"
					value={formState.manganese}
					onChange={formChangeHandler}
					color="white"
				/>
			</div>
		</>
	);

	const [error, setError] = useState<string[]>([]);

	const previousButtonOnClickHandler = () => {
		if (step == 1) {
			navigate("../products");
		} else {
			setStep(1);
		}
	};

	const nextButtonOnClickHandler = async () => {
		if (step == 1) {
			let errorList = [];

			if (formState.productName.trim().length == 0) {
				errorList.push("Product name must be filled!");
			}

			if (formState.productDescription.trim().length == 0) {
				errorList.push("Product description must be filled!");
			}

			if (errorList.length == 0) {
				setStep(2);
			} else {
				setError(errorList);
			}
		} else {
			let errorList = [];

			let validationMap = {
				pH: [2, 12],
				iron: [0, 16],
				nitrate: [0, 73],
				chloride: [34, 1321],
				lead: [0, 3.5],
				turbidity: [0, 18],
				flouride: [0, 12],
				copper: [0, 11],
				odor: [0, 4],
				sulfate: [12, 1393],
				chlorine: [1, 10],
				manganese: [1, 23],
				totalDissolvedSolids: [0, 579],
			};

			for (let [name] of Object.entries(validationMap)) {
				if (formState[name as keyof typeof formState] != undefined) {
					// const value = formState[name as keyof typeof formState];
					// if (value != undefined) {
					// 	if (+value < range[0] || +value > range[1]) {
					// 		errorList.push(`${name} must be between ${range[0]} and ${range[1]}!`);
					// 	}
					// }
				} else {
					errorList.push(`${name} must be filled!`);
				}
			}

			if (errorList.length == 0) {
				await submitFormHandler();
			} else {
				setError(errorList);
			}
		}
	};

	const submitFormHandler = async () => {
		try {
			const request: addProductRequest = {
				name: formState.productName,
				description: formState.productDescription,
				image: await convertBlobToFileHandler(formState.productImage),
				waterData: {
					pH: formState.pH !== undefined ? parseFloat(formState.pH.toString()) : 0,
					lead: formState.lead !== undefined ? parseFloat(formState.lead.toString()) : 0,
					odor: formState.odor !== undefined ? parseFloat(formState.odor.toString()) : 0,
					totalDissolvedSolids: formState.totalDissolvedSolids !== undefined ? parseFloat(formState.totalDissolvedSolids.toString()) : 0,
					iron: formState.iron !== undefined ? parseFloat(formState.iron.toString()) : 0,
					turbidity: formState.turbidity !== undefined ? parseFloat(formState.turbidity.toString()) : 0,
					sulfate: formState.sulfate !== undefined ? parseFloat(formState.sulfate.toString()) : 0,
					nitrate: formState.nitrate !== undefined ? parseFloat(formState.nitrate.toString()) : 0,
					flouride: formState.flouride !== undefined ? parseFloat(formState.flouride.toString()) : 0,
					chlorine: formState.chlorine !== undefined ? parseFloat(formState.chlorine.toString()) : 0,
					chloride: formState.chloride !== undefined ? parseFloat(formState.chloride.toString()) : 0,
					copper: formState.copper !== undefined ? parseFloat(formState.copper.toString()) : 0,
					manganese: formState.manganese !== undefined ? parseFloat(formState.manganese.toString()) : 0,
				},
				token: authContext?.token ?? "token",
			};

			const response = await addProductHandler(request);

			if (axios.isAxiosError(response)) {
				if (response.status === 401) {
					navigate("../login");
				} else {
					setError([response.message]);
				}
			} else {
				setModalId(1);
			}
		} catch (e) {
			setError(["Internal server error"]);
		}
	};

	useEffect(() => {
		setError([]);
	}, [step]);

	const [modalId, setModalId] = useState<number>(0);

	return (
		<div className="p-8" style={pageStyle}>
			<p
				className="text-white float-right cursor-pointer"
				onClick={() => {
					navigate("../products");
				}}
			>
				X
			</p>

			<h1 className="text-4xl underline text-white font-extrabold block text-center mt-8"> Product Data </h1>

			{modalId == 0 ? (
				<></>
			) : (
				<Modal icon={"success"} message={"Added successfully!"} onClose={() => navigate("../products")} onConfirm={() => navigate("../products")} />
			)}

			{step == 1 ? step1 : step2}

			{error.length > 0 ? <p className="w-4/5 mx-auto pl-4 mt-8 text-white font-extrabold"> Error: </p> : <></>}

			{error.map((e, index) => {
				return (
					<p className="text-white w-4/5 mx-auto pl-4 mt-2" key={index}>
						- {e}
					</p>
				);
			})}

			<div className="w-[85%] md:w-[78%] mx-auto flex flex-row justify-end space-x-4 mt-16">
				<div>
					<Button text={step == 1 ? "Cancel" : "Previous"} isPrimary={false} onClick={previousButtonOnClickHandler} />
				</div>
				<div>
					<Button text={step == 1 ? "Next" : "Submit"} isPrimary={true} onClick={nextButtonOnClickHandler} />
				</div>
			</div>
		</div>
	);
};

export default AddProductPage;
