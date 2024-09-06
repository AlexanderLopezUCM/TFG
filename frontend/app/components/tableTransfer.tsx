import { GetProp, Table, TableColumnsType, TableProps, Transfer, TransferProps } from "antd";
import { ReactNode } from "react";

type TransferItem = GetProp<TransferProps, "dataSource">[number];
type TableRowSelection<T extends object> = TableProps<T>["rowSelection"];

export interface TableData {
	key: string;
	name: string;
	description?: string | ReactNode;
};

export interface TableTransferProps extends TransferProps<TransferItem> {
	dataSource: TableData[];
	leftColumns: TableColumnsType<TableData>;
	rightColumns: TableColumnsType<TableData>;
}

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
	const { leftColumns, rightColumns, ...restProps } = props;
	return (
		<Transfer style={{ width: "100%" }} {...restProps}>
			{({ direction, filteredItems, onItemSelect, onItemSelectAll, selectedKeys: listSelectedKeys, disabled: listDisabled }) => {
				const columns = direction === "left" ? leftColumns : rightColumns;
				const rowSelection: TableRowSelection<TransferItem> = {
					getCheckboxProps: () => ({ disabled: listDisabled }),
					onChange(selectedRowKeys) {
						onItemSelectAll(selectedRowKeys, "replace");
					},
					selectedRowKeys: listSelectedKeys,
					selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
				};

				return (
					<Table
						rowSelection={rowSelection}
						columns={columns}
						dataSource={filteredItems}
						size="small"
						style={{ pointerEvents: listDisabled ? "none" : undefined }}
						onRow={({ key, disabled: itemDisabled }) => ({
							onClick: () => {
								if (itemDisabled || listDisabled) {
									return;
								}
								onItemSelect(key, !listSelectedKeys.includes(key));
							},
						})}
					/>
				);
			}}
		</Transfer>
	);
};

export default TableTransfer;
