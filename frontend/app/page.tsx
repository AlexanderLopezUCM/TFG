"use client";

import { useRouter } from "next/navigation";
import { storeToken } from "@/actions";
import React, { useState } from "react";
import { message, Spin, type TabsProps } from "antd";
import { Button, Card, Form, Input, Tabs, Typography } from "antd/lib";
import { geekblue } from "@ant-design/colors";
import "antd/dist/reset.css";
import "./login.css";
import { AuthLoginDTO } from "./lib/Types";

const { Title } = Typography;

interface FormProps {
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	showError: (errorMessage: string) => void;
}

const LoginForm: React.FC<FormProps> = ({ setLoading, showError }) => {
	const [formData] = Form.useForm();
	const router = useRouter();

	const onFinish = async (values: any) => {
		setLoading(true);

		//	Post login request
		fetch("http://localhost:5047/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: values.username,
				passwordHash: values.password,
			}),
		})
			.then((response) => {
				if (response.ok)
					response.json().then((data: AuthLoginDTO) => {
						storeToken(data.token).then(() => router.push("dashboard"));
					});
				else showError("Invalid username or password");
			})
			.catch(() => {
				showError("Could not contact the server");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<Form form={formData} name="login" onFinish={onFinish}>
			<Form.Item name="username" rules={[{ required: true, message: "Please input your username" }]}>
				<Input placeholder="Username"></Input>
			</Form.Item>

			<Form.Item name="password" rules={[{ required: true, message: "Please input your password" }]}>
				<Input.Password placeholder="Password"></Input.Password>
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit">
					Login
				</Button>
			</Form.Item>
		</Form>
	);
};

const RegisterForm: React.FC<FormProps> = ({ setLoading, showError }) => {
	const [form] = Form.useForm();
	const router = useRouter();

	const onFinish = async (values: any) => {
		setLoading(true);

		//	Post register request
		fetch("http://localhost:5047/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: values.username,
				passwordHash: values.password,
			}),
		})
			.then((data) => data.json())
			.then((data: AuthLoginDTO) => {
				storeToken(data.token).then(() => router.push("dashboard"));
			})
			.catch(() => {
				showError("Could not contact the server");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<Form form={form} name="register" onFinish={onFinish}>
			<Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
				<Input placeholder="Username" />
			</Form.Item>

			<Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
				<Input.Password placeholder="Password" />
			</Form.Item>

			<Form.Item
				name="confirm"
				dependencies={["password"]}
				hasFeedback
				rules={[
					{ required: true, message: "Please confirm your password!" },
					({ getFieldValue }) => ({
						validator(_: any, value: string) {
							return !value || getFieldValue("password") === value ? Promise.resolve() : Promise.reject(new Error("The two passwords do not match!"));
						},
					}),
				]}
			>
				<Input.Password placeholder="Confirm Password" />
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit">
					Register
				</Button>
			</Form.Item>
		</Form>
	);
};

const Login: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [messageApi, contextHolder] = message.useMessage();

	const showError = (errorMessage: string) => {
		messageApi.open({
			type: "error",
			content: errorMessage,
			duration: 10,
		});
	};

	const items: TabsProps["items"] = [
		{
			key: "login",
			label: "Login",
			children: <LoginForm setLoading={setLoading} showError={showError} />,
		},
		{
			key: "register",
			label: "Register",
			children: <RegisterForm setLoading={setLoading} showError={showError} />,
		},
	];

	let content = (
		<div className="login-page" style={{ backgroundColor: geekblue[0] }}>
			<Card className="card-shadow">
				<Title level={2}>GeoVault</Title>
				<Tabs defaultActiveKey="login" items={items}></Tabs>
			</Card>
		</div>
	);

	if (loading) content = <Spin>{content}</Spin>;

	content = (
		<>
			{contextHolder}
			{content}
		</>
	);

	return content;
};

export default Login;
