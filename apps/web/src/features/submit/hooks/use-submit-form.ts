"use client";

import { useState } from "react";
import { getRecaptchaToken } from "../lib/recaptcha";
import type { BaseFormFields, FieldErrors } from "../types";

interface Config<T extends BaseFormFields> {
  initial: T;
  validate: (fields: T) => FieldErrors<T>;
  apiEndpoint: string;
  recaptchaAction: string;
  buildFormData: (fields: T, recaptchaToken: string) => FormData;
}

export function useSubmitForm<T extends BaseFormFields>({
  initial,
  validate,
  apiEndpoint,
  recaptchaAction,
  buildFormData,
}: Config<T>) {
  const [fields, setFields] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addCategory = (cat: string) => {
    if (cat && !fields.categories_list.includes(cat)) {
      set(
        "categories_list" as keyof T,
        [...fields.categories_list, cat] as T[keyof T],
      );
    }
  };

  const removeCategory = (cat: string) => {
    set(
      "categories_list" as keyof T,
      fields.categories_list.filter((c) => c !== cat) as T[keyof T],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0] as string)?.focus();
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const form = buildFormData(fields, recaptchaToken);

      const res = await fetch(apiEndpoint, { method: "POST", body: form });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        errors?: string[];
      };

      if (!res.ok) {
        setErrors({
          _form:
            (Array.isArray(data.errors) ? data.errors.join(" ") : data.error) ||
            "Something went wrong. Please try again.",
        } as FieldErrors<T>);
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({
        _form: "Could not submit. Please check your connection and try again.",
      } as FieldErrors<T>);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    fields,
    errors,
    submitting,
    success,
    set,
    addCategory,
    removeCategory,
    handleSubmit,
  };
}
