import { authFetch } from "@/src/authFetch";
import { Form, Select, SelectProps } from "antd";
import { useState } from "react";

let timeout: ReturnType<typeof setTimeout> | undefined;
let currentValue: string;

const fetchTags = (value: string, callback: (data: { value: string; text: string }[]) => void) => {
	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}

	currentValue = value;

	const searchTags = () => {
		authFetch(`http://localhost:5047/api/tags/${value}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.error("Could not get tags");
					return undefined;
				}

				return response.json();
			})
			.then((data) => {
				if (!data || currentValue !== value) return;

				const tags = data.map((item: any) => ({
					value: item["value"],
					text: item["value"],
				}));

				callback(tags);
			});
	};

	if (value) timeout = setTimeout(searchTags, 300);
	else callback([]);
};

const TagsFormItem: React.FC<SelectProps> = (props) => {
	const [searchData, setSearchData] = useState<SelectProps["options"]>();
	const [searchValue, setSearchValue] = useState<string>();

	const handleSearch = (newValue: string) => {
		if (newValue.length < 2) setSearchData([]);
		else fetchTags(newValue, setSearchData);
	};
	const handleChange = (newValue: string) => setSearchValue(newValue);

	return (
		<Form.Item name="tags" label="Tags">
			<Select
				{...props}
				mode="tags"
				showSearch
				value={searchValue}
				placeholder="Enter tags here"
				defaultActiveFirstOption={false}
				filterOption={false}
				onSearch={handleSearch}
				onChange={handleChange}
				notFoundContent={null}
				options={(searchData || []).map((item) => ({ value: item.value, label: item.text }))}
			/>
		</Form.Item>
	);
};

export default TagsFormItem;