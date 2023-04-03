const rows = ['0', '1', '2', '3', '4', '5', '6', '7'];
const columns = ['0', '1', '2', '3', '4', '5', '6', '7'];

const squareIndexes = [];
rows.forEach(row =>
    columns.forEach(column => squareIndexes.push(`${row}${column}`))
);
global.indexes = squareIndexes;
