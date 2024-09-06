import { Alert, Skeleton, Spin } from "antd";
import { ReactNode } from "react";

export type AsyncFeedback = {
	loading: boolean;
	success: boolean;
	failedMessage: string;
	children: ReactNode;
};

export const AsyncFeedback: React.FC<AsyncFeedback> = ({ loading, success, failedMessage, children }) =>
	loading ? <Skeleton active/> : success ? children : <Alert message={failedMessage} />;
