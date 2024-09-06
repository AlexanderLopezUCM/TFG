"use client";

import { AsyncFeedback } from "@/components/asyncStateSpin";
import { ViewCollectionDTO, CollectionMetadata, SamplePreviewDTO } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Descriptions, DescriptionsProps, Flex, message, Modal, Space, Table, TableProps, Tag, Typography } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Paragraph, Title } = Typography;

interface TableEntry {
	key: number;
	name: string;
	description: string;
}

const columns: TableProps<TableEntry>["columns"] = [
	{
		title: "Name",
		dataIndex: "name",
		key: "name",
		render: (text, record) => <Link href={`/dashboard/library/samples/view?id=${record.key}`}>{text}</Link>,
	},
	{
		title: "Description",
		dataIndex: "description",
		key: "description",
		render: (text) => <Paragraph ellipsis={{ rows: 2, expandable: false }}>{text}</Paragraph>,
	},
];

const ViewCollectionPage: React.FC = () => {
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const [metadata, setMetadata] = useState<CollectionMetadata>();
	const [sampleTableData, setSampleTableData] = useState<TableEntry[]>();
	const [loading, setLoading] = useState<boolean>(true);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [modalConfirmLoading, setModalConfirmLoading] = useState(false);

	const params = useSearchParams();
	const id = params.get("id");

	const items: DescriptionsProps["items"] = metadata && [
		{
			key: "name",
			label: "Name",
			children: metadata.name,
		},
		{
			key: "description",
			label: "Description",
			children: metadata.description ?? "No description provided",
		},
		{
			key: "tags",
			label: "Tags",
			children: metadata.tags ? metadata.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>) : "No tags",
		},
		{
			key: "publicationStatus",
			label: "Publication Status",
			children: ["Private", "Public"][metadata.publicationStatus],
		},
	];

	useEffect(() => {
		setLoading(true);
		authFetch(`http://localhost:5047/api/collections/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not load collection data");
					return undefined;
				}

				return response.json();
			})
			.then((data: ViewCollectionDTO) => {
				if (!data) return;

				setMetadata({ ...data });
			})
			.finally(() => setLoading(false));
	}, [id]);
	useEffect(() => {
		if (!metadata) return;

		authFetch(`http://localhost:5047/api/samples/previews/collection/${metadata.id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not load samples in collection");
					return undefined;
				}

				return response.json();
			})
			.then((data: SamplePreviewDTO[]) => {
				if (!data) return;

				setSampleTableData(
					data.map(
						(value: SamplePreviewDTO): TableEntry => ({
							key: value.id,
							name: value.name,
							description: value.description ?? "No description provided",
						})
					)
				);
			});
	}, [metadata]);

	const onBackButtonClicked = () => router.push("/dashboard/library/collections");
	const onEditCollectionButtonClicked = () => router.push(`/dashboard/library/collections/edit?id=${id}`);
	const onDeleteCollectionButtonClicked = () => showModal();

	const onConfirmDeleteCollectionButtonClicked = () => {
		setModalConfirmLoading(true);

		//	TODO: Change to DTO
		const body = JSON.stringify({ sampleIDs: [Number(id)] });

		authFetch(`http://localhost:5047/api/collections/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => {
			if (!response.ok) {
				console.error("Could not delete collection");
				return;
			}

			setModalConfirmLoading(true);
			messageApi.success("Collection deleted correctly", 5);
			router.push("/dashboard/library/collections");
		});
	};
	const onCancelDeleteCollectionButtonClicked = () => hideModal();

	const showModal = () => setModalOpen(true);
	const hideModal = () => setModalOpen(false);

	return (
		<>
			{contextHolder}
			<AsyncFeedback loading={loading} success={metadata !== undefined} failedMessage="Could not load collection">
				{metadata && (
					<Flex vertical gap="middle">
						<Title level={1} style={{ margin: 0 }}>
							{metadata.name}
						</Title>

						<Flex gap="small">
							<Button onClick={onBackButtonClicked}>
								<ArrowLeftOutlined />
							</Button>

							<Space style={{ marginLeft: "auto" }}>
								<Button type="primary" onClick={onEditCollectionButtonClicked}>
									Edit
								</Button>
								<Button type="primary" danger onClick={onDeleteCollectionButtonClicked}>
									Delete
								</Button>
							</Space>
						</Flex>
						<Descriptions items={items} column={1} />
						<Table columns={columns} dataSource={sampleTableData} />
					</Flex>
				)}
			</AsyncFeedback>
			{metadata && (
				<Modal
					open={modalOpen}
					title="Delete collection"
					onOk={onConfirmDeleteCollectionButtonClicked}
					onCancel={onCancelDeleteCollectionButtonClicked}
					confirmLoading={modalConfirmLoading}
					footer={[
						<Button key="cancel" onClick={onCancelDeleteCollectionButtonClicked}>
							Cancel
						</Button>,
						<Button key="delete" onClick={onConfirmDeleteCollectionButtonClicked} type="primary" danger>
							Delete
						</Button>,
					]}
				>
					Are you sure you wish to delete {metadata.name}?
				</Modal>
			)}
		</>
	);
};

export default ViewCollectionPage;
