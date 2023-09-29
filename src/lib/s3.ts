import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
	try {
		AWS.config.update({
			accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
		});

		const s3 = new AWS.S3({
			params: {
				Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
			},
			region: 'ap-southeast-1'
		});

		const fileKey = `uploads/${ Date.now().toString() }${ file.name.replace(' ', '-') }`;

		const uploadParams = {
			Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
			Key: fileKey,
			Body: file
		};

		const upload = s3.putObject(uploadParams)
			.on('httpUploadProgress', (progress) => {
				console.log('Upload progress: ', parseInt(((progress.loaded * 100) / progress.total).toString()));
			}).promise();

		await upload
			.then((data) => console.log('Upload success: ', data))
			.catch((error) => console.error('Upload error: ', error))

		return Promise.resolve({
			fileKey,
			fileName: file.name
		});
	} catch (error) {
		console.error(error);
	}
}

export function getS3Url(fileKey: string) {
	return `https://${ process.env.NEXT_PUBLIC_S3_BUCKET_NAME }.s3.ap-southeast-1.amazonaws.com/${ fileKey }`;
}
