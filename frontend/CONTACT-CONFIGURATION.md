# Contact page configuration

The contact page lives at `/contact`. Its contact options are intentionally
unconfigured until KK Travels supplies verified business details. Copy the
empty settings in `.env.example` into the frontend environment and fill in the
appropriate values:

- `NEXT_PUBLIC_CONTACT_WHATSAPP_NUMBER`: international number with country code
  (digits are used to build the `wa.me` link).
- `NEXT_PUBLIC_CONTACT_PHONE`: public phone number used for `tel:` links.
- `NEXT_PUBLIC_CONTACT_EMAIL`: public email address used for `mailto:` links.
- `NEXT_PUBLIC_CONTACT_ENQUIRY_ENDPOINT`: optional HTTPS endpoint that accepts
  `POST` requests.

These `NEXT_PUBLIC_` values are included in client-side output. Do not put
credentials, private tokens, or other secrets in them. Restart/rebuild the
frontend after changing them.

## Enquiry endpoint contract

No enquiry endpoint currently exists in the NestJS backend. Until one is
implemented and configured, the form validates input but clearly reports that
the enquiry has not been sent. It does not show a success message or discard
form values.

When an endpoint is available, the page sends JSON shaped as:

```json
{
  "enquiryType": "medical",
  "name": "Visitor name",
  "email": "visitor@example.com",
  "phone": "+00000000000",
  "country": "Country",
  "language": "English",
  "message": "",
  "details": {
    "assistanceNeeded": ["Hospital appointment coordination"],
    "preferredHospital": "",
    "preferredAppointmentDate": "",
    "accommodationNeeded": ""
  }
}
```

The `details` object varies by enquiry type. The tourism form sends
`preferredExperiences`, `preferredTravelDate`, `travellerCount`, and
`tripDuration`. The frontend considers a submission successful only when the
configured endpoint returns an HTTP success status. The backend should validate
all fields, protect against abuse, and handle privacy/retention requirements
before this endpoint is used in production.
