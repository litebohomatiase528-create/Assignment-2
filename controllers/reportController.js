
import * as Report from "../models/reportModel.js";

// TOP FRUITS
export const topFruits = async (req, res, next) => {
    try {
        const rows = await Report.getTopFruits();
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

// REVENUE REPORT
export const revenueReport = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (
            !datePattern.test(start_date || "") ||
            !datePattern.test(end_date || "") ||
            start_date > end_date
        ) {
            return res.status(400).json({
                message: "Valid start_date and end_date are required."
            });
        }

        const rows = await Report.getRevenueReport(
            start_date,
            end_date
        );

        res.json(rows);
    } catch (error) {
        next(error);
    }
};

// TOP VENDOR
export const topVendor = async (req, res, next) => {
    try {
        const vendor = await Report.getTopVendor();
        res.json(vendor);
    } catch (error) {
        next(error);
    }
};

// CURRENT STOCK
export const currentStock = async (req, res, next) => {
    try {
        const rows = await Report.getCurrentStock();
        res.json(rows);
    } catch (error) {
        next(error);
    }
};
