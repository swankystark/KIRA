// Ward data for dropdown selection
export const WARDS = [
    { id: 1, name: 'Ward 1', area: 'Central Zone' },
    { id: 2, name: 'Ward 2', area: 'North Zone' },
    { id: 3, name: 'Ward 3', area: 'South Zone' },
    { id: 4, name: 'Ward 4', area: 'East Zone' },
    { id: 5, name: 'Ward 5', area: 'West Zone' },
    { id: 6, name: 'Ward 6', area: 'Central Zone' },
    { id: 7, name: 'Ward 7', area: 'North Zone' },
    { id: 8, name: 'Ward 8', area: 'South Zone' },
    { id: 9, name: 'Ward 9', area: 'East Zone' },
    { id: 10, name: 'Ward 10', area: 'West Zone' },
    { id: 11, name: 'Ward 11', area: 'Central Zone' },
    { id: 12, name: 'Ward 12', area: 'South Zone - Sanganer' },
    { id: 13, name: 'Ward 13', area: 'North Zone' },
    { id: 14, name: 'Ward 14', area: 'East Zone' },
    { id: 15, name: 'Ward 15', area: 'West Zone' },
    { id: 16, name: 'Ward 16', area: 'Central Zone' },
    { id: 17, name: 'Ward 17', area: 'South Zone' },
    { id: 18, name: 'Ward 18', area: 'North Zone' },
    { id: 19, name: 'Ward 19', area: 'East Zone' },
    { id: 20, name: 'Ward 20', area: 'West Zone' }
];

// Helper function to suggest ward based on location/area name
export const suggestWard = (locationString) => {
    if (!locationString) return null;
    
    const location = locationString.toLowerCase();
    
    // Simple mapping based on area names
    if (location.includes('sanganer')) return 12;
    if (location.includes('central')) return 1;
    if (location.includes('north')) return 2;
    if (location.includes('south')) return 3;
    if (location.includes('east')) return 4;
    if (location.includes('west')) return 5;
    
    return null; // No suggestion, user must select
};
