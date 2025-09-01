import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import backButton from "../../assets/back_button.png";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import Input from "../../components/Input";
import HistoryItem from "../../components/HistoryItem";
import { AuthContext } from "../../context/AuthContext";
import IAddProductForm from "../../types/model/IAddProductForm";
import getProductHistoryResult from "../../types/api/product/getProductHistoryResult";
import axios from "axios";
import getProductHistoryHandler from "../../api/product/getProductHistoryHandler";
import getProductHistoryRequest from "../../types/api/product/getProductHistoryRequest";
import getProductLastComponentRequest from "../../types/api/product/getProductLastComponentRequest";
import getProductLastComponentHandler from "../../api/product/getProductLastComponentHandler";
import deleteProductRequest from "../../types/api/product/deleteProductRequest";
import deleteProductHandler from "../../api/product/deleteProductHandler";
import Modal from "../../components/Modal";
import predictProductQualityRequest from "../../types/api/product/predictProductQualityRequest";
import predictProductQualityHandler from "../../api/product/predictProductQualityHandler";
import convertBlobToFileHandler from "../../utils/convertBlobToFileHandler";

const ProductDetailPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const { id, name, image, description } = location.state || {};

	const authContext = useContext(AuthContext);

	const navigateBackHandler = () => {
		navigate("/products");
	};

	if (id == undefined || name == undefined || image == undefined || authContext == null) {
		useEffect(() => {
			navigateBackHandler();
		});

		return null;
	}

	const [historyList, setHistoryList] = useState<getProductHistoryResult[]>([]);

	const [isReadOnly, setIsReadOnly] = useState<boolean>(true);

	const [formState, setFormState] = useState<IAddProductForm & { waterQuality: string }>({
		productName: name,
		productDescription: description,
		productImage: image,
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
		waterQuality: "",
	});

	const [modalId, setModalId] = useState<number>(0);

	let cleanPercentage = 0;

	const fetchHistoryListHandler = async () => {
		try {
			const request: getProductHistoryRequest = {
				productId: id,
				token: authContext.token ?? "token",
			};

			const response = await getProductHistoryHandler(request);

			if (axios.isAxiosError(response)) {
				if (response.status == 401) {
					navigate("../login");
				}
			}

			let list: getProductHistoryResult[] = [];

			let cleanCount = 0;
			response.map((r: any) => {
				if (r.WaterQualityName == "Clean") {
					cleanCount += 1;
				}

				list.push({
					date: r.Date,
					productName: r.ProductName,
					productId: r.ProductID,
					isClean: r.WaterQualityName == "Clean",
				});
			});

			cleanPercentage = Math.floor((cleanCount / list.length) * 100);
			setHistoryList(list.reverse());
		} catch (e) {
			setHistoryList([]);
		}
	};

	const fetchLastComponentHandler = async () => {
		try {
			const request: getProductLastComponentRequest = {
				productId: id,
				token: authContext.token ?? "token",
			};

			const response = await getProductLastComponentHandler(request);

			if (axios.isAxiosError(response)) {
				if (response.status == 401) {
					navigate("../login");
				}
			}

			const waterDataDetail = response.WaterDataDetail;

			setFormState({
				productName: response.ProductName,
				productDescription: response.Description,
				productImage: response.ProductImage,
				pH: parseFloat(waterDataDetail.pH),
				lead: parseFloat(waterDataDetail.Lead),
				odor: parseFloat(waterDataDetail.Odor),
				totalDissolvedSolids: parseFloat(waterDataDetail["Total Dissolved Solids"]),
				iron: parseFloat(waterDataDetail.Iron),
				turbidity: parseFloat(waterDataDetail.Turbidity),
				sulfate: parseFloat(waterDataDetail.Sulfate),
				nitrate: parseFloat(waterDataDetail.Nitrate),
				flouride: parseFloat(waterDataDetail.Fluoride),
				chlorine: parseFloat(waterDataDetail.Chlorine),
				chloride: parseFloat(waterDataDetail.Chloride),
				copper: parseFloat(waterDataDetail.Copper),
				manganese: parseFloat(waterDataDetail.Manganese),
				waterQuality: `${cleanPercentage}% Clean`,
			});

			setIsReadOnly(true);
		} catch (e) {}
	};

	useEffect(() => {
		fetchHistoryListHandler();
		fetchLastComponentHandler();
	}, []);

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

	const [error, setError] = useState<string[]>([]);

	const checkWaterButtonOnClickHandler = async () => {
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
			await submitHandler();
		} else {
			setError(errorList);
		}
	};

	const submitHandler = async () => {
		const request: predictProductQualityRequest = {
			pH: formState.pH,
			iron: formState.iron,
			nitrate: formState.nitrate,
			chloride: formState.chloride,
			lead: formState.lead,
			turbidity: formState.turbidity,
			flouride: formState.flouride,
			copper: formState.copper,
			odor: formState.odor,
			sulfate: formState.sulfate,
			chlorine: formState.chlorine,
			manganese: formState.manganese,
			totalDissolvedSolids: formState.totalDissolvedSolids,
			productId: id,
			description: formState.productDescription,
			image: await convertBlobToFileHandler(formState.productImage),
			token: authContext.token ?? "token",
		};

		const response = await predictProductQualityHandler(request);

		if (axios.isAxiosError(response)) {
			if (response.status == 401) {
				navigate("../login");
			} else {
				alert(`Error: ${response.message}`);
			}
		} else {
			setModalId(response.prediction == "clean" ? 1 : 2);
		}
	};

	const deleteHandler = async () => {
		if (confirm("Are you sure want to delete this product? This action is irreversible!")) {
			const request: deleteProductRequest = {
				productId: id,
				token: authContext.token ?? "token",
			};

			const response = await deleteProductHandler(request);

			if (axios.isAxiosError(response)) {
				alert("Delete product failed! " + response.message);

				if (response.status == 401) {
					navigate("../login");
				}
			} else {
				alert("Delete product success!");
				navigate("../products");
			}
		}
	};

	return (
		<>
			<Navbar currentPage="Product" />

			<div className="flex flex-row md:justify-center md:items-center md:align-middle md:w-4/5 mx-auto">
				<div className="w-5/6 md:w-3/5">
					<h1 className="text-4xl text-underline text-center md:text-right font-bold mt-8 underline"> {name} </h1>
				</div>
				<div className="mt-8 w-1/6 md:w-2/5">
					<img src={backButton} className="block md:float-right cursor-pointer" onClick={navigateBackHandler} />
				</div>
			</div>

			{modalId == 0 ? (
				<></>
			) : modalId == 1 ? (
				<Modal
					icon={"clean"}
					message={`${name} is clean!`}
					onClose={() => {
						setModalId(0);
						window.location.reload();
					}}
					onConfirm={() => {
						setModalId(0);
						window.location.reload();
					}}
				/>
			) : (
				<Modal
					icon={"dirty"}
					message={`${name} is dirty!`}
					onClose={() => {
						setModalId(0);
					}}
					onConfirm={() => {
						setModalId(0);
					}}
				/>
			)}

			<form onSubmit={submitHandler}>
				<div className="mt-8 mx-auto w-4/5">
					<Input
						id="input-description"
						name="productDescription"
						label="Description"
						type="text"
						value={formState.productDescription}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-4/5 mx-auto mt-2">
					<Input
						label="pH"
						id="input-pH"
						name="pH"
						type="number"
						placeholder="7.2"
						value={formState.pH}
						onChange={formChangeHandler}
						color="black"
						isDisabled={isReadOnly}
					/>
					<Input
						label="Lead (mg/L)"
						id="input-lead"
						name="lead"
						type="number"
						value={formState.lead}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Odor"
						id="input-odor"
						name="odor"
						type="number"
						value={formState.odor}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Total Dissolved Solids (mg/L)"
						id="input-tds"
						name="totalDissolvedSolids"
						type="number"
						color="black"
						value={formState.totalDissolvedSolids}
						isDisabled={isReadOnly}
						onChange={formChangeHandler}
					/>
					<Input
						label="Iron (mg/L)"
						id="input-iron"
						name="iron"
						type="number"
						value={formState.iron}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Turbidity (NTU)"
						id="input-turbidity"
						name="turbidity"
						type="number"
						value={formState.turbidity}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Sulfate (mg/L)"
						id="input-lead"
						name="sulfate"
						type="number"
						value={formState.sulfate}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Water Quality"
						id="input-water-quality"
						name="water-quality"
						type="text"
						value={formState.waterQuality}
						color="black"
						isDisabled={true}
						onChange={formChangeHandler}
					/>
					<Input
						label="Nitrate (mg/L)"
						id="input-nitrate"
						name="nitrate"
						type="number"
						value={formState.nitrate}
						onChange={formChangeHandler}
						color="black"
						isDisabled={isReadOnly}
					/>
					<Input
						label="Flouride (mg/L)"
						id="input-flouride"
						name="flouride"
						type="number"
						value={formState.flouride}
						onChange={formChangeHandler}
						color="black"
						isDisabled={isReadOnly}
					/>
					<Input
						label="Chlorine (mg/L)"
						id="input-chlorine"
						name="chlorine"
						type="number"
						value={formState.chlorine}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
					/>
					{/* <Input
						id="input-image"
						name="productImage"
						label="Image (Opsional)"
						type="image"
						color="black"
						value={formState.productImage}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
					/> */}
					<div className="flex flex-col row-span-2">
						<label className="text-md font-semibold text-black" htmlFor="input-image">
							Image (Opsional)
						</label>
						<div
							className="rounded-2xl bg-white border-4 border-biru2 mt-2 text-black cursor-pointer h-[9rem]"
							onClick={() => {
								document.getElementById("input-image")?.click();
							}}
						>
							<img src={formState.productImage} className="rounded-2xl h-[9rem] block mx-auto" />
						</div>
						<input className="hidden" id="input-image" name="image" type="file" accept=".png,.jpg,.jpeg" onChange={formChangeHandler} />
					</div>
					<Input
						label="Chloride (mg/L)"
						id="input-chloride"
						name="chloride"
						type="number"
						value={formState.chloride}
						isDisabled={isReadOnly}
						onChange={formChangeHandler}
						color="black"
					/>
					<Input
						label="Copper (mg/L)"
						id="input-copper"
						name="copper"
						type="number"
						value={formState.copper}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
					<Input
						label="Manganese (mg/L)"
						id="input-manganese"
						name="manganese"
						type="number"
						value={formState.manganese}
						onChange={formChangeHandler}
						isDisabled={isReadOnly}
						color="black"
					/>
				</div>
			</form>

			<div className="w-4/5 mx-auto flex flex-row justify-end space-x-4 mt-8">
				{isReadOnly ? (
					<>
						<div>
							<Button text="Check Water Quality" onClick={checkWaterButtonOnClickHandler} />
						</div>
						<div>
							<Button
								text="Edit"
								isPrimary={false}
								onClick={() => {
									setIsReadOnly(false);
								}}
							/>
						</div>
						<div>
							<Button text="Delete" isPrimary={false} onClick={deleteHandler} />
						</div>
					</>
				) : (
					<>
						<div>
							<Button
								text="Cancel"
								isPrimary={true}
								onClick={async () => {
									await fetchLastComponentHandler();
								}}
							/>
						</div>
						<div>
							<Button
								text="Confirm"
								isPrimary={false}
								onClick={() => {
									setIsReadOnly(true);
								}}
							/>
						</div>
					</>
				)}
			</div>

			{error.length > 0 ? <p className="w-4/5 mx-auto pl-4 mt-8 text-black font-extrabold"> Error: </p> : <></>}

			{error.map((e, index) => {
				return (
					<p className="text-black w-4/5 mx-auto pl-4 mt-2" key={index}>
						- {e}
					</p>
				);
			})}

			<h1 className="text-4xl text-underline text-center font-bold mt-12 underline"> Product History </h1>

			<div className="w-4/5 mx-auto my-8">
				{historyList.map((item) => {
					return (
						<HistoryItem
							isClean={item.isClean}
							time={item.date.split("T")[1]}
							date={item.date.split("T")[0]}
							name={name}
							key={`${item.productId} - ${item.date}`}
						/>
					);
				})}
			</div>
		</>
	);
};

export default ProductDetailPage;
