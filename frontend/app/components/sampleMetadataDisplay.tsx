import { Descriptions, DescriptionsProps, Flex, Tag } from "antd";

export interface SampleMetadataDisplayProps {
	name: string;
	description?: string;
	tags?: string[];
	publicationStatus: number;
	editableFields?: boolean;
}

const SampleMetadataDisplay: React.FC<SampleMetadataDisplayProps> = ({ name, description, tags, publicationStatus, editableFields = true }) => {
	const items: DescriptionsProps["items"] = [
		{
			key: "name",
			label: "Name",
			children: name,
		},
		{
			key: "description",
			label: "Description",
			children: description ?? "No description provided",
		},
		{
			key: "tags",
			label: "Tags",
			children: tags ? tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>) : "No tags",
		},
		{
			key: "publicationStatus",
			label: "Publication Status",
			children: ["Private", "Public"][publicationStatus],
		},
	];

	return (
		<Flex vertical gap="middle">
			<Descriptions items={items} column={1} />
		</Flex>
	);
};

export default SampleMetadataDisplay;
