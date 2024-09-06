"use client";

import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { authFetch } from "@/src/authFetch";
import ModelRenderer from "@/components/modelRenderer";
import SampleMetadataDisplay from "@/components/sampleMetadataDisplay";
import { Button, Flex, Input, message, Modal, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { SampleDTO, SampleMetadata } from "@/lib/Types";

const { Title } = Typography;

interface ModelDTO {
	modelFile: string;
}

const fetchInit = {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
};

const Sample: React.FC = () => {
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const [metadata, setMetadata] = useState<SampleMetadata>();
	const [model, setModel] = useState<ModelDTO | undefined>(undefined);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [modalConfirmLoading, setModalConfirmLoading] = useState(false);

	const params = useSearchParams();
	const id = params.get("id");

	useEffect(() => {
		//	Fetch metadata
		authFetch(`http://localhost:5047/api/samples/${id}`, fetchInit)
			.then((data) => {
				if (!data.ok) {
					console.error("Could not fetch sample metadata");
					return undefined;
				}

				return data.json();
			})
			.then((data: SampleDTO) => {
				if (!data) return;

				setMetadata({ ...data });
			});

		//	Fetch 3D model
		authFetch(`http://localhost:5047/api/models/${id}`, fetchInit)
			.then((data) => {
				if (!data.ok) {
					console.error("Could not fetch 3D model");
					return undefined;
				}
				return data.json();
			})
			.then((model: ModelDTO) => {
				if (!model) return;

				setModel(model);
			});
	}, [id]);

	const onBackButtonClicked = () => router.back();
	const onEditSampleButtonClicked = () => router.push(`/dashboard/library/samples/edit?id=${id}`);
	const onDeleteSampleButtonClicked = () => showModal();
	const onConfirmDeleteSampleButtonClicked = () => {
		setModalConfirmLoading(true);

		//	TODO: Change to DTO
		const body = JSON.stringify({ sampleIDs: [Number(id)] });

		authFetch("http://localhost:5047/api/samples", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: body,
		}).then((response) => {
			if (!response.ok) {
				console.error("Could not delete sample");
				return;
			}

			setModalConfirmLoading(true);
			messageApi.success("Sample deleted correctly", 5);
			router.push("/dashboard/library/samples");
		});
	};
	const onCancelDeleteSampleButtonClicked = () => hideModal();

	const showModal = () => setModalOpen(true);
	const hideModal = () => setModalOpen(false);

	return (
		<>
			{contextHolder}
			<Flex vertical gap="middle">
				<Title level={1} style={{ margin: 0 }}>
					{metadata?.name}
				</Title>
				
				<Flex gap="small">
					<Button onClick={onBackButtonClicked}>
						<ArrowLeftOutlined />
					</Button>

					<Space style={{ marginLeft: "auto" }}>
						<Button type="primary" onClick={onEditSampleButtonClicked}>
							Edit
						</Button>
						<Button type="primary" danger onClick={onDeleteSampleButtonClicked}>
							Delete
						</Button>
					</Space>
				</Flex>
				{metadata && <SampleMetadataDisplay {...metadata} />}
				{model && <ModelRenderer model={model.modelFile} />}
				{metadata && (
					<Modal
						open={modalOpen}
						title="Delete samples"
						onOk={onConfirmDeleteSampleButtonClicked}
						onCancel={onCancelDeleteSampleButtonClicked}
						confirmLoading={modalConfirmLoading}
						footer={[
							<Button key="cancel" onClick={onCancelDeleteSampleButtonClicked}>
								Cancel
							</Button>,
							<Button key="delete" onClick={onConfirmDeleteSampleButtonClicked} type="primary" danger>
								Delete
							</Button>,
						]}
					>
						Are you sure you wish to delete {metadata.name}?
					</Modal>
				)}
			</Flex>
		</>
	);
};

export default Sample;
