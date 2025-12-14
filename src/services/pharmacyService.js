import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/search';


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
