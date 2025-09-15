import React, { useState } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imagePath: ''
  });

  // Load products from local storage
  React.useEffect(() => {
    const fetchProducts = async () => {
      if (window.electronAPI && window.electronAPI.loadProducts) {
        const result = await window.electronAPI.loadProducts();
        if (result.success) {
          setProducts(result.products);
        }
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectImage = async () => {
    if (window.electronAPI && window.electronAPI.selectImage) {
      const imagePath = await window.electronAPI.selectImage();
      if (imagePath) {
        setFormData({ ...formData, imagePath });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Name and price are required');
      return;
    }
    try {
      if (window.electronAPI && window.electronAPI.saveProduct) {
        const result = await window.electronAPI.saveProduct(formData);
        if (result.success) {
          setProducts([...products, result.product]);
          setFormData({ name: '', price: '', description: '', imagePath: '' });
        } else {
          alert('Error saving product: ' + result.error);
        }
      }
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product Manager</h1>
      </header>
      
      <main>
        <div className="form-section">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Image:</label>
              <button type="button" onClick={handleSelectImage}>
                {formData.imagePath ? "Change Image" : "Add Image"}
              </button>
              {formData.imagePath && (
                <span style={{ marginLeft: '10px' }}>Selected</span>
              )}
              {/* Image preview before submit */}
              {formData.imagePath && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={`file://${formData.imagePath}`}
                    alt="Preview"
                    style={{ width: '100px', border: '1px solid #ccc' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    {formData.imagePath}
                  </div>
                </div>
              )}
            </div>
            <button type="submit">Add Product</button>
          </form>
        </div>
        
        <div className="products-section">
          <h2>Products List</h2>
          {products.length === 0 ? (
            <p>No products yet. Add some above!</p>
          ) : (
            <div className="products-grid">
              {products.map((product, idx) => (
                <div key={idx} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                  {product.description && (
                    <p className="description">{product.description}</p>
                  )}
                  {product.savedImagePath && (
                    <div style={{ marginTop: '10px' }}>
                      <img
                        src={`file://${product.savedImagePath}`}
                        alt="Product"
                        style={{ width: '100px', border: '1px solid #ccc' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div style={{ fontSize: '10px', color: '#888' }}>
                        {product.savedImagePath}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;