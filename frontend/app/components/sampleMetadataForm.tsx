import { SampleMetadata } from "@/lib/Types";
import { Button, Form } from "antd";
import NameFormItem from "@/components/form/nameFormItem";
import DescriptionFormItem from "@/components/form/descriptionFormItem";
import TagsFormItem from "@/components/form/tagsFormItem";
import PublicationStatusFormItem from "./form/publicationStatusFormItem";

type SampleMetadataFormProps = {
	initialValues?: Partial<SampleMetadata>;
	onFinish?: (metadata: SampleMetadata) => void;
};

const SampleMetadataForm: React.FC<SampleMetadataFormProps> = ({ initialValues, onFinish }) => {
	const [form] = Form.useForm();

	initialValues ??= {};
	initialValues.publicationStatus ??= 0;

	return (
		<Form name="metadata-form" form={form} labelWrap onFinish={onFinish} initialValues={initialValues} autoComplete="off" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
			<NameFormItem />
			<DescriptionFormItem />
			<TagsFormItem />
			<PublicationStatusFormItem />

			<Form.Item>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

export default SampleMetadataForm;
