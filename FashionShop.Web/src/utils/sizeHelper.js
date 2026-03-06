export const sizeOrder = {
    'FREESIZE': 0,
    'ONE SIZE': 0,
    'FS': 0,
    'XXS': 10,
    'XS': 20,
    'S': 30,
    'M': 40,
    'L': 50,
    'XL': 60,
    'XXL': 70,
    '2XL': 70,
    '3XL': 80,
    '4XL': 90,
    '5XL': 100
};

export const sortSizes = (sizes, nameKey = 'name') => {
    if (!sizes || !Array.isArray(sizes)) return [];

    return [...sizes].sort((a, b) => {
        const nameA = String(a[nameKey] || '').toUpperCase().trim();
        const nameB = String(b[nameKey] || '').toUpperCase().trim();

        const priorityA = sizeOrder[nameA];
        const priorityB = sizeOrder[nameB];

        // Nếu cả 2 đều có trong bản đồ ưu tiên
        if (priorityA !== undefined && priorityB !== undefined) {
            return priorityA - priorityB;
        }

        // Nếu chỉ một thằng có trong bản đồ ưu tiên
        if (priorityA !== undefined) return -1;
        if (priorityB !== undefined) return 1;

        // Nếu là số (ví dụ 36, 37, 38)
        const numA = parseFloat(nameA);
        const numB = parseFloat(nameB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        // Cuối cùng sắp xếp theo bảng chữ cái
        return nameA.localeCompare(nameB);
    });
};
