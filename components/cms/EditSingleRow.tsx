"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Field {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "toggle";
  placeholder?: string;
  hint?: string;
}

interface EditSingleRowProps {
  title: string;
  fields: Field[];
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<{ error?: string }>;
  readOnly?: boolean;
}

export default function EditSingleRow({ title, fields, data, onSave, readOnly }: EditSingleRowProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(data);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [prevData, setPrevData] = useState(data);
  
  const formRef = useRef<HTMLFormElement>(null);

  if (data !== prevData) {
    setFormData(data);
    setPrevData(data);
  }

  useGSAP(() => {
    gsap.fromTo(
      ".form-field-anim",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
    );
  }, { scope: formRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await onSave(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Saved successfully!" });
    }
    setSaving(false);
  };
  
  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 hover:border-white/20 focus:border-orange/50 focus:ring-1 focus:ring-orange/50 transition-all rounded-lg";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="px-8 py-5 border-b border-white/10 bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
      </div>

      <div className="p-8 space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="form-field-anim space-y-2.5">
            <Label className="text-sm text-white/70 font-semibold uppercase tracking-wider">{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                value={(formData[field.key] as string) || ""}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                disabled={readOnly}
                className={`${inputClass} min-h-[120px] resize-y p-4`}
              />
            ) : field.type === "toggle" ? (
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                    disabled={readOnly}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange shadow-inner"></div>
                </label>
                <span className={cn("text-sm font-medium", formData[field.key] ? "text-orange" : "text-white/50")}>
                  {formData[field.key] ? "Enabled" : "Disabled"}
                </span>
              </div>
            ) : (
              <Input
                type={field.type || "text"}
                value={(formData[field.key] as string) || ""}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                disabled={readOnly}
                className={`${inputClass} h-11 px-4`}
              />
            )}
            {field.hint && <p className="text-xs text-white/40 mt-1.5">{field.hint}</p>}
          </div>
        ))}
      </div>

      {message && (
        <div className="px-8 pb-4">
          <div
            className={cn(
              "p-4 rounded-xl text-sm font-medium flex items-center gap-2",
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400 shadow-[inset_0_0_12px_rgba(34,197,94,0.1)]"
                : "bg-red-500/10 border border-red-500/30 text-red-400 shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]"
            )}
          >
            {message.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="px-8 py-5 border-t border-white/10 flex justify-end bg-black/20">
          <Button 
            type="submit" 
            className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_15px_rgba(255,107,0,0.4)] rounded-xl transition-all font-medium px-6 py-5 text-base" 
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
