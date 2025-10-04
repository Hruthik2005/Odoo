import React from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Pencil, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

const statusConfig = {
  draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
  pending: { color: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function ExpenseList({ expenses, loading, onEdit, showActions = false }) {
  if (loading) {
    return (
      <Card className="shadow-xl border-none">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-none">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle>Expense History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-gray-500">
                    No expenses found. Submit your first expense to get started.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => {
                  const StatusIcon = statusConfig[expense.status]?.icon || FileText;
                  return (
                    <TableRow key={expense.id} className="hover:bg-gray-50">
                      <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
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
                          {expense.converted_amount && expense.converted_amount !== expense.amount && (
                            <div className="text-xs text-gray-500">
                              ≈ {expense.converted_amount?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[expense.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {expense.status}
                        </Badge>
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
                      {showActions && (
                        <TableCell>
                          {expense.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(expense)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}