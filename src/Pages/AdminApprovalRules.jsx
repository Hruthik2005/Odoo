import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { ApprovalRule } from "@/entities/ApprovalRule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminApprovalRules() {
  const [currentUser, setCurrentUser] = useState(null);
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: "",
    rule_type: "",
    percentage_threshold: "",
    specific_approvers: [],
    amount_threshold: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const me = await User.me();
    setCurrentUser(me);

    const allUsers = await User.list();
    setUsers(allUsers.filter(u => u.company_id === me.company_id && (u.user_role === "manager" || u.user_role === "admin")));

    const allRules = await ApprovalRule.filter({ company_id: me.company_id });
    setRules(allRules);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    
    const ruleData = {
      ...formData,
      company_id: currentUser.company_id,
      percentage_threshold: formData.percentage_threshold ? parseFloat(formData.percentage_threshold) : null,
      amount_threshold: formData.amount_threshold ? parseFloat(formData.amount_threshold) : null,
      is_active: true
    };
    
    await ApprovalRule.create(ruleData);
    
    setShowDialog(false);
    setFormData({
      rule_name: "",
      rule_type: "",
      percentage_threshold: "",
      specific_approvers: [],
      amount_threshold: ""
    });
    setProcessing(false);
    loadData();
  };

  const ruleTypeColors = {
    sequential: "bg-indigo-100 text-indigo-800",
    percentage: "bg-emerald-100 text-emerald-800",
    specific_approver: "bg-purple-100 text-purple-800",
    hybrid: "bg-amber-100 text-amber-800"
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Approval Rules
          </h1>
          <p className="text-gray-600 mt-1">Configure expense approval workflows</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <Card key={rule.id} className="shadow-xl border-none hover:shadow-2xl transition-shadow">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                  <Badge className={`mt-2 ${ruleTypeColors[rule.rule_type]}`}>
                    {rule.rule_type?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {rule.percentage_threshold && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Threshold:</span>
                  <span className="font-semibold">{rule.percentage_threshold}%</span>
                </div>
              )}
              {rule.amount_threshold && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Limit:</span>
                  <span className="font-semibold">${rule.amount_threshold}</span>
                </div>
              )}
              {rule.specific_approvers?.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Approvers:</span>
                  <span className="font-semibold ml-2">{rule.specific_approvers.length}</span>
                </div>
              )}
              <div className="pt-2">
                <Badge variant={rule.is_active ? "default" : "secondary"}>
                  {rule.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card className="col-span-full shadow-xl border-none">
            <CardContent className="p-12 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No approval rules configured</h3>
              <p className="text-gray-600 mb-4">Create your first approval rule to get started</p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Approval Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., Standard Approval"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential (Manager → Finance → Director)</SelectItem>
                  <SelectItem value="percentage">Percentage Based</SelectItem>
                  <SelectItem value="specific_approver">Specific Approver</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Percentage OR Specific)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.rule_type === "percentage" || formData.rule_type === "hybrid") && (
              <div className="space-y-2">
                <Label htmlFor="percentage_threshold">Percentage Threshold</Label>
                <Input
                  id="percentage_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage_threshold}
                  onChange={(e) => setFormData({ ...formData, percentage_threshold: e.target.value })}
                  placeholder="e.g., 60"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount_threshold">Amount Threshold (Optional)</Label>
              <Input
                id="amount_threshold"
                type="number"
                step="0.01"
                value={formData.amount_threshold}
                onChange={(e) => setFormData({ ...formData, amount_threshold: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={processing || !formData.rule_name || !formData.rule_type}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Rule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}