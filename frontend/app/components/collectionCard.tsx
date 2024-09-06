import { Card, Col, Flex, Typography } from "antd";
import Link from "next/link";
import React, { CSSProperties } from "react";
import { CollectionPreviewDTO } from "../lib/Types";

const { Text, Paragraph, Title } = Typography;

type CollectionCardProps = {
	columnsSizes: any;
	cardStyle: CSSProperties;
} & Partial<CollectionPreviewDTO>;

export const CollectionCard: React.FC<CollectionCardProps> = ({ name, description, columnsSizes, cardStyle, sampleList, id }) => {
	return (
		<Col xs={columnsSizes.xs} sm={columnsSizes.sm} md={columnsSizes.md} lg={columnsSizes.lg}>
			<Link href={`/dashboard/library/collections/view?id=${id}`}>
				<Card hoverable style={cardStyle}>
					<Flex vertical gap="middle">
						<Title level={3}>{name}</Title>
						<Paragraph ellipsis={{ rows: 2, expandable: false }}>{description}</Paragraph>
						{sampleList &&
							[...sampleList].slice(0, 3).map((e, i) => {
								return (
									<React.Fragment key={`${name}-${description}-collection-${i}-${e.name}`}>
										<Text code>{e.name}</Text>
									</React.Fragment>
								);
							})}
						{sampleList && sampleList.length > 3 ? <Text>...</Text> : ""}
					</Flex>
				</Card>
			</Link>
		</Col>
	);
};
