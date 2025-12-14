import axios from 'axios';

const API_URL = 'http://localhost:3001/api/search';

export const searchMedicines = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        console.log('🔍 Searching for:', query);
        const response = await axios.get(`${API_URL}?q=${encodeURIComponent(query)}`);
        console.log(`✅ Total: ${response.data.length} results`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
