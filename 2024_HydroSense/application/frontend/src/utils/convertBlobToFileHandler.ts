const convertBlobToFileHandler = async (blobUrl: string): Promise<File> => {
	const response = await fetch(blobUrl);
	const blob = await response.blob();

	const date = new Date();

	const file = new File([blob], date.getTime().toString(), { type: blob.type });

	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);

	return dataTransfer.files[0];
};

export default convertBlobToFileHandler;
