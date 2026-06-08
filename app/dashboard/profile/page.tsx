"use client";

import React, { useEffect, useState } from "react";
import { User, Save, Info } from "lucide-react";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/Card";
import FormField, { Input, Select } from "@/components/FormField";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ErrorAlert from "@/components/ErrorAlert";
import { PageLoader } from "@/components/LoadingOverlay";
import { useLanguage } from "@/components/LanguageProvider";
import { getProfile, updateProfile } from "@/lib/api/profile";
import { getDietaryLabel, getIntoleranceLabel } from "@/lib/i18n/labels";
import type { UserProfile, Intolerance, DietaryPreference } from "@/types/profile";
import {
  INTOLERANCE_LABELS,
  DIETARY_PREFERENCE_LABELS,
} from "@/types/profile";

const ALL_INTOLERANCES = Object.keys(INTOLERANCE_LABELS) as Intolerance[];

export default function ProfilePage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    dietaryPreference: "normal" as DietaryPreference,
    intolerances: [] as Intolerance[],
  });

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setForm({
        name: p.name,
        dietaryPreference: p.dietaryPreference,
        intolerances: p.intolerances,
      });
      setLoading(false);
    });
  }, []);

  const toggleIntolerance = (intol: Intolerance) => {
    setForm((f) => ({
      ...f,
      intolerances: f.intolerances.includes(intol)
        ? f.intolerances.filter((i) => i !== intol)
        : [...f.intolerances, intol],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.name.trim()) {
      setError(isRo ? "Numele nu poate fi gol." : "Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      void err;
      setError(isRo ? "Salvare esuata." : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const dietOptions = Object.entries(DIETARY_PREFERENCE_LABELS).map(
    ([value]) => ({ value, label: getDietaryLabel(value as DietaryPreference, lang) })
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRo ? "Profilul meu" : "My profile"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRo ? "Gestioneaza datele si preferintele tale" : "Manage your details and preferences"}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {isRo
            ? "Profilul tau este folosit pentru a adapta recomandarile generale la nevoile tale. Nu stocam date medicale sensibile."
            : "Your profile is used to adapt general guidance to your needs. We do not store sensitive medical data."}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        {success && (
          <ErrorAlert
            type="success"
            message={isRo ? "Profilul a fost salvat cu succes!" : "Profile saved successfully!"}
            onDismiss={() => setSuccess(false)}
          />
        )}

        {/* Personal data */}
        <Card bordered>
          <CardHeader>
            <CardTitle>{isRo ? "Date personale" : "Personal details"}</CardTitle>
            <CardDescription>{isRo ? "Informatii de baza ale contului tau" : "Basic account information"}</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <FormField label={isRo ? "Nume complet" : "Full name"} required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={isRo ? "Numele tau" : "Your name"}
              />
            </FormField>
            <FormField label={isRo ? "Adresa de email" : "Email address"} hint={isRo ? "Email-ul nu poate fi modificat." : "Email cannot be changed."}>
              <Input
                value={profile?.email ?? ""}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            </FormField>
          </div>
        </Card>

        {/* Dietary preference */}
        <Card bordered>
          <CardHeader>
            <CardTitle>{isRo ? "Preferinta alimentara" : "Dietary preference"}</CardTitle>
            <CardDescription>
              {isRo ? "Tipul tau de dieta pentru recomandari mai precise" : "Your diet type for more relevant guidance"}
            </CardDescription>
          </CardHeader>
          <FormField label={isRo ? "Preferinta alimentara" : "Dietary preference"}>
            <Select
              value={form.dietaryPreference}
              options={dietOptions}
              onChange={(e) =>
                setForm({
                  ...form,
                  dietaryPreference: e.target.value as DietaryPreference,
                })
              }
            />
          </FormField>
        </Card>

        {/* Intolerances */}
        <Card bordered>
          <CardHeader>
            <CardTitle>{isRo ? "Intolerante alimentare" : "Food intolerances"}</CardTitle>
            <CardDescription>
              {isRo ? "Selecteaza intolerantele tale. Poti modifica oricand." : "Select your intolerances. You can update them anytime."}
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {ALL_INTOLERANCES.map((intol) => {
              const selected = form.intolerances.includes(intol);
              return (
                <button
                  key={intol}
                  type="button"
                  onClick={() => toggleIntolerance(intol)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                    selected
                      ? "bg-green-600 border-green-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400"
                  }`}
                >
                  {getIntoleranceLabel(intol, lang)}
                </button>
              );
            })}
          </div>
          {form.intolerances.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {isRo ? "Selectate" : "Selected"} ({form.intolerances.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {form.intolerances.map((i) => (
                  <Badge key={i} variant="green">
                    {getIntoleranceLabel(i, lang)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />} size="lg">
          {saving ? (isRo ? "Se salveaza..." : "Saving...") : (isRo ? "Salveaza modificarile" : "Save changes")}
        </Button>
      </form>
    </div>
  );
}
