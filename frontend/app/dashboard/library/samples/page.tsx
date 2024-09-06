"use client";

//	Imports
import React, { useEffect, useState } from "react";
import { authFetch } from "@/src/authFetch";
import { Alert, Button, Flex, message, Modal, Space, Table, TableProps, Typography } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TableRowSelection } from "antd/es/table/interface";
import { SamplePreviewDTO, UserDTO } from "@/lib/Types";

const { Title, Paragraph } = Typography;

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

//	Component declaration
const Samples: React.FC = () => {
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const [tableData, setTableData] = useState<TableEntry[]>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfirmLoading, setModalConfirmLoading] = useState(false);

	const loadSamples = () => {
		authFetch(`http://localhost:5047/api/samples/previews/user`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not load sample previews");
					return undefined;
				}

				return response.json();
			})
			.then((data: SamplePreviewDTO[]) => {
				if (data === undefined) return;

				setTableData(
					data.map(
						(value: SamplePreviewDTO): TableEntry => ({
							key: value.id,
							name: value.name,
							description: value.description ?? "No description provided",
						})
					)
				);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => loadSamples,[]);

	const onCreateSample = () => {
		router.push("/dashboard/library/samples/create");
	};
	const onSelectedRowsChange = (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys);
	const onRowSelected: TableRowSelection<TableEntry> = {
		selectedRowKeys,
		onChange: onSelectedRowsChange,
	};
	const showModal = () => setModalOpen(true);
	const hideModal = () => setModalOpen(false);
	const onConfirmDeleteSamplesButtonClicked = () => {
		setModalConfirmLoading(true);

		const sampleIDs: number[] = selectedRowKeys.map((key) => parseInt(key.toString()));
		const body = { sampleIDS: sampleIDs };

		authFetch("http://localhost:5047/api/samples", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (!response.ok) {
				console.error("Could not delete samples");
				return undefined;
			}

			messageApi.open({
				type: "success",
				content: "Samples successfully deleted",
			});
			setModalConfirmLoading(false);
			hideModal();
			setSelectedRowKeys([]);
			loadSamples();
		});
	};
	const onCancelDeleteSamplesButtonClicked = () => hideModal();

	if (!loading && !tableData) return <Alert message="An error ocurred while loading the samples" />;

	return (
		<>
			{contextHolder}
			<Flex vertical={true} gap="middle">
				<Title>Samples</Title>
				<Space>
					<Button type="primary" icon={<FileAddOutlined />} onClick={onCreateSample}>
						Create
					</Button>
					<Button danger onClick={showModal} disabled={selectedRowKeys.length == 0}>
						Delete
					</Button>
				</Space>
				<Table columns={columns} dataSource={tableData} rowSelection={onRowSelected} loading={loading} />
			</Flex>
			<Modal
				open={modalOpen}
				title="Delete samples"
				onOk={onConfirmDeleteSamplesButtonClicked}
				onCancel={onCancelDeleteSamplesButtonClicked}
				confirmLoading={modalConfirmLoading}
				footer={[
					<Button key="cancel" onClick={onCancelDeleteSamplesButtonClicked}>
						Cancel
					</Button>,
					<Button key="delete" onClick={onConfirmDeleteSamplesButtonClicked} type="primary" danger>
						Delete
					</Button>,
				]}
			>
				Are you sure you wish to delete these {selectedRowKeys.length} samples?
			</Modal>
		</>
	);
};

export default Samples;
