import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Expense } from "@/entities/Expense";
import { Company } from "@/entities/Company";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";

export default function EmployeeExpenses() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await User.me();
    setUser(currentUser);

    if (currentUser.company_id) {
      const companies = await Company.filter({ id: currentUser.company_id });
      if (companies.length > 0) {
        setCompany(companies[0]);
      }
    }

    const userExpenses = await Expense.filter({ employee_id: currentUser.id }, "-created_date");
    setExpenses(userExpenses);
    setLoading(false);
  };

  const handleSubmit = async (expenseData) => {
    if (editingExpense) {
      await Expense.update(editingExpense.id, expenseData);
    } else {
      await Expense.create(expenseData);
    }
    setShowForm(false);
    setEditingExpense(null);
    loadData();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Expenses
          </h1>
          <p className="text-gray-600 mt-1">Submit and track your expense reports</p>
        </div>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setShowForm(!showForm);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Expense
        </Button>
      </div>

      {showForm && (
        <ExpenseForm
          user={user}
          company={company}
          expense={editingExpense}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        showActions={true}
      />
    </div>
  );
}