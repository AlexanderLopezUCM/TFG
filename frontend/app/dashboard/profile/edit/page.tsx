"use client";

import { UserDTO } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { Alert, Button, Flex, Form, Input, message, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title } = Typography;

type EditProfileFormProps = {
	data?: UserDTO;
	onFormFinished: (data: UserDTO) => void;
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({ data, onFormFinished }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (!data) return;

		form.setFieldsValue(data);
	}, [data]);

	return (
		<Form form={form} onFinish={onFormFinished} wrapperCol={{ span: 20 }} labelCol={{ span: 4 }}>
			<Form.Item<UserDTO> name="username" label="Username" rules={[{ required: true, message: "Please input username" }]}>
				<Input />
			</Form.Item>
			<Form.Item wrapperCol={{ span: 20, offset: 4 }}>
				<Button type="primary" htmlType="submit">
					Confirm changes
				</Button>
			</Form.Item>
		</Form>
	);
};
const EditProfilePage: React.FC = () => {
	const [profileData, setProfileData] = useState<UserDTO>();
	const [loading, setLoading] = useState<boolean>(true);
	const [messageApi, contextHolder] = message.useMessage();

	const router = useRouter();

	//  Initially fetch userID
	useEffect(() => {
		setLoading(true);
		authFetch("http://localhost:5047/api/user", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Couldn't retrieve user ID");
					return undefined;
				}

				return response.json();
			})
			.then((data: UserDTO) => {
				if (data === undefined) return;

				setProfileData(data);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const onBackButtonClicked = () => {
		router.push("/dashboard/profile");
	};
	const onFormFinished = (data: UserDTO) => {
		authFetch("http://localhost:5047/api/users", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		}).then((response) => {
			if (response.ok) {
				messageApi.success("Profile updated", 5);
				router.push("/dashboard/profile");
			} else messageApi.error("Could not update profile", 5);
		});
	};

	return (
		<>
			{contextHolder}
			<Title>Edit profile</Title>
			<Flex vertical gap="middle">
				<Space>
					<Button onClick={onBackButtonClicked}>Back</Button>
				</Space>
				{profileData ? <EditProfileForm data={profileData} onFormFinished={onFormFinished} /> : loading ? <></> : <Alert type="error" message="Could not load profile data" />}
			</Flex>
		</>
	);
};

export default EditProfilePage;
