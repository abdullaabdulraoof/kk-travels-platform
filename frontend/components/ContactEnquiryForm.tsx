"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactDetails } from "@/lib/contact-config";

type EnquiryType = "medical" | "tourism";

type CommonFields = {
  name: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  message: string;
};

type MedicalFields = {
  needs: string[];
  hospital: string;
  appointmentDate: string;
  accommodation: string;
};

type TourismFields = {
  experiences: string[];
  travelDate: string;
  travellers: string;
  duration: string;
};

type FormErrors = Record<string, string>;
type SubmissionStatus = { kind: "success" | "error"; message: string } | null;

const initialCommonFields: CommonFields = {
  name: "",
  email: "",
  phone: "",
  country: "",
  language: "",
  message: "",
};

const initialMedicalFields: MedicalFields = {
  needs: [],
  hospital: "",
  appointmentDate: "",
  accommodation: "",
};

const initialTourismFields: TourismFields = {
  experiences: [],
  travelDate: "",
  travellers: "1",
  duration: "",
};

const medicalNeeds = [
  "Hospital appointment coordination",
  "Accommodation",
  "Airport transfers and local transport",
  "Language assistance",
];

const tourismExperiences = [
  "Backwaters and houseboats",
  "Hill stations and tea gardens",
  "Culture and heritage",
  "A customized Kerala itinerary",
];

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateFields(
  common: CommonFields,
  enquiryType: EnquiryType,
  medical: MedicalFields,
  tourism: TourismFields,
): FormErrors {
  const errors: FormErrors = {};
  const requiredCommon: Array<[keyof CommonFields, string]> = [
    ["name", "Enter your name."],
    ["email", "Enter your email address."],
    ["phone", "Enter a phone number where we can reach you."],
    ["country", "Enter your country of residence."],
    ["language", "Choose your preferred language."],
  ];

  for (const [field, message] of requiredCommon) {
    if (!common[field].trim()) errors[field] = message;
  }

  if (common.email.trim() && !validateEmail(common.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  const phoneDigits = common.phone.replace(/\D/g, "");
  if (
    common.phone.trim() &&
    (!/^[+\d().\s-]+$/.test(common.phone) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15)
  ) {
    errors.phone = "Enter a phone number with 7 to 15 digits.";
  }

  if (enquiryType === "medical" && medical.needs.length === 0) {
    errors.needs = "Choose at least one type of medical travel assistance.";
  }

  if (enquiryType === "tourism" && tourism.experiences.length === 0) {
    errors.experiences = "Choose at least one Kerala experience.";
  }

  if (
    enquiryType === "tourism" &&
    (!tourism.travellers.trim() ||
      !Number.isInteger(Number(tourism.travellers)) ||
      Number(tourism.travellers) < 1)
  ) {
    errors.travellers = "Enter at least one traveller.";
  }

  return errors;
}

export default function ContactEnquiryForm() {
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("medical");
  const [common, setCommon] = useState<CommonFields>(initialCommonFields);
  const [medical, setMedical] = useState<MedicalFields>(initialMedicalFields);
  const [tourism, setTourism] = useState<TourismFields>(initialTourismFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const focusFirstError = useRef(false);

  useEffect(() => {
    if (focusFirstError.current && Object.keys(errors).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      focusFirstError.current = false;
    }
  }, [errors]);

  function updateCommon(field: keyof CommonFields, value: string) {
    setCommon((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus(null);
  }

  function toggleChoice(
    value: string,
    setter: (update: (current: string[]) => string[]) => void,
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((choice) => choice !== value)
        : [...current, value],
    );
    setErrors((current) => {
      const next = { ...current };
      delete next[enquiryType === "medical" ? "needs" : "experiences"];
      return next;
    });
    setStatus(null);
  }

  function changeEnquiryType(value: EnquiryType) {
    setEnquiryType(value);
    setErrors({});
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFields(common, enquiryType, medical, tourism);
    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError.current = true;
      return;
    }

    focusFirstError.current = false;
    if (!contactDetails.enquiryEndpoint) {
      setStatus({
        kind: "error",
        message:
          "Your details have not been sent. Online enquiries are not connected yet; please use the configured contact options when available.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const details =
        enquiryType === "medical"
          ? {
              assistanceNeeded: medical.needs,
              preferredHospital: medical.hospital,
              preferredAppointmentDate: medical.appointmentDate,
              accommodationNeeded: medical.accommodation,
            }
          : {
              preferredExperiences: tourism.experiences,
              preferredTravelDate: tourism.travelDate,
              travellerCount: Number(tourism.travellers),
              tripDuration: tourism.duration,
            };

      const response = await fetch(contactDetails.enquiryEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryType,
          ...common,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error(`Enquiry service returned ${response.status}.`);
      }

      setStatus({
        kind: "success",
        message:
          "Your enquiry has been sent. Our team will follow up using the contact details you provided.",
      });
    } catch (error) {
      console.error("Could not submit the contact enquiry.", error);
      setStatus({
        kind: "error",
        message:
          "We could not send your enquiry. Your details are still here; please try again later or use another contact option.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="enquiry-panel">
      <div className="enquiry-tabs" role="tablist" aria-label="Enquiry type">
        <button
          id="medical-enquiry-tab"
          type="button"
          role="tab"
          aria-selected={enquiryType === "medical"}
          aria-controls="enquiry-form-fields"
          className={enquiryType === "medical" ? "is-active" : ""}
          onClick={() => changeEnquiryType("medical")}
        >
          Medical travel
        </button>
        <button
          id="tourism-enquiry-tab"
          type="button"
          role="tab"
          aria-selected={enquiryType === "tourism"}
          aria-controls="enquiry-form-fields"
          className={enquiryType === "tourism" ? "is-active" : ""}
          onClick={() => changeEnquiryType("tourism")}
        >
          Kerala tourism
        </button>
      </div>

      <form
        id="enquiry-form-fields"
        className="contact-form"
        role="tabpanel"
        aria-labelledby={`${enquiryType}-enquiry-tab`}
        onSubmit={handleSubmit}
        noValidate
      >
        <p className="form-required-note">
          Fields marked <span aria-hidden="true">*</span> are required.
        </p>

        <div className="form-grid">
          <TextField
            id="contact-name"
            label="Full name"
            value={common.name}
            error={errors.name}
            required
            autoComplete="name"
            onChange={(value) => updateCommon("name", value)}
          />
          <TextField
            id="contact-email"
            label="Email address"
            type="email"
            value={common.email}
            error={errors.email}
            required
            autoComplete="email"
            onChange={(value) => updateCommon("email", value)}
          />
          <TextField
            id="contact-phone"
            label="Phone number"
            type="tel"
            value={common.phone}
            error={errors.phone}
            required
            autoComplete="tel"
            onChange={(value) => updateCommon("phone", value)}
          />
          <TextField
            id="contact-country"
            label="Country of residence"
            value={common.country}
            error={errors.country}
            required
            autoComplete="country-name"
            onChange={(value) => updateCommon("country", value)}
          />
          <label className="form-field" htmlFor="contact-language">
            <span>
              Preferred language <b aria-hidden="true">*</b>
            </span>
            <select
              id="contact-language"
              value={common.language}
              aria-invalid={Boolean(errors.language)}
              aria-describedby={errors.language ? "contact-language-error" : undefined}
              onChange={(event) => updateCommon("language", event.target.value)}
              required
            >
              <option value="">Choose a language</option>
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
              <option value="Malayalam">Malayalam</option>
              <option value="Other">Other</option>
            </select>
            {errors.language && (
              <small id="contact-language-error" className="field-error">
                {errors.language}
              </small>
            )}
          </label>
        </div>

        {enquiryType === "medical" ? (
          <div className="conditional-fields">
            <ChoiceGroup
              id="medical-needs"
              legend="What would you like help with?"
              options={medicalNeeds}
              selected={medical.needs}
              error={errors.needs}
              onChange={(value) =>
                toggleChoice(value, (update) =>
                  setMedical((current) => ({
                    ...current,
                    needs: update(current.needs),
                  })),
                )
              }
            />
            <div className="form-grid">
              <TextField
                id="medical-hospital"
                label="Hospital preference (optional)"
                value={medical.hospital}
                onChange={(value) => {
                  setMedical((current) => ({ ...current, hospital: value }));
                  setStatus(null);
                }}
              />
              <TextField
                id="medical-date"
                label="Preferred appointment date (optional)"
                type="date"
                value={medical.appointmentDate}
                onChange={(value) => {
                  setMedical((current) => ({
                    ...current,
                    appointmentDate: value,
                  }));
                  setStatus(null);
                }}
              />
              <label className="form-field" htmlFor="medical-accommodation">
                <span>Accommodation support (optional)</span>
                <select
                  id="medical-accommodation"
                  value={medical.accommodation}
                  onChange={(event) => {
                    setMedical((current) => ({
                      ...current,
                      accommodation: event.target.value,
                    }));
                    setStatus(null);
                  }}
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes, please</option>
                  <option value="no">No, thank you</option>
                  <option value="unsure">I am not sure yet</option>
                </select>
              </label>
            </div>
            <p className="privacy-note">
              Please do not include diagnoses, medical records, or other
              sensitive health information in this enquiry.
            </p>
          </div>
        ) : (
          <div className="conditional-fields">
            <ChoiceGroup
              id="tourism-experiences"
              legend="What would you like to experience?"
              options={tourismExperiences}
              selected={tourism.experiences}
              error={errors.experiences}
              onChange={(value) =>
                toggleChoice(value, (update) =>
                  setTourism((current) => ({
                    ...current,
                    experiences: update(current.experiences),
                  })),
                )
              }
            />
            <div className="form-grid">
              <TextField
                id="tourism-date"
                label="Preferred travel date (optional)"
                type="date"
                value={tourism.travelDate}
                onChange={(value) => {
                  setTourism((current) => ({ ...current, travelDate: value }));
                  setStatus(null);
                }}
              />
              <TextField
                id="tourism-travellers"
                label="Number of travellers"
                type="number"
                min="1"
                required
                value={tourism.travellers}
                error={errors.travellers}
                onChange={(value) => {
                  setTourism((current) => ({ ...current, travellers: value }));
                  setErrors((current) => {
                    const next = { ...current };
                    delete next.travellers;
                    return next;
                  });
                  setStatus(null);
                }}
              />
              <TextField
                id="tourism-duration"
                label="Trip duration (optional)"
                value={tourism.duration}
                onChange={(value) => {
                  setTourism((current) => ({ ...current, duration: value }));
                  setStatus(null);
                }}
              />
            </div>
          </div>
        )}

        <label className="form-field form-message" htmlFor="contact-message">
          <span>Anything else we should know? (optional)</span>
          <textarea
            id="contact-message"
            rows={4}
            maxLength={1200}
            value={common.message}
            onChange={(event) => updateCommon("message", event.target.value)}
          />
        </label>

        <div className="form-submit-row">
          <button className="contact-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending enquiry…" : "Send enquiry"}
            <span aria-hidden="true">↗</span>
          </button>
          <p>
            Your information is used only to respond to this enquiry. Do not
            submit medical records through this form.
          </p>
        </div>

        {status && (
          <p
            className={`form-status form-status--${status.kind}`}
            role={status.kind === "error" ? "alert" : "status"}
            aria-live={status.kind === "error" ? "assertive" : "polite"}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  min?: string;
  onChange: (value: string) => void;
};

function TextField({
  id,
  label,
  value,
  error,
  type = "text",
  required = false,
  autoComplete,
  min,
  onChange,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <label className="form-field" htmlFor={id}>
      <span>
        {label} {required && <b aria-hidden="true">*</b>}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        min={min}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <small className="field-error" id={errorId}>
          {error}
        </small>
      )}
    </label>
  );
}

type ChoiceGroupProps = {
  id: string;
  legend: string;
  options: string[];
  selected: string[];
  error?: string;
  onChange: (value: string) => void;
};

function ChoiceGroup({
  id,
  legend,
  options,
  selected,
  error,
  onChange,
}: ChoiceGroupProps) {
  const errorId = `${id}-error`;

  return (
    <fieldset
      id={id}
      className="choice-group"
      aria-describedby={error ? errorId : undefined}
    >
      <legend>{legend} <b aria-hidden="true">*</b></legend>
      <div className="choice-options">
        {options.map((option) => (
          <label className="choice-option" key={option}>
            <input
              type="checkbox"
              name={id}
              value={option}
              checked={selected.includes(option)}
              aria-invalid={Boolean(error)}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <small id={errorId} className="field-error">
          {error}
        </small>
      )}
    </fieldset>
  );
}
