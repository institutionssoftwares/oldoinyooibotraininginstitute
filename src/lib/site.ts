export const SITE_URL = "https://oldoinyooibortraininginstitute.co.ke";

export const INSTITUTION = {
  name: "Oldoinyo Oibor Training Institute",
  shortName: "OOTI",
  location: "Loitokitok Town, behind KPLC",
  town: "Loitokitok, Kajiado County, Kenya",
  phone: "0748573166",
  whatsapp: "254748573166",
  email: "oldoinyooiborti@gmail.com",
  motto: "We lead, inspire and bring difference.",
  mission:
    "TO PROVIDE QUALITY TECHNICAL AND VOCATIONAL EDUCATION, TRAINING AND COMPETENCIES THAT EQUIPS TRAINEES WITH KNOWLEDGE, SKILLS, VALUES AND ATTITUDES RELEVANT FOR THE LABOUR MARKET LOCALLY AND GLOBALLY.",
  vision:
    "TO BE A LEADING CENTRE OF EXCELLENCE IN THE PROVISION OF QUALITY TECHNICAL, VOCATIONAL AND EDUCATIONAL TRAINING.",
} as const;

export const whatsappLink = (message = "Hello OOTI, I would like to enquire about your courses.") =>
  `https://wa.me/${INSTITUTION.whatsapp}?text=${encodeURIComponent(message)}`;

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Departments", to: "/departments" },
  { label: "Digital Skills", to: "/digital-skills" },
  { label: "Admissions", to: "/admissions" },
  { label: "News", to: "/news" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
] as const;
