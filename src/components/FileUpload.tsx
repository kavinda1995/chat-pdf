"use client";
import React from "react";
import { useDropzone } from 'react-dropzone';
import {Inbox} from "lucide-react";
import {uploadToS3} from "@/lib/s3";
import toast from "react-hot-toast";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";

const FileUpload = () => {

	const { mutate } = useMutation({
		mutationFn: async ({
			fileKey,
			fileName
		}: {
			fileKey: string,
			fileName: string
		}) => {
			const response = await axios.post('/api/create-chat', { fileKey, fileName });
		}
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { 'application/pdf': ['.pdf'] },
		maxFiles: 1,
		maxSize: 5000000,
		onDrop: async (acceptedFiles) => {
			console.log(acceptedFiles);
			const file = acceptedFiles[0];

			if (file.size > 10 * 1024 * 1024) {
				toast.error("File is too big! Please upload a smaller file...");
				return;
			}

			try {
				const data = await uploadToS3(file)
				console.log(data);
				if (!data || !data?.fileKey || !data?.fileName) {
					toast.error("Error uploading file to S3");
					return;
				}

				mutate(data, {
					onSuccess: (data) => {
						console.log(data)
					},
					onError: (err) => {
						console.error(err);
						toast.error("Something went wrong!");
					}
				});
			} catch (e) {
				console.error(e);
			}
		}
	});

	return (
		<div className="padding-2 bg-white rounded-xl">
			<div { ...getRootProps({
				className: 'border-dashed border-2 rounded-xl cursor-pointer bg- gray-50 py-8 flex justify-center items-center flex-col'
			}) }>
				<input { ...getInputProps() }/>
				<>
					<Inbox className="w-10 h-10 text-blue-500"/>
					<p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
				</>
			</div>
		</div>
	)
}

export default FileUpload;
