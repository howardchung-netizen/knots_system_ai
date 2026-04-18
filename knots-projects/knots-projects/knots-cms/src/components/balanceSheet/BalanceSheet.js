// src/BalanceSheet.js
import React from 'react';
import './BalanceSheet.css';

const BalanceSheet = () => {
    return (
        <div className="balance-sheet">
            <h1 className="title">Financial Statement</h1>
            <div className="content">
                <div className="column">
                    <h2>ASSETS</h2>
                    <h3>Current Assets</h3>
                    <ul>
                        <li>Checking Account <span className="amount">5,000</span></li>
                        <li>Savings Account <span className="amount">1,000</span></li>
                        <li>Petty Cash <span className="amount">500</span></li>
                        <li>Accounts Receivable <span className="amount">22,000</span></li>
                        <li>Inventory <span className="amount">15,000</span></li>
                        <li>Prepaid Insurance <span className="amount">6,000</span></li>
                    </ul>
                    <h3>Total Current Assets: <span className="amount">49,500</span></h3>
                    <h3>Noncurrent Assets</h3>
                    <ul>
                        <li>Accumulated Depreciation <span className="amount">-4,500</span></li>
                        <li>Computer <span className="amount">7,000</span></li>
                        <li>Building <span className="amount">65,000</span></li>
                        <li>Land <span className="amount">60,000</span></li>
                    </ul>
                    <h3>Total Noncurrent Assets: <span className="amount">127,000</span></h3>
                    <h3>Total Assets: <span className="amount">177,000</span></h3>
                </div>
                <div className="column">
                    <h2>LIABILITIES & EQUITY</h2>
                    <h3>Liabilities</h3>
                    <h3>Current Liabilities</h3>
                    <ul>
                        <li>Accounts Payable <span className="amount">12,000</span></li>
                        <li>Line of Credit <span className="amount">20,000</span></li>
                        <li>Payroll Liabilities <span className="amount">7,000</span></li>
                    </ul>
                    <h3>Total Current Liabilities: <span className="amount">39,000</span></h3>
                    <h3>Noncurrent Liabilities</h3>
                    <ul>
                        <li>Long-term Debt (loan) <span className="amount">48,000</span></li>
                    </ul>
                    <h3>Total Liabilities: <span className="amount">87,000</span></h3>
                    <h3>Equity</h3>
                    <ul>
                        <li>Owner's Capital <span className="amount">35,000</span></li>
                        <li>Retained Earnings <span className="amount">55,000</span></li>
                    </ul>
                    <h3>Total Equity: <span className="amount">90,000</span></h3>
                    <h3>Total Liabilities & Equity: <span className="amount">177,000</span></h3>
                </div>
            </div>
            <footer className="footer">© Patriot Software, LLC. All Rights Reserved.</footer>
        </div>
    );
};

export default BalanceSheet;
