import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Expense } from "@/entities/Expense";
import { Company } from "@/entities/Company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ExternalLink, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerApprovals() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

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

    const pendingExpenses = await Expense.filter({ status: "pending" }, "-created_date");
    setExpenses(pendingExpenses);
    setLoading(false);
  };

  const handleAction = (expense, action) => {
    setSelectedExpense(expense);
    setActionType(action);
    setComment("");
  };

  const submitAction = async () => {
    if (!selectedExpense) return;

    setProcessing(true);
    const approvalEntry = {
      approver_id: user.id,
      approver_name: user.full_name,
      action: actionType,
      comment: comment,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(selectedExpense.approval_history || []), approvalEntry];

    await Expense.update(selectedExpense.id, {
      status: actionType,
      approval_history: updatedHistory,
      rejection_reason: actionType === "rejected" ? comment : null
    });

    setSelectedExpense(null);
    setActionType(null);
    setComment("");
    setProcessing(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Pending Approvals
        </h1>
        <p className="text-gray-600 mt-1">Review and approve expense submissions</p>
      </div>

      <Card className="shadow-xl border-none">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Awaiting Your Approval ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No pending approvals</p>
                      <p className="text-sm">All expenses have been reviewed</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{expense.employee_name}</TableCell>
                      <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">
                          {expense.category?.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">
                            {expense.currency} {expense.amount?.toFixed(2)}
                          </div>
                          {expense.converted_amount && (
                            <div className="text-xs text-gray-500">
                              ≈ {company?.default_currency} {expense.converted_amount?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {expense.receipt_url && (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(expense, "approved")}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(expense, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve Expense" : "Reject Expense"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">
                Comment {actionType === "rejected" ? "(Required)" : "(Optional)"}
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedExpense(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={processing || (actionType === "rejected" && !comment)}
              className={actionType === "approved" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "bg-red-600 hover:bg-red-700"}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Confirm {actionType === "approved" ? "Approval" : "Rejection"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}