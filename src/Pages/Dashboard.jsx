
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Expense } from "@/entities/Expense";
import { Company } from "@/entities/Company";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Receipt,
  DollarSign,
  Calendar,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = (expenses) => {
      setStats({
        total: expenses.length,
        pending: expenses.filter(e => e.status === "pending").length,
        approved: expenses.filter(e => e.status === "approved").length,
        rejected: expenses.filter(e => e.status === "rejected").length,
        totalAmount: expenses.reduce((sum, e) => sum + (e.converted_amount || e.amount || 0), 0)
      });
    };

    const loadDashboard = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (!currentUser.user_role) {
          navigate(createPageUrl("Setup"));
          return;
        }

        if (currentUser.company_id) {
          const companyData = await Company.filter({ id: currentUser.company_id });
          if (companyData.length > 0) {
            setCompany(companyData[0]);
          }
        }

        if (currentUser.user_role === "employee") {
          const expenses = await Expense.filter({ employee_id: currentUser.id });
          calculateStats(expenses);
        } else if (currentUser.user_role === "manager") {
          const allExpenses = await Expense.list();
          calculateStats(allExpenses);
        } else if (currentUser.user_role === "admin") {
          const allExpenses = await Expense.list();
          calculateStats(allExpenses);
        }
      } catch (error) {
        navigate(createPageUrl("Setup"));
      }
      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
    <Card className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} rounded-full opacity-10 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <div className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 ${bgColor} bg-opacity-10 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick, color }) => (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-lg group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 ${color} bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.user_role === "admin" && "Manage your organization's expenses and approvals"}
          {user?.user_role === "manager" && "Review and approve pending expenses"}
          {user?.user_role === "employee" && "Track and submit your expenses"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expenses"
          value={stats.total}
          icon={Receipt}
          color="text-indigo-600"
          bgColor="bg-indigo-600"
          subtitle={company?.default_currency || ""}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-600"
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-600"
          subtitle="Processed successfully"
        />
        <StatCard
          title="Total Amount"
          value={`${company?.default_currency || '$'} ${stats.totalAmount.toFixed(2)}`}
          icon={DollarSign}
          color="text-purple-600"
          bgColor="bg-purple-600"
          subtitle="All expenses"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.user_role === "employee" && (
            <QuickAction
              title="Submit Expense"
              description="Create a new expense report"
              icon={Receipt}
              color="bg-indigo-500"
              onClick={() => navigate(createPageUrl("EmployeeExpenses"))}
            />
          )}
          {user?.user_role === "manager" && (
            <QuickAction
              title="Review Approvals"
              description="Approve or reject pending expenses"
              icon={CheckCircle}
              color="bg-emerald-500"
              onClick={() => navigate(createPageUrl("ManagerApprovals"))}
            />
          )}
          {user?.user_role === "admin" && (
            <>
              <QuickAction
                title="Manage Users"
                description="Add or edit team members"
                icon={Receipt}
                color="bg-indigo-500"
                onClick={() => navigate(createPageUrl("AdminUsers"))}
              />
              <QuickAction
                title="Configure Rules"
                description="Set up approval workflows"
                icon={BarChart3}
                color="bg-purple-500"
                onClick={() => navigate(createPageUrl("AdminApprovalRules"))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
