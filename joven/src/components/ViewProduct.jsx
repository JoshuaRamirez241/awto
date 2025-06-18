import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/ViewProduct.css";

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct(data);
          setMainImage(data.images?.[0] || "");
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="view-product">Loading product details...</div>;
  }

  return (
    <div className="view-product">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-container">
        {/* Images */}
        <div className="product-images">
          <img src={mainImage} alt="Main" className="main-image" />
          <div className="thumbnail-row">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${mainImage === img ? "active" : ""}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="tag">NEW</span>
          <h2 className="brand-logo">{product.brand || "No Brand"}</h2>
          <h1 className="product-name">{product.name || "No Name"}</h1>
          <p className="review-label">Be The First To Review This Product</p>
          <p className="finish-label">
            <strong>Finish:</strong> {product.finish || "N/A"}
          </p>

          <div className="options-section">
            <label htmlFor="options-select">Options:</label>
            <select id="options-select">
              <option value="front-rear">Front and Rear</option>
            </select>
            <input
              type="number"
              min="1"
              defaultValue="4"
              className="qty-input"
            />
          </div>

          <div className="fitment-warning">
            🚗 This product is fitment specific.{" "}
            <a href="#">Select a vehicle</a> to see if this fits.
          </div>

          <details className="desc-section" open>
            <summary>Description</summary>
            <p>{product.description || "No description available."}</p>
          </details>

          <details className="details-section">
            <summary>Product Details</summary>
            <p>
              More specifications can go here (diameter, width, bolt pattern,
              etc.)
            </p>
          </details>

          {/* ✅ Reserve Button */}
          <button className="reserve-button">Reserve Now</button>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
