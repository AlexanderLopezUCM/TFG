"use client";

import DescriptionFormItem from "@/components/form/descriptionFormItem";
import NameFormItem from "@/components/form/nameFormItem";
import PublicationStatusFormItem from "@/components/form/publicationStatusFormItem";
import SampleTransferFormItem from "@/components/form/sampleTransferFormItem";
import TagsFormItem from "@/components/form/tagsFormItem";
import { TableTransferProps } from "@/components/tableTransfer";
import { CreateCollectionDTO, CreateCollectionResponseDTO, SamplePreviewDTO, UserDTO } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, TransferProps, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title } = Typography;

const CreateCollectionPage: React.FC = () => {
	const router = useRouter();
	const [form] = Form.useForm();

	const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([]);
	const [sampleData, setSampleData] = useState<SamplePreviewDTO[]>();

	useEffect(() => {
		authFetch(`http://localhost:5047/api/samples/previews/user`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not get samples previews");
					return undefined;
				}

				return response.json();
			})
			.then((data: SamplePreviewDTO[]) => {
				if (!data) return;

				setSampleData(data);
			});
	}, []);

	const handleTransferChange: TableTransferProps["onChange"] = (nextTargetKeys) => setTargetKeys(nextTargetKeys);
	const onBackButtonClicked = () => router.back();
	const onFormFinished = (data: CreateCollectionDTO) => {
		//	This contains the indices of the samples in the table
		data.sampleIDs = data.sampleIDs?.map((value) => Number.parseInt(value.toString())) ?? [];
		//	This contains the ids of the samples themselves
		data.sampleIDs = sampleData?.filter((value, index) => data.sampleIDs?.includes(index)).map(value => value.id);

		authFetch("http://localhost:5047/api/collections", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not create collection");
					return undefined;
				}

				return response.json();
			})
			.then((data: CreateCollectionResponseDTO) => {
				if (!data) return;

				router.push(`/dashboard/library/collections/view?id=${data.id}`);
			});
	};
	const onFailure = () => {};

	return (
		<>
			<Title>Create collection</Title>
			<Button onClick={onBackButtonClicked}>
				<ArrowLeftOutlined />
			</Button>
			<Form
				form={form}
				name="create-collection"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				labelWrap
				initialValues={{ publicationStatus: 0 }}
				onFinish={onFormFinished}
				onFinishFailed={onFailure}
				autoComplete="off"
			>
				<NameFormItem />
				<DescriptionFormItem />
				<TagsFormItem />
				<PublicationStatusFormItem />
				<SampleTransferFormItem data={sampleData} targetKeys={targetKeys} onTableTransferChange={handleTransferChange} />
				<Form.Item wrapperCol={{ offset: 4 }}>
					<Button type="primary" htmlType="submit">
						Create
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default CreateCollectionPage;
