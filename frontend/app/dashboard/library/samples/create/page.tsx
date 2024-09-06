"use client";

import ModelRenderer from "@/components/modelRenderer";
import SampleMetadataDisplay from "@/components/sampleMetadataDisplay";
import SampleMetadataForm from "@/components/sampleMetadataForm";
import { CreateSampleDTO, SampleMetadata } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Steps, Button, Space, Divider, Upload, Flex, Typography, UploadProps, Spin, Result, Alert } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface ModelDTO {
	modelFile: string;
}
interface JobStatus<T> {
	id: string;
	status: number;
	data: T;
}

interface MetadataStepProps {
	sampleMetadata?: SampleMetadata;
	setMetadata: React.Dispatch<React.SetStateAction<any>>;
	nextStep: () => void;
}
interface ModelStepProps {
	modelFile?: string;
	setModelFile: React.Dispatch<React.SetStateAction<any>>;
	setModelID: React.Dispatch<React.SetStateAction<any>>;
	nextStep: () => void;
	previousStep: () => void;
}
interface SummaryStepProps {
	sampleMetadata?: SampleMetadata;
	modelFile?: string;
	finish: () => void;
	previousStep: () => void;
}

//  Auxiliary components
const MetadataStep: React.FC<MetadataStepProps> = ({ sampleMetadata, nextStep, setMetadata }) => {
	const onFinish = (values: SampleMetadata) => {
		setMetadata(values);
		nextStep();
	};

	return <SampleMetadataForm initialValues={sampleMetadata} onFinish={onFinish} />;
};

const ModelStep: React.FC<ModelStepProps> = ({ modelFile, setModelFile, setModelID, nextStep, previousStep }) => {
	const [jobStatus, setJobStatus] = useState<JobStatus<ModelDTO>>();
	let intervalID = useRef<NodeJS.Timeout>();

	const pollJobStatus = useCallback(() => {
		if (!jobStatus) return;

		authFetch(`http://localhost:5047/api/models/jobs/${jobStatus.id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response: Response) => response.json())
			.then((jobStatus: JobStatus<ModelDTO>) => {
				if (jobStatus.status === 1) setJobStatus(jobStatus);
			});
	}, [jobStatus?.id]);
	const onFinish = () => {
		nextStep();
	};

	useEffect(() => {
		if (!jobStatus) return;

		switch (jobStatus.status) {
			case 0:
				{
					intervalID.current = setInterval(pollJobStatus, 5000);
				}
				break;
			case 1:
				{
					setModelFile(jobStatus.data.modelFile);
					setModelID(jobStatus.id);
					clearInterval(intervalID.current);
				}
				break;
		}
	}, [jobStatus, pollJobStatus]);

	const props: UploadProps = {
		name: "file",
		accept: "image/jpg, image/jpeg, image/png",
		customRequest: ({ file }) => {
			const formData = new FormData();

			formData.append("ModelImage", file);

			authFetch("http://localhost:5047/api/models/jobs", {
				method: "POST",
				body: formData,
			})
				.then((data) => data.json())
				.then((jobStatus: JobStatus<ModelDTO>) => setJobStatus(jobStatus));
		},
		multiple: false,
		maxCount: 1,
	};

	let draggerContent = (
		<Dragger {...props}>
			<p className="ant-upload-drag-icon">
				<UploadOutlined />
			</p>
			<p className="ant-upload-text">Click or drag image to this area to upload</p>
			<p className="ant-upload-hint">Only JPG, JPEG and PNG files supported. Make sure your background has as little details as possible.</p>
		</Dragger>
	);

	if (jobStatus && jobStatus.status === 0) draggerContent = <Spin tip={<b>Generating model...</b>}>{draggerContent}</Spin>;

	const modelReady = modelFile !== undefined;

	return (
		<Flex vertical gap="middle">
			<Space>
				<Button onClick={() => previousStep()}>Back</Button>
				<Button type="primary" disabled={!modelReady} onClick={() => onFinish()}>
					Next
				</Button>
			</Space>

			{draggerContent}

			{modelReady && <ModelRenderer model={modelFile} />}
		</Flex>
	);
};

const SummaryStep: React.FC<SummaryStepProps> = ({ sampleMetadata, modelFile, finish, previousStep }) => {
	return (
		<>
			<Space>
				<Button onClick={previousStep}>Back</Button>
				<Button type="primary" onClick={finish}>
					Finish
				</Button>
			</Space>

			<div style={{ marginTop: 10, marginBottom: 10 }}>
				<Text strong>Metadata</Text>
			</div>

			{sampleMetadata ? <SampleMetadataDisplay {...sampleMetadata} /> : <Alert type="error" message="Couldn't load sample metadata" />}

			<Divider />

			<div style={{ marginTop: 10, marginBottom: 10 }}>
				<Text strong>3D Model</Text>
			</div>

			<ModelRenderer model={modelFile} />
		</>
	);
};

//  Main component
const CreateSampleForm: React.FC = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [sampleMetadata, setSampleMetadata] = useState<SampleMetadata>();
	const [modelFile, setModelFile] = useState<string>();
	const [modelID, setModelID] = useState<string>();
	const [sampleID, setSampleID] = useState<number>();
	const [formCompleted, setFormCompleted] = useState<boolean>(false);
	const router = useRouter();

	const nextStep = () => setCurrentStep(currentStep + 1);
	const previousStep = () => setCurrentStep(currentStep - 1);

	const onFinish = () => {
		if (!sampleMetadata) {
			console.error("Metadata is undefined in onFinish!");
			return;
		}
		if (!modelID) {
			console.error("Model ID is undefined in onFinish!");
			return;
		}

		const createSampleDTO: CreateSampleDTO = {
			...sampleMetadata,
			modelID: modelID,
		};

		console.log("Finished creation step", JSON.stringify(createSampleDTO));

		authFetch("http://localhost:5047/api/samples", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(createSampleDTO),
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not create sample");
					return undefined;
				}

				return response.json();
			})
			.then((data: undefined | number) => {
				if (!data) return;

				const id: number = data;

				console.log(id);

				setSampleID(id);
				setFormCompleted(true);
			});
	};
	const onViewCreatedSample = () => {
		const id = sampleID;
		router.push(`/dashboard/library/samples/view?id=${id}`);
	};

	const steps = [
		{
			title: "Metadata",
			content: <MetadataStep sampleMetadata={sampleMetadata} setMetadata={setSampleMetadata} nextStep={nextStep} />,
		},
		{
			title: "3D Model",
			content: <ModelStep modelFile={modelFile} setModelFile={setModelFile} setModelID={setModelID} nextStep={nextStep} previousStep={previousStep} />,
		},
		{
			title: "Summary",
			content: <SummaryStep sampleMetadata={sampleMetadata} modelFile={modelFile} finish={onFinish} previousStep={previousStep} />,
		},
	];
	const onBackButtonClicked = () => router.push("/dashboard/library/samples");

	return (
		<>
			{formCompleted ? (
				<Result
					status="success"
					title="Sample created successfully"
					extra={[
						<Button type="primary" key="show-sample" onClick={onViewCreatedSample}>
							Go to sample
						</Button>,
					]}
				/>
			) : (
				<>
					<Title>Create sample</Title>
					<Space>
						<Button onClick={onBackButtonClicked}>
							<ArrowLeftOutlined />
						</Button>
					</Space>
					<Steps current={currentStep} items={steps} style={{ paddingTop: 20, paddingBottom: 20 }} />
					<div style={{ paddingTop: 20, paddingBottom: 20 }}>{steps[currentStep].content}</div>
				</>
			)}
		</>
	);
};

export default CreateSampleForm;
