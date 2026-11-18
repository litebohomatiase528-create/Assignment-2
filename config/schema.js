
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const databaseName = process.env.DB_NAME || "batloung_farm";

async function createSchema() {
    let connection;

    try {
        if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
            throw new Error("Invalid database name.");
        }

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || ""
        });

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``
        );

        await connection.changeUser({ database: databaseName });

        const tables = [

            `CREATE TABLE IF NOT EXISTS Suppliers (
                supplier_id INT AUTO_INCREMENT PRIMARY KEY,
                business_name VARCHAR(150) NOT NULL,
                contact_person VARCHAR(100) NOT NULL,
                phone VARCHAR(30) NOT NULL UNIQUE,
                province VARCHAR(60) NOT NULL,
                address VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Fruits (
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(80) NOT NULL UNIQUE,
                description TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'Available',
                CHECK (status IN ('Available', 'Unavailable'))
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Vendors (
                vendor_id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_name VARCHAR(120) NOT NULL,
                phone_number VARCHAR(30) NOT NULL UNIQUE,
                location VARCHAR(150) NOT NULL,
                registration_date DATE NOT NULL
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Purchases (
                purchase_id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT NOT NULL,
                purchase_date DATE NOT NULL,
                total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CHECK (total_amount >= 0),
                FOREIGN KEY (supplier_id)
                    REFERENCES Suppliers(supplier_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Purchase_Details (
                purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                purchase_id INT NOT NULL,
                fruit_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_cost DECIMAL(12,2) NOT NULL,
                packaging_size VARCHAR(10) NOT NULL,
                CHECK (quantity > 0),
                CHECK (unit_cost >= 0),
                CHECK (packaging_size IN ('Small', 'Medium', 'Large')),
                FOREIGN KEY (purchase_id)
                    REFERENCES Purchases(purchase_id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY (fruit_id)
                    REFERENCES Fruits(fruit_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Sales (
                sale_id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                sale_date DATE NOT NULL,
                payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
                payment_method VARCHAR(30),
                total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
                amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CHECK (payment_status IN (
                    'PAID', 'PARTIALLY_PAID', 'UNPAID'
                )),
                CHECK (total_amount >= 0),
                CHECK (amount_paid >= 0 AND amount_paid <= total_amount),
                FOREIGN KEY (vendor_id)
                    REFERENCES Vendors(vendor_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Sales_Details (
                sales_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                sale_id INT NOT NULL,
                fruit_id INT NOT NULL,
                packaging_size VARCHAR(10) NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(12,2) NOT NULL,
                CHECK (quantity > 0),
                CHECK (unit_price >= 0),
                CHECK (packaging_size IN ('Small', 'Medium', 'Large')),
                FOREIGN KEY (sale_id)
                    REFERENCES Sales(sale_id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY (fruit_id)
                    REFERENCES Fruits(fruit_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB`,

            `CREATE TABLE IF NOT EXISTS Stock (
                stock_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_id INT NOT NULL,
                packaging_size VARCHAR(10) NOT NULL,
                available_quantity INT NOT NULL DEFAULT 0,
                CHECK (packaging_size IN ('Small', 'Medium', 'Large')),
                CHECK (available_quantity >= 0),
                UNIQUE (fruit_id, packaging_size),
                FOREIGN KEY (fruit_id)
                    REFERENCES Fruits(fruit_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB`
        ];

        for (const sql of tables) {
            await connection.query(sql);
        }

        console.log(
            `Database "${databaseName}" and all 8 tables are ready.`
        );

    } catch (error) {
        console.error("Schema setup failed:", error.message);
        process.exitCode = 1;

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createSchema();
