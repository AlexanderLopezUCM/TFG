import { Form, Select } from "antd";
import { SelectProps } from "antd/lib";

const PublicationStatusFormItem: React.FC<SelectProps> = (props) => {
	return (
		<Form.Item name="publicationStatus" label="Publication status">
			<Select
				{...props}
				options={[
					{ value: 0, label: "Private" },
					{ value: 1, label: "Public" },
				]}
			/>
		</Form.Item>
	);
};

export default PublicationStatusFormItem;