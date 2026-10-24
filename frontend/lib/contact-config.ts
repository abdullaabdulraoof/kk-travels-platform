const clean = (value: string | undefined) => value?.trim() ?? "";

const whatsappValue = clean(
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_NUMBER,
);

export const contactDetails = {
  email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  phone: clean(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  whatsappNumber: whatsappValue.replace(/\D/g, ""),
  enquiryEndpoint: clean(
    process.env.NEXT_PUBLIC_CONTACT_ENQUIRY_ENDPOINT,
  ),
};
