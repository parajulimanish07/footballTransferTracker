import React, { useState } from 'react';

const SearchBar: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for news articles or players"
                className="border rounded-l-md p-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white rounded-r-md p-2">
                Search
            </button>
        </form>
    );
};

export default SearchBar;