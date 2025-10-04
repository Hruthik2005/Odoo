import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Company } from "@/entities/Company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";

export default function Setup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    currency: "",
    role: ""
  });

  useEffect(() => {
    const loadSetup = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser.user_role && currentUser.company_id) {
          navigate(createPageUrl("Dashboard"));
          return;
        }

        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
        const data = await response.json();
        const countryList = data.map(c => ({
          name: c.name.common,
          currencies: Object.keys(c.currencies || {})
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryList);
      } catch (error) {
        await User.loginWithRedirect(window.location.origin + createPageUrl("Setup"));
      }
      setLoading(false);
    };

    loadSetup();
  }, [navigate]);

  const handleCountryChange = (country) => {
    const selectedCountry = countries.find(c => c.name === country);
    setFormData({
      ...formData,
      country,
      currency: selectedCountry?.currencies[0] || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const company = await Company.create({
        name: formData.companyName,
        country: formData.country,
        default_currency: formData.currency
      });

      await User.updateMyUserData({
        company_id: company.id,
        user_role: formData.role
      });

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Setup error:", error);
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-none">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ExpenseFlow
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Let's set up your account and company
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={handleCountryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.currency && (
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}