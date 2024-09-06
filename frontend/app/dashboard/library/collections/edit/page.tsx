"use client";

import DescriptionFormItem from "@/components/form/descriptionFormItem";
import NameFormItem from "@/components/form/nameFormItem";
import PublicationStatusFormItem from "@/components/form/publicationStatusFormItem";
import SampleTransferFormItem from "@/components/form/sampleTransferFormItem";
import TagsFormItem from "@/components/form/tagsFormItem";
import { TableTransferProps } from "@/components/tableTransfer";
import { CollectionDTO, CollectionMetadata, PatchCollectionDTO, SamplePreviewDTO, UserDTO, ViewCollectionDTO } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Skeleton, TransferProps, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Title } = Typography;

const EditCollectionPage: React.FC = () => {
	const router = useRouter();
	const [form] = Form.useForm();

	const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([]);
	const [userID, setUserID] = useState<number>();
	const [sampleData, setSampleData] = useState<SamplePreviewDTO[]>();
	const params = useSearchParams();
	const [metadata, setMetadata] = useState<CollectionMetadata>();
	const [loading, setLoading] = useState<boolean>(true);
	const id = params.get("id");

	
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
		authFetch("http://localhost:5047/api/user", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not retrieve user data");
					return undefined;
				}

				return response.json();
			})
			.then((data: UserDTO) => {
				if (!data) return;

				setUserID(data.id);
			});
	}, []);
	
	useEffect(() => {
		if (!userID || !metadata) return;

		authFetch(`http://localhost:5047/api/samples/previews?userID=${userID}`, {
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

				const samples = metadata.sampleIDs?.map(e => "" + data.findIndex(sample => +sample.id === +e)).filter(e => e as any !== "-1");				
				setTargetKeys(samples as any);
				setSampleData(data);
			});
	}, [userID, metadata]);

	const handleTransferChange: TableTransferProps["onChange"] = (nextTargetKeys) => setTargetKeys(nextTargetKeys);
	const onBackButtonClicked = () => router.back();
	const onFormFinished = (data: CollectionDTO) => {
		delete (data as any).samplesID;
		authFetch("http://localhost:5047/api/collections", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...data, ID: id, sampleIDs: sampleData?.filter((e, i) => targetKeys?.includes("" + i) ).map(e => e.id)}),
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not edit collection");
					return undefined;
				} else {
				router.push(`/dashboard/library/collections/view?id=${id}`);
					
				}
			})
	};
	const onFailure = () => {};
	return loading ? <Skeleton active /> : (
		<>
			<Title>Edit collection</Title>
			<Button onClick={onBackButtonClicked}>
				<ArrowLeftOutlined />
			</Button>
			<Form
				form={form}
				name="edit-collection"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				labelWrap
				initialValues={metadata}
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
						Save
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default EditCollectionPage;
