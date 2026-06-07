"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import Button from "@/components/Button";
import FormField, { Input, Textarea } from "@/components/FormField";
import ErrorAlert from "@/components/ErrorAlert";
import { useLanguage } from "@/components/LanguageProvider";

export default function ContactPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError(isRo ? "Completati toate campurile obligatorii." : "Please complete all required fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Contact
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {isRo
              ? "Ai o intrebare, o problema sau o sugestie? Trimite-ne un mesaj si iti raspundem cat mai repede."
              : "Have a question, issue or suggestion? Send us a message and we will reply as soon as possible."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Mail,
                title: "Email",
                value: "contact@nutrisense.ro",
                note: isRo ? "Raspundem in 24-48h" : "We reply in 24-48h",
              },
              {
                icon: Clock,
                title: isRo ? "Program suport" : "Support hours",
                value: isRo ? "Lun-Vin, 9:00-17:00" : "Mon-Fri, 9:00-17:00",
                note: isRo ? "Ora Romaniei (EET/EEST)" : "Romania time (EET/EEST)",
              },
              {
                icon: MessageSquare,
                title: isRo ? "Timp de raspuns" : "Response time",
                value: isRo ? "24-48 ore" : "24-48 hours",
                note: isRo ? "In zilele lucratoare" : "On business days",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {item.title}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-8 flex flex-col items-center text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  {isRo ? "Mesaj trimis!" : "Message sent!"}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {isRo
                    ? "Multumim pentru mesaj. Iti vom raspunde la adresa de email furnizata in 24-48 ore."
                    : "Thanks for your message. We will reply to your email address within 24-48 hours."}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
                  {isRo ? "Trimite un mesaj" : "Send a message"}
                </h2>
                {error && (
                  <ErrorAlert message={error} className="mb-4" onDismiss={() => setError("")} />
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nume" required>
                      <Input
                        placeholder={isRo ? "Numele tau" : "Your name"}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </FormField>
                    <FormField label={isRo ? "Email" : "Email"} required>
                      <Input
                        type="email"
                        placeholder={isRo ? "email@exemplu.ro" : "email@example.com"}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </FormField>
                  </div>
                  <FormField label={isRo ? "Subiect" : "Subject"}>
                    <Input
                      placeholder={isRo ? "Despre ce este mesajul?" : "What is your message about?"}
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </FormField>
                  <FormField label={isRo ? "Mesaj" : "Message"} required>
                    <Textarea
                      rows={5}
                      placeholder={isRo ? "Descrie problema sau intrebarea ta..." : "Describe your issue or question..."}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </FormField>
                  <Button type="submit" loading={loading} fullWidth size="lg">
                    {isRo ? "Trimite mesajul" : "Send message"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
