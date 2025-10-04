# 🧾 Expense Management System

> A modern, intelligent, and automated solution to streamline company expense management.
> Say goodbye to tedious manual expense processes, approval bottlenecks, and lack of transparency.

---

## 🚀 Overview

Companies often struggle with **manual expense reimbursement processes** that are time-consuming, error-prone, and lack transparency.
This system provides a **flexible, role-based expense management platform** with multi-level approval workflows and conditional logic for approvals.

**Key Goals:**

* Automate expense submissions and approvals
* Reduce errors and approval delays
* Provide complete visibility for employees, managers, and admins
* Support conditional approval flows and OCR-based receipt scanning

---

## 🛠️ Core Features

### Authentication & User Management

* On **first signup/login**, a new company is auto-created with the country’s currency set.
* An **Admin account** is automatically created.
* **Admin Permissions:**

  * Create Employees & Managers
  * Assign/change roles (Employee, Manager)
  * Define employee-manager relationships
  * Configure approval rules
  * Override approvals

---

### Expense Submission (Employee Role)

* Employees can submit **expense claims** including:

  * Amount (multi-currency supported)
  * Category
  * Description
  * Date
* Employees can **view their expense history**, including approved and rejected expenses

---

### Approval Workflow (Manager/Admin Role)

* Conditional approvals supported:

  * **Percentage Rule:** Approve if a certain % of approvers approve (e.g., 60%)
  * **Specific Approver Rule:** Approve if a designated approver approves (e.g., CFO)
  * **Hybrid Rule:** Combine both conditions (e.g., 60% OR CFO approves)

**Workflow Example:**

1. Step 1 → Manager
2. Step 2 → Finance
3. Step 3 → Director

> Expenses move to the next approver only after the current one approves/rejects.

**Manager Permissions:**

* View expenses pending approval
* Approve/reject with comments
* Escalate expenses based on rules

---

### Additional Features

#### OCR for Receipts

* Employees can scan receipts and the system automatically reads:

  * Amount
  * Date
  * Description
  * Expense type
  * Vendor/restaurant name

#### APIs Integrated

* **Country & Currency:** [REST Countries API](https://restcountries.com/v3.1/all?fields=name,currencies)
* **Currency Conversion:** [Exchange Rate API](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})

---

## 👥 Role & Permissions

| Role         | Permissions                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Admin**    | Create company, manage users, set roles, configure approval rules, view all expenses, override approvals |
| **Manager**  | Approve/reject expenses, view team expenses, escalate as per rules                                       |
| **Employee** | Submit expenses, view their own expenses, check approval status                                          |

---

## 💻 Tech Stack

* **Frontend:** React.js (Create React App)
* **Backend:** Node.js / Express
* **Database:** MongoDB / PostgreSQL / MySQL
* **OCR Integration:** Tesseract.js or Google Vision API
* **APIs:** REST Countries, Exchange Rate API

---

## ⚡ Getting Started

### Prerequisites

* Node.js v16+
* npm v8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/expense-management.git
cd expense-management

# Install dependencies
npm install

# Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app running in your browser.

---

### Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm start`     | Run the app in development mode      |
| `npm test`      | Launch the test runner               |
| `npm run build` | Build the app for production         |
| `npm run eject` | Eject CRA config (one-way operation) |

---

## 📷 Mockup & UI Design

View the project mockup here:
[Excalidraw Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)

---

## 🌟 Why This Project?

* Reduces human errors and speeds up reimbursements
* Transparent approval workflows
* Flexible rules for multiple approvers
* Smart receipt processing with OCR
* Multi-currency support with automatic conversions

---

## 📝 Future Enhancements

* Mobile app version
* AI-based fraud detection in expenses
* Analytics & reporting dashboards
* Slack/Email integration for notifications

---

## 🏆 License

This project is licensed under the MIT License.
