"use client";

import { AsyncFeedback } from "@/components/asyncStateSpin";
import SampleMetadataForm from "@/components/sampleMetadataForm";
import { PatchSampleDTO, SampleDTO, SampleMetadata } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, message, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Title } = Typography;

const EditSamplePage: React.FC = () => {
	const [sampleMetadata, setSampleMetadata] = useState<SampleMetadata>();
	const [loading, setLoading] = useState<boolean>(true);
	const [messageApi, contextHolder] = message.useMessage();

	const router = useRouter();
	const params = useSearchParams();
	const id = Number.parseInt(params.get("id") ?? "-1");

	const onBackButtonClicked = () => router.push(`/dashboard/library/samples/view?id=${id}`);
	const onFormFinished = (data: SampleMetadata) => {
		if (id == null) {
			console.error("Sample ID not found");
			return;
		}

		const sampleDTO: PatchSampleDTO = { ...data, id: id };

		authFetch("http://localhost:5047/api/samples", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(sampleDTO),
		}).then((response) => {
			if (response.ok) {
				messageApi.success("Sample updated", 5);
				router.push(`/dashboard/library/samples/view?id=${id}`);
			} else messageApi.error("Could not update sample", 5);
		});
	};

	useEffect(() => {
		setLoading(true);
		authFetch(`http://localhost:5047/api/samples/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not load sample data");
					return undefined;
				}

				return response.json();
			})
			.then((data: SampleDTO) => {
				if (!data) return;

				setSampleMetadata({ ...data });
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id]);

	return (
		<>
			{contextHolder}
			<Title>Edit sample</Title>

			<Button onClick={onBackButtonClicked}>
				<ArrowLeftOutlined />
			</Button>

			<AsyncFeedback loading={loading} success={sampleMetadata !== undefined} failedMessage="Could not load sample data">
				{sampleMetadata && <SampleMetadataForm initialValues={sampleMetadata} onFinish={onFormFinished} />}
			</AsyncFeedback>
		</>
	);
};

export default EditSamplePage;
