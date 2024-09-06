"use client";

import { deleteToken } from "@/actions";
import { UserDTO } from "@/lib/Types";
import { authFetch } from "@/src/authFetch";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Descriptions, Divider, Flex, Input, Modal, Skeleton, Space, Typography } from "antd";
import { DescriptionsProps } from "antd/lib";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

const { Title } = Typography;

interface ProfileData {
	username: string;
}

const ProfilePage: React.FC = () => {
	const [profileData, setProfileData] = useState<ProfileData>();
	const [profileDataLoading, setProfileDataLoading] = useState<boolean>(true);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [isConfirmValid, setIsConfirmValid] = useState<boolean>(false);
	const router = useRouter();

	const items: DescriptionsProps["items"] = profileData
		? [
				{
					key: "username",
					label: "Username",
					children: <p>{profileData.username}</p>,
				},
		  ]
		: [];

	useEffect(() => {
		setProfileDataLoading(true);
		authFetch("http://localhost:5047/api/user", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Couldn't retrieve user data");
					return undefined;
				}

				return response.json();
			})
			.then((data: UserDTO) => {
				if (data === undefined) return;

				setProfileData(data);
			})
			.finally(() => {
				setProfileDataLoading(false);
			});
	}, []);

	const onEditAccountButtonClicked = () => router.push("/dashboard/profile/edit");
	const onDeleteAccountButtonClicked = () => showModal();
	const hideModal = () => setModalOpen(false);
	const showModal = () => setModalOpen(true);
	const handleConfirmUsernameChange = (event: ChangeEvent<HTMLInputElement>) => profileData && setIsConfirmValid(event.target.value === profileData.username);
	const onConfirmDeleteAccount = () => {
		authFetch(`http://localhost:5047/api/user`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not delete user");
					return;
				}

				deleteToken().then(() => {
					router.push("/");
				});
			})
			.catch();
	};

	return (
		<>
			{profileData ? (
				<>
					<Title>{profileData.username}'s Profile</Title>
					<Descriptions items={items} column={1} />
					<Divider />
					<Space>
						<Button type="primary" onClick={onEditAccountButtonClicked}>
							Edit account
						</Button>
						<Button danger type="primary" onClick={onDeleteAccountButtonClicked}>
							Delete account
						</Button>
					</Space>

					{/* Delete account modal */}
					<Modal
						title={
							<Space>
								<ExclamationCircleOutlined style={{ color: "red" }} />
								<p style={{ margin: 0 }}>Delete account</p>
							</Space>
						}
						open={modalOpen}
						closable
						centered
						onCancel={hideModal}
						footer={
							<Space>
								<Button onClick={hideModal}>Cancel</Button>
								<Button danger type="primary" disabled={!isConfirmValid} onClick={onConfirmDeleteAccount}>
									Delete account
								</Button>
							</Space>
						}
					>
						<Flex vertical style={{ padding: 20 }}>
							<p>Are you sure you want to delete your account? This process is irreversible</p>
							<p>Write your username here to make sure</p>
							<Input placeholder={profileData.username} onChange={handleConfirmUsernameChange} />
						</Flex>
					</Modal>
				</>
			) : profileDataLoading ? (
				<Skeleton active />
			) : (
				<Alert type="warning" message="Could not load user data" />
			)}
		</>
	);
};

export default ProfilePage;
