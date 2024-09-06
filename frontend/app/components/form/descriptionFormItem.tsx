import { Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { TextAreaProps } from "antd/lib/input";



const DescriptionFormItem: React.FC<TextAreaProps> = (props) => {
	return (
		<Form.Item name="description" label="Description">
			<TextArea rows={5} {...props}/>
		</Form.Item>
	);
};

export default DescriptionFormItem;
