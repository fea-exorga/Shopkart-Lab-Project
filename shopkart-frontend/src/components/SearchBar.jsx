function SearchBar({ search, onSearch, category, onCategoryChange }) {
  return (
    <div className="product-filters">
      <input
        type="text"
        className="product-search-input"
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <select
        className="category-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Fashion">Fashion</option>
        <option value="Books">Books</option>
        <option value="Home">Home</option>
      </select>
    </div>
  );
}

export default SearchBar;
