import { Form, Input } from "antd";
import { InputProps } from "antd/lib";

const NameFormItem: React.FC<InputProps> = (props) => {
	return (
		<Form.Item name="name" label="Name" rules={[{ required: true, message: "Name cannot be empty" }]}>
			<Input {...props}/>
		</Form.Item>
	);
};

export default NameFormItem;
