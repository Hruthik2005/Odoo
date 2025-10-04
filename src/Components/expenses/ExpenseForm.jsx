import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  "travel",
  "meals",
  "accommodation",
  "office_supplies",
  "software",
  "training",
  "entertainment",
  "other"
];

export default function ExpenseForm({ user, company, expense, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(expense || {
    amount: "",
    currency: company?.default_currency || "USD",
    category: "",
    date: "",
    description: "",
    receipt_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { file_url } = await UploadFile({ file });
      setFormData({ ...formData, receipt_url: file_url });

      setExtracting(true);
      try {
        const prompt = `Extract expense information from this receipt image. Return JSON with: amount (number), date (YYYY-MM-DD format), description (what was purchased), and vendor (who it was from). If you can't determine a value, use null.`;
        
        const result = await InvokeLLM({
          prompt: prompt,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              amount: { type: "number" },
              date: { type: "string" },
              description: { type: "string" },
              vendor: { type: "string" }
            }
          }
        });

        if (result.amount) {
          setFormData(prev => ({
            ...prev,
            amount: result.amount.toString(),
            date: result.date || prev.date,
            description: result.description || prev.description
          }));
        }
      } catch (extractError) {
        console.error("OCR extraction failed:", extractError);
      }
    } catch (uploadError) {
      setError("Failed to upload receipt. Please try again.");
    }

    setUploading(false);
    setExtracting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let convertedAmount = parseFloat(formData.amount);
    
    if (formData.currency !== company?.default_currency) {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${formData.currency}`);
        const data = await response.json();
        const rate = data.rates[company?.default_currency];
        convertedAmount = parseFloat(formData.amount) * rate;
      } catch (error) {
        console.error("Currency conversion failed:", error);
      }
    }

    const expenseData = {
      ...formData,
      employee_id: user.id,
      employee_name: user.full_name,
      company_id: user.company_id,
      amount: parseFloat(formData.amount),
      converted_amount: convertedAmount,
      status: "pending"
    };

    onSubmit(expenseData);
  };

  return (
    <Card className="shadow-xl border-none">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          {expense ? "Edit Expense" : "Submit New Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                placeholder="USD"
                maxLength={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the expense..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Upload</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || extracting}
                className="flex-1"
              >
                {uploading || extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? "Uploading..." : "Extracting data..."}
                  </>
                ) : (
                  <>
                    {extracting ? (
                      <Sparkles className="w-4 h-4 mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {formData.receipt_url ? "Change Receipt" : "Upload Receipt"}
                  </>
                )}
              </Button>
              {formData.receipt_url && (
                <a
                  href={formData.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View Receipt
                </a>
              )}
            </div>
            {extracting && (
              <Alert className="bg-indigo-50 border-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <AlertDescription className="text-indigo-900">
                  AI is extracting data from your receipt...
                </AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {expense ? "Update Expense" : "Submit Expense"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}