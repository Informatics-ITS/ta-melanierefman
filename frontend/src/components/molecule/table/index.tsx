import * as React from 'react';
import { Typography } from "../../atom/typography";
import Loading from '../../atom/loading';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface FlexibleTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchQuery: string;
}

const FlexibleTable = <T,>({
  columns,
  data,
  searchQuery,
  currentPage = 1,
  itemsPerPage = 10,
}: FlexibleTableProps<T> & { currentPage: number; itemsPerPage: number }) => {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key && Array.isArray(sortableData)) {
      sortableData.sort((a, b) => {
        const column = columns.find(col => col.header === sortConfig.key);
        if (!column) return 0;

        const cellA = column.accessor(a);
        const cellB = column.accessor(b);

        if (typeof cellA === 'string' && typeof cellB === 'string') {
          if (sortConfig.direction === 'asc') {
            return cellA.localeCompare(cellB);
          } else {
            return cellB.localeCompare(cellA);
          }
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig, columns]);

  const filteredData = sortedData.filter((row) =>
    columns.some((col) => {
      const cellValue = col.accessor(row);
      if (typeof cellValue === 'string') {
        return cellValue.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (React.isValidElement(cellValue)) {
        return cellValue.props.children
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return false;
    })
  );

  if (filteredData.length === 0) return <Loading />

  const offset = (currentPage - 1) * itemsPerPage;

  const columnsWithNo = [
    {
      header: "No",
      accessor: (_row: T, rowIndex: number) =>
        (offset + rowIndex + 1).toString(),
    },
    ...columns,
  ];

  const handleSort = (key: string) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return {
          key,
          direction: 'asc',
        };
      }
    });
  };

  return (
    <div className="w-full max-w-full">
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-typo">
          <thead className="text-xs text-typo-white bg-primary">
            <tr>
              {columnsWithNo.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-4 cursor-pointer"
                  onClick={() => handleSort(col.header)}
                >
                  <Typography type="caption1" font="dm-sans">
                    {col.header}
                    {sortConfig.key === col.header && (
                      <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="odd:bg-white even:bg-typo-surface border-b-2 border-typo-light"
              >
                {columnsWithNo.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-typo">
                    <Typography type="caption1" font="dm-sans">
                      {col.accessor(row, rowIndex)}
                    </Typography>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlexibleTable;