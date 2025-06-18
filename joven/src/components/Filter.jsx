import React, { useState, useEffect } from "react";
import "../styles/UserDashboard.css";
import "../styles/Filter.css";

const WHEEL_TIRE_FILTERS = [
  {
    name: "brand",
    label: "Brand",
    options: [
      "ARIVO", "ACCELERA", "ADVANCE MIX", "ALLIANCE", "ALTURA",
      "AMP", "ARISUN", "BF GOODRICH", "BRIDGESTONE", "CST",
    ],
    multiSelect: true,
  },
  {
    name: "diameter",
    label: "Diameter",
    options: ['14"', '15"', '16"', '17"', '18"', '19"', '20"', '22"'],
    multiSelect: true,
  },
  {
    name: "width",
    label: "Width",
    options: ['6"', '7"', '8"', '9"', '10"', '12"'],
    multiSelect: true,
  },
  {
    name: "boltPattern",
    label: "Bolt Pattern",
    options: ["4x100", "5x114.3", "5x120", "6x139.7"],
    multiSelect: true,
  },
  {
    name: "offset",
    label: "Offset",
    options: ["+20", "+25", "+30", "+35", "+40"],
    multiSelect: true,
  },
  {
    name: "lugCount",
    label: "Lug Count",
    options: ["4", "5", "6"],
    multiSelect: true,
  },
  {
    name: "material",
    label: "Material",
    options: [
      "Cast Aluminum", "Flow Formed Aluminum", "Forged Aluminum", "Steel",
    ],
    multiSelect: true,
  },
  {
    name: "finish",
    label: "Finish",
    options: ["Gloss Black", "Matte Black", "Chrome", "Silver", "Gunmetal"],
    multiSelect: true,
  },
  {
    name: "new",
    label: "New",
    options: ["Yes"],
    multiSelect: false,
  },
  {
    name: "price",
    label: "Price Range",
    options: [" ₱0 -  ₱100", " ₱100 -  ₱200", " ₱200 -  ₱300", " ₱300+"],
    multiSelect: false,
  },
];

const Filter = ({ onChange }) => {
  const [expanded, setExpanded] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const filtersToSend = Object.fromEntries(
      Object.entries(selectedFilters).map(([key, set]) => [key, Array.from(set)])
    );
    onChange && onChange(filtersToSend);
  }, [selectedFilters, onChange]);

  const toggleExpand = (filterName) => {
    setExpanded((prev) =>
      prev.includes(filterName)
        ? prev.filter((name) => name !== filterName)
        : [...prev, filterName]
    );
  };

  const toggleOption = (filterName, option, multiSelect) => {
    setSelectedFilters((prev) => {
      const currentSet = new Set(prev[filterName] || []);
      if (currentSet.has(option)) {
        currentSet.delete(option);
      } else {
        if (!multiSelect) {
          return { ...prev, [filterName]: new Set([option]) };
        }
        currentSet.add(option);
      }
      return { ...prev, [filterName]: currentSet };
    });
  };

  const clearFilter = (filterName) => {
    setSelectedFilters((prev) => {
      const copy = { ...prev };
      delete copy[filterName];
      return copy;
    });
  };

  const clearAll = () => {
    setSelectedFilters({});
  };

  const handleSearchChange = (filterName, value) => {
    setSearchTerms((prev) => ({ ...prev, [filterName]: value }));
  };

  return (
    <>
      <button
        className="filter-toggle-btn"
        onClick={() => setIsMobileOpen(true)}
      >
        Filters
      </button>

      <div
        className={`filter-overlay ${isMobileOpen ? "visible" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <div className={`filters ${isMobileOpen ? "open" : ""}`}>
        <div className="filters-header">
          <h3>Active Filters ({Object.keys(selectedFilters).length})</h3>
          {Object.keys(selectedFilters).length > 0 && (
            <button onClick={clearAll} className="clear-btn">
              Clear All
            </button>
          )}
        </div>

        <button
          className="clear-btn"
          style={{ marginBottom: "10px" }}
          onClick={() => setIsMobileOpen(false)}
        >
          ✕ Close
        </button>

        {WHEEL_TIRE_FILTERS.map(({ name, label, options, multiSelect }) => {
          const isExpanded = expanded.includes(name);
          const selectedSet = selectedFilters[name] || new Set();
          const search = searchTerms[name] || "";

          const filteredOptions =
            options.length > 5
              ? options.filter((opt) =>
                  opt.toLowerCase().includes(search.toLowerCase())
                )
              : options;

          return (
            <div key={name}>
              <div
                className="filter-header"
                onClick={() => toggleExpand(name)}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
              >
                <span>{label}</span>
                <button
                  className="clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter(name);
                  }}
                  aria-label={`Clear filter ${label}`}
                  disabled={selectedSet.size === 0}
                >
                  &times;
                </button>
                <span>{isExpanded ? "-" : "+"}</span>
              </div>

              {isExpanded && (
                <div
                  className="filter-content"
                  role="group"
                  aria-label={`${label} filter options`}
                >
                  {options.length > 5 && (
                    <input
                      type="text"
                      placeholder={`Search ${label}...`}
                      className="filter-search"
                      value={search}
                      onChange={(e) =>
                        handleSearchChange(name, e.target.value)
                      }
                    />
                  )}

                  {filteredOptions.map((option) => {
                    const selected = selectedSet.has(option);
                    return (
                      <div
                        key={option}
                        className={`filter-option ${selected ? "selected" : ""}`}
                        onClick={() => toggleOption(name, option, multiSelect)}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={selected}
                      >
                        {option}
                      </div>
                    );
                  })}

                  {filteredOptions.length === 0 && <p>No options found.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Filter;
