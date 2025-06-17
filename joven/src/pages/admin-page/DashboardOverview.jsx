// src/pages/admin-page/DashboardOverview.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/admin-styles/DashboardOverview.css';

// Import icons for the cards
import { MdInventory, MdAddShoppingCart } from 'react-icons/md';
import { FaDollarSign, FaWarehouse } from 'react-icons/fa';

// Import Recharts components
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// No longer needed for this specific chart
// const LOW_STOCK_THRESHOLD = 20;

const DashboardOverview = () => {
    const [totalSales, setTotalSales] = useState(0);
    const [inventoryCount, setInventoryCount] = useState(0);
    const [productSold, setProductSold] = useState(0);
    const [stockOnHand, setStockOnHand] = useState(0);

    // State for chart data
    const [recentEarningsData, setRecentEarningsData] = useState([]); // Re-introduced for earnings
    const [productCategorySalesData, setProductCategorySalesData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesSnap = await getDocs(collection(db, 'sales'));
                const productSnap = await getDocs(collection(db, 'products'));

                const sales = salesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                const products = productSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                const total = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
                const sold = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
                const stock = products.reduce((sum, product) => sum + (product.stock || 0), 0);

                setTotalSales(total);
                setProductSold(sold);
                setInventoryCount(products.length);
                setStockOnHand(stock);

                // --- Process data for charts ---

                // Product Category Sales Data (existing logic)
                const productSalesByCategory = {};
                sales.forEach(sale => {
                    const product = products.find(p => p.id === sale.productId);
                    if (product && product.category) {
                        productSalesByCategory[product.category] = (productSalesByCategory[product.category] || 0) + (sale.quantity || 0);
                    } else {
                        productSalesByCategory['Uncategorized'] = (productSalesByCategory['Uncategorized'] || 0) + (sale.quantity || 0);
                    }
                });

                const categoryData = Object.keys(productSalesByCategory).map(category => ({
                    name: category,
                    'Products Sold': productSalesByCategory[category]
                }));
                setProductCategorySalesData(categoryData);

                // Recent Earnings Data (similar to Revenue Trend, but for 'Earnings')
                const salesByDate = {};
                sales.forEach(sale => {
                    // Assuming 'sale.date' is a Firebase Timestamp or Date object
                    const saleDate = sale.date?.toDate ? sale.date.toDate() : new Date(sale.date); // Handle Firebase Timestamp or string date
                    const dateString = saleDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    salesByDate[dateString] = (salesByDate[dateString] || 0) + (sale.amount || 0);
                });

                const last5DaysData = []; // Adjust to show fewer days for simpler look like reference
                for (let i = 4; i >= 0; i--) { // For the last 5 days
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateKey = d.toISOString().split('T')[0];
                    last5DaysData.push({
                        name: d.toLocaleDateString('en-US', { day: '2-digit' }), // Just day for X-axis labels
                        Earnings: salesByDate[dateKey] || 0
                    });
                }
                setRecentEarningsData(last5DaysData);


            } catch (error) {
                console.error('Dashboard data error:', error);
                // Fallback dummy data for charts if Firebase fetch fails for demonstration
                setProductCategorySalesData([
                    { name: 'Tires', 'Products Sold': 400 },
                    { name: 'Wheels', 'Products Sold': 300 },
                    { name: 'Batteries', 'Products Sold': 200 },
                    { name: 'Accessories', 'Products Sold': 278 },
                ]);
                setRecentEarningsData([ // Dummy data for recent earnings, mimicking the reference's scale
                    { name: '06', Earnings: 23000 },
                    { name: '07', Earnings: 14000 },
                    { name: '08', Earnings: 26000 },
                    { name: '09', Earnings: 15000 },
                    { name: '10', Earnings: 18000 },
                ]);
            }
        };

        fetchData();
    }, []);

    const dashboardStats = [
        {
            title: 'Total Sales',
            value: `₱${totalSales.toLocaleString()}`,
            icon: <FaDollarSign />,
            colorClass: 'icon-total-sales'
        },
        {
            title: 'Inventory Items',
            value: inventoryCount,
            icon: <MdInventory />,
            colorClass: 'icon-inventory-items'
        },
        {
            title: 'Products Sold',
            value: productSold,
            icon: <MdAddShoppingCart />,
            colorClass: 'icon-products-sold'
        },
        {
            title: 'Stock on Hand',
            value: stockOnHand,
            icon: <FaWarehouse />,
            colorClass: 'icon-stock-on-hand'
        },
    ];

    // Define the custom color palette for the bars based on the reference image
    const barColors = ['#8884d8', '#E53E3E', '#A0AEC0', '#5A67D8', '#F6AD55']; // Violet, Red, Grey, Blue, Orange - adjust as needed

    return (
        <div className="dashboard-overview-container">
            <h2 className="dashboard-overview-title">Admin Dashboard Overview</h2>
            <div className="stat-cards-container">
                {dashboardStats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div className={`stat-card-icon ${stat.colorClass}`}>
                            {stat.icon}
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-title">{stat.title}</div>
                            <div className="stat-card-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-section-container">
                {/* Recent Earnings Chart (based on image_6324aa.png) */}
                <div className="chart-card">
                    <h3 className="chart-title">Recent Earnings</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={recentEarningsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Increased top margin for YAxis labels
                        >
                            {/* Removed CartesianGrid to match reference image */}
                            <XAxis
                                dataKey="name"
                                axisLine={false} // Remove X-axis line
                                tickLine={false} // Remove X-axis tick lines
                                style={{ fontSize: '0.9em', color: 'var(--light-text-color)' }}
                                interval={0} // Show all ticks
                            />
                            <YAxis
                                axisLine={false} // Remove Y-axis line
                                tickLine={false} // Remove Y-axis tick lines
                                tickFormatter={(value) => `${value / 1000}k`} // Format as 'k' for thousands
                                style={{ fontSize: '0.9em', color: 'var(--light-text-color)' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.1)' }} // Light background on hover
                                contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                labelStyle={{ color: 'var(--text-color)' }}
                                itemStyle={{ color: 'var(--text-color)' }}
                                formatter={(value) => `₱${value.toLocaleString()}`} // Format tooltip value as currency
                            />
                            {/* Removed Legend as per reference image */}
                            <Bar dataKey="Earnings" barSize={30} radius={[10, 10, 0, 0]}> {/* Adjusted barSize and radius for rounded tops */}
                                {
                                    recentEarningsData.map((entry, index) => (
                                        <Bar key={`bar-${index}`} fill={barColors[index % barColors.length]} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Existing Products Sold by Category Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Products Sold by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={productCategorySalesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--border-color')} />
                            <XAxis dataKey="name" stroke={getComputedStyle(document.documentElement).getPropertyValue('--light-text-color')} />
                            <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue('--light-text-color')} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                labelStyle={{ color: 'var(--text-color)' }}
                                itemStyle={{ color: 'var(--text-color)' }}
                            />
                            <Legend />
                            <Bar dataKey="Products Sold" fill="var(--primary-color)" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;