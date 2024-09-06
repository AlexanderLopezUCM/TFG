"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Flex, message, Modal, Space, Table, TableProps, Typography } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { TableRowSelection } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { getToken } from "@/actions";
import { authFetch } from "@/src/authFetch";
import Link from "next/link";

const { Title } = Typography;

interface CollectionPreview {
	id: number;
	name: string;
	description: string;
}
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
		render: (text, record) => <Link href={`/dashboard/library/collections/view?id=${record.key}`}>{text}</Link>,
	},
	{
		title: "Description",
		dataIndex: "description",
		key: "description",
	},
];

const Collections: React.FC = () => {
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const [tableData, setTableData] = useState<TableEntry[]>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfirmLoading, setModalConfirmLoading] = useState(false);

	const loadCollections = useCallback(() => {
		authFetch("http://localhost:5047/api/collections/previews/user", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not fetch collection previews");
					return undefined;
				}

				return response.json();
			})
			.then((data: CollectionPreview[]) => {
				if (!data) return;

				setTableData(
					data.map(
						(value: CollectionPreview): TableEntry => ({
							key: value.id,
							name: value.name,
							description: value.description ?? "No description provided",
						})
					)
				);
			})
			.finally(() => setLoading(false));
	}, []);

	const onCreateCollectionButtonClicked = () => {
		router.push("/dashboard/library/collections/create");
	};
	const onSelectedRowsChange = (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys);
	const onRowSelected: TableRowSelection<TableEntry> = {
		selectedRowKeys,
		onChange: onSelectedRowsChange,
	};
	const showModal = () => setModalOpen(true);
	const hideModal = () => setModalOpen(false);
	const onDeleteModalConfirm = () => {
		setModalConfirmLoading(true);

		const collectionIDs: number[] = selectedRowKeys.map((key) => parseInt(key.toString()));
		const body = { collectionIDS: collectionIDs };

		fetch("http://localhost:5047/api/collections", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})
			.then(() => {
				messageApi.open({
					type: "success",
					content: "Collections successfully deleted",
				});
				setModalConfirmLoading(false);
				hideModal();
				setSelectedRowKeys([]);
				loadCollections();
			})
			.catch((reason) => console.log(reason));
	};
	const onDeleteModalCancel = () => {
		hideModal();
	};

	useEffect(loadCollections, []);

	return (
		<>
			{contextHolder}
			<Flex vertical={true} gap="middle">
				<Title>Collections</Title>
				<Space>
					<Button type="primary" icon={<FileAddOutlined />} onClick={onCreateCollectionButtonClicked}>
						Create
					</Button>
					<Button danger onClick={showModal} disabled={selectedRowKeys.length == 0}>
						Delete
					</Button>
				</Space>
				<Table columns={columns} dataSource={tableData} rowSelection={onRowSelected} loading={loading}></Table>
			</Flex>
			<Modal
				open={modalOpen}
				title="Delete collections"
				onOk={onDeleteModalConfirm}
				onCancel={onDeleteModalCancel}
				confirmLoading={modalConfirmLoading}
				footer={[
					<Button key="cancel" onClick={onDeleteModalCancel}>
						Cancel
					</Button>,
					<Button key="delete" onClick={onDeleteModalConfirm} type="primary" danger>
						Delete
					</Button>,
				]}
			>
				Are you sure you wish to delete these {selectedRowKeys.length} collections?
			</Modal>
		</>
	);
};

export default Collections;
