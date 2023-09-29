"use client";
import React, {useState} from "react";
import { useDropzone } from 'react-dropzone';
import {Inbox, Loader2} from "lucide-react";
import {uploadToS3} from "@/lib/s3";
import toast from "react-hot-toast";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosResponse} from "axios";
import {NextResponse} from "next/server";

const FileUpload = () => {

	const [isUploading, setIsUploading] = useState(false);

	const { mutate, isLoading } = useMutation({
		mutationFn: async ({
			fileKey,
			fileName
		}: {
			fileKey: string,
			fileName: string
		}) => {
			return await axios.post('/api/create-chat', { fileKey, fileName });
		}
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { 'application/pdf': ['.pdf'] },
		maxFiles: 1,
		maxSize: 5000000,
		onDrop: async (acceptedFiles) => {
			setIsUploading(true);
			const file = acceptedFiles[0];

			if (file.size > 10 * 1024 * 1024) {
				toast.error("File is too big! Please upload a smaller file...");
				return;
			}

			try {
				const data = await uploadToS3(file)
				setIsUploading(false);
				if (!data || !data?.fileKey || !data?.fileName) {
					toast.error("Error uploading file to S3");
					return;
				}

				toast.success("File uploaded successfully! Please wait while we process your file...");

				// Calling our BE to save the data into pinecone db
				mutate(data, {
					onSuccess: (data: AxiosResponse<{message: string}>) => {
						toast.success(data.data.message);
					},
					onError: (err) => {
						console.error(err);
						toast.error("Something went wrong while processing your file!");
					}
				});
			} catch (e) {
				toast.error("Something went wrong!");
			}
		}
	});

	return (
		<div className="padding-2 bg-white rounded-xl">
			<div { ...getRootProps({
				className: 'border-dashed border-2 rounded-xl cursor-pointer bg- gray-50 py-8 flex justify-center items-center flex-col'
			}) }>
				<input { ...getInputProps() }/>
				{ (isUploading || isLoading) ? (
					<>
						<Loader2 className="h-10 w-10 text-blue-500 animate-spin"/>
						<p className="mt-2 text-sm text-slate-400">Spilling tea to GPT...</p>
					</>
					) : (
					<>
						<Inbox className="w-10 h-10 text-blue-500"/>
						<p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
					</>
				) }
			</div>
		</div>
	)
}

export default FileUpload;
