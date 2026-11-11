const WHATSAPP_NUMBER = "923124151612";

// Opens a chat with a greeting already typed, so customers can just press send.
export function whatsappLink(message = "Hi Levish! I have a question.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const contact = {
  email: "itslevishstore@gmail.com",
  phone: "+923124151612",
  whatsapp: "+92 312 4151612",
  whatsappHref: whatsappLink(),
  facebook: "https://www.facebook.com/profile.php?id=61596213504336",
  instagram: "https://www.instagram.com/itslevishstore/",
  instagramHandle: "@itslevishstore",
  tiktok: "https://www.tiktok.com/@levish426",
  tiktokHandle: "@levish426",
};

export const socialLinks = [contact.instagram, contact.facebook, contact.tiktok];
