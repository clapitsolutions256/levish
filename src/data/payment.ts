import { contact, whatsappLink } from "@/data/contact";

// Account customers pay into when they choose online transfer at checkout.
export const bankTransfer = {
  bank: "United Bank Limited (UBL)",
  accountTitle: "Clapit Solutions",
  accountNumber: "2912373932256",
  cashbackPercent: 12,
  screenshotTo: contact.whatsapp,
  screenshotHref: whatsappLink("Hi Levish! Here is the screenshot of my online transfer."),
};
