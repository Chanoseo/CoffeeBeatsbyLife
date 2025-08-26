"use client"

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProductsList from "./ProductsList";
import AddProduct from "./AddProduct";
import { useState } from "react";

function Products() {
    const [showAddProduct, setShowAddProduct] = useState(false);

    const handleToggle = () => {
        setShowAddProduct((prev) => !prev);
    };

    return (
        <section className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl">Manage Products</h1>
                <button
                    onClick={handleToggle}
                    className="flex items-center gap-2 button-style"
                >
                    <span>Add Product</span>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>

            {showAddProduct && <AddProduct onClose={handleToggle} />}
            <ProductsList />
        </section>
    );
}

export default Products;
