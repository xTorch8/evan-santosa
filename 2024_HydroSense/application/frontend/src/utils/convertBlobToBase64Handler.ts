const convertBlobUrlToBase64Handler = async (blobUrl: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fetch(blobUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const reader = new FileReader();

				reader.onloadend = () => {
					if (reader.result) {
						resolve(reader.result.toString());
					} else {
						reject(new Error("Failed to read the blob as a Data URL."));
					}
				};

				reader.onerror = (error) => {
					reject(error);
				};

				reader.readAsDataURL(blob);
			})
			.catch((error) => reject(error));
	});
};

export default convertBlobUrlToBase64Handler;
