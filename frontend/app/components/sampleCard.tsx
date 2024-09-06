import { Card, Col, Flex, Image, Typography } from "antd";
import Link from "next/link";
import { CSSProperties } from "react";
import { SamplePreviewDTO } from "../lib/Types";

const { Paragraph, Text, Title } = Typography;

type SampleCardProps = {
	columnsSizes: any;
	cardStyle: CSSProperties;
	imageFallback: string;
} & Partial<SamplePreviewDTO>;

export const SampleCard: React.FC<SampleCardProps> = ({ name, description, columnsSizes, cardStyle, imageFallback, imageUrl, id: ID }) => {
	return (
		<Col xs={columnsSizes.xs} sm={columnsSizes.sm} md={columnsSizes.md} lg={columnsSizes.lg}>
			<Link href={`/dashboard/library/samples/view?id=${ID}`}>
				<Card hoverable style={cardStyle}>
					<Flex vertical gap="middle">
						{/* <Image alt={`Image of ${name}`} src={imageUrl} fallback={imageFallback} preview={false} /> */}
						<Image alt={`Image of ${name}`} src={imageUrl} fallback={imageFallback} preview={false} />
						<Title level={5}>{name}</Title>
						<Paragraph ellipsis={{ rows: 2, expandable: false }}>{description}</Paragraph>
					</Flex>
				</Card>
			</Link>
		</Col>
	);
};
