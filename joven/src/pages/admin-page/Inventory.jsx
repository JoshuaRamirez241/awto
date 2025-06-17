import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import '../../styles/admin-styles/Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');

  // Restock Modal State
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockList, setRestockList] = useState([]);
  const [restockSearch, setRestockSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim() !== '') {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        const combined = `${p.brand} ${p.model} ${p.size}`.toLowerCase();
        return combined.includes(lowerTerm);
      });
    }

    switch (sortOption) {
      case 'name-asc':
        filtered.sort((a, b) =>
          `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
        );
        break;
      case 'name-desc':
        filtered.sort((a, b) =>
          `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`)
        );
        break;
      case 'stock-asc':
        filtered.sort((a, b) => Number(a.stock) - Number(b.stock));
        break;
      case 'stock-desc':
        filtered.sort((a, b) => Number(b.stock) - Number(a.stock));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortOption]);

  const handleRestockInput = (e, id) => {
    const newQty = parseInt(e.target.value || 0);
    setRestockList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const openRestockModal = () => {
    setRestockList([]);
    setRestockSearch('');
    setIsRestockOpen(true);
  };

  const handleSearchRestockProduct = () => {
    const search = restockSearch.toLowerCase();
    const found = products
      .filter((p) => {
        const fullName = `${p.brand} ${p.model} ${p.size}`.toLowerCase();
        return fullName.includes(search);
      })
      .map((p) => ({ ...p, qty: 0 }));

    setRestockList(found);
  };

  const saveRestocks = async () => {
    try {
      for (const item of restockList) {
        if (item.qty > 0) {
          const ref = doc(db, 'products', item.id);
          const current = products.find((p) => p.id === item.id);
          const updatedStock = Number(current.stock || 0) + Number(item.qty);
          await updateDoc(ref, { stock: updatedStock });
        }
      }
      setIsRestockOpen(false);
    } catch (error) {
      console.error('Error saving restocks:', error);
    }
  };

  return (
    <div className="inventory-page-container">
      <h1 className="inventory-page-title">Inventory</h1>

      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search product..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="stock-asc">Stock Low to High</option>
          <option value="stock-desc">Stock High to Low</option>
        </select>

        <button onClick={openRestockModal} className="restock-btn">
          Restock
        </button>
      </div>

      <div className="inventory-card">
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Stocks</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const productName = `${product.brand} ${product.model} ${product.size}`;
                  const totalPrice = product.stock * product.price;

                  return (
                    <tr
                      key={product.id}
                      className={index % 2 === 0 ? 'even-row' : 'odd-row'}
                    >
                      <td>{productName}</td>
                      <td>
                        <div className="stock-cell">
                          {product.stock}
                          {Number(product.stock) < 4 && (
                            <span className="low-stock-warning">Low Stock</span>
                          )}
                        </div>
                      </td>
                      <td>₱{Number(product.price).toFixed(2)}</td>
                      <td className="text-green-600 font-semibold">
                        ₱{Number(totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500">
                    No matching products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRestockOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Restock Products</h2>
            <input
              type="text"
              placeholder="Search product to restock..."
              className="search-bar"
              value={restockSearch}
              onChange={(e) => setRestockSearch(e.target.value)}
            />
            <button onClick={handleSearchRestockProduct} className="search-btn">
              Search
            </button>

            <div className="restock-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Add Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {restockList.map((item) => (
                    <tr key={item.id}>
                      <td>{`${item.brand} ${item.model} ${item.size}`}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => handleRestockInput(e, item.id)}
                          className="stock-input"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsRestockOpen(false)}>Cancel</button>
              <button onClick={saveRestocks} className="save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
