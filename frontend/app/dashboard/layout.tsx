"use client";
import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Col, Flex, Menu, Row, Typography } from "antd";
import { FolderOutlined, LogoutOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { deleteToken } from "@/actions";
import { geekblue } from "@ant-design/colors";

const { Title } = Typography;

interface MenuItem {
	key: string;
	label: string;
	icon?: ReactNode;
	value: ReactNode;
	children?: MenuItem[];
}

const mainMenuItems: MenuItem[] = [
	{
		key: "search",
		label: "Search",
		icon: <SearchOutlined />,
		value: <>Search</>,
	},
	{
		key: "library",
		label: "My Library",
		icon: <FolderOutlined />,
		value: <>My Library</>,
		children: [
			{
				key: "library/samples",
				label: "Samples",
				value: <>Samples</>,
			},
			{
				key: "library/collections",
				label: "Collections",
				value: <>Collections</>,
			},
		],
	},
	{
		key: "profile",
		label: "Profile",
		icon: <UserOutlined />,
		value: <>Profile</>,
	},
	{
		key: "logout",
		label: "Logout",
		icon: <LogoutOutlined />,
		value: <>Logout</>,
	},
];

const menuPages = ["search", "library/samples", "library/collections", "profile"];

const siderStyle: React.CSSProperties = {
	overflow: "auto",
	height: "100vh",
	position: "sticky",
	insetInlineStart: 0,
	top: 0,
	bottom: 0,
	scrollbarWidth: "thin",
	scrollbarColor: "unset",
	boxShadow: "5px 0px 5px rgb(240, 240, 240)",
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const pathname = usePathname().replace("/dashboard/", "");

	const onLogout = () => {
		deleteToken().then(() => {
			router.push("/");
		});
	};
	const onMenuItemSelected = ({ key }: { key: string }) => {
		if (menuPages.find((value: string) => value === key)) router.push(`/dashboard/${key}`);
		else {
			switch (key) {
				case "logout":
					onLogout();
					break;
			}
		}
	};

	const key = mainMenuItems.find((value) => value.key === pathname)?.key;
	const defaultSelectedKey = key !== undefined ? [key] : key;

	return (
		<Row style={{ minHeight: "100vh" }}>
			<Col xs={0} md={8} lg={6} xl={5} style={siderStyle}>
				<Title level={4} style={{ margin: 4, padding: "10px 24px" }}>
					GeoVault
				</Title>
				<Menu items={mainMenuItems} defaultSelectedKeys={defaultSelectedKey} mode="inline" onSelect={onMenuItemSelected} />
			</Col>
			<Col xs={24} md={16} lg={18} xl={19} style={{ padding: "30px 15px", backgroundColor: geekblue[0] }}>
				<Row>
					<Col md={0} lg={4} />
					<Col md={24} lg={16} style={{ width: "100%" }}>
						{children}
					</Col>
					<Col md={0} lg={4} />
				</Row>
			</Col>
		</Row>
	);
};

export default DashboardLayout;
