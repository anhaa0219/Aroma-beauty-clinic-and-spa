export const salonInfo = {
  owner: {
    firstName: "Tuya", // Replace with real name later
    lastName: "Bat",
    phone: "99112233",
    email: "admin@beautysalon.mn"
  },
  details: {
    location: "Ulaanbaatar, Sukhbaatar district, 1st khoroo",
    bookingPhone: "77112233",
    workingHours: "09:00 - 20:00",
    interiorPhotos: ["/images/interior-1.jpg", "/images/interior-2.jpg"] // You'll add real images to public/images later
  },
  portfolio: [
    "/images/portfolio-1.jpg", 
    "/images/portfolio-2.jpg",
    "/images/portfolio-3.jpg"
  ]
};

export const staffList = [
  {
    id: "staff-1",
    firstName: "Anu",
    lastName: "Bold",
    phone: "88112233",
    email: "anu@beautysalon.mn",
    role: "Менежер", 
    photo: "/images/staff-anu.jpg",
    schedule: {
      monday: ["09:00", "18:00"],
      tuesday: ["09:00", "18:00"],
      wednesday: ["09:00", "18:00"],
      thursday: ["09:00", "18:00"],
      friday: ["09:00", "18:00"],
    },
    // NEW: Add a portfolio array for Anu
    portfolio: [
      "/images/anu-work-1.jpg",
      "/images/anu-work-2.jpg",
      "/images/anu-work-3.jpg"
    ]
  },
  {
    id: "staff-2",
    firstName: "Saraa",
    lastName: "Ganbat",
    phone: "88223344",
    email: "saraa@beautysalon.mn",
    role: "Ахлах ажилтан", 
    photo: "/images/staff-saraa.jpg",
    schedule: {
      monday: ["10:00", "20:00"],
      wednesday: ["10:00", "20:00"],
      friday: ["10:00", "20:00"],
      saturday: ["10:00", "20:00"],
    },
    // NEW: Add a portfolio array for Saraa
    portfolio: [
      "/images/saraa-work-1.jpg",
      "/images/saraa-work-2.jpg",
      "/images/saraa-work-3.jpg"
    ]
  }
];

export const servicesList = [
  {
    id: "srv-1",
    name: "Эмэгтэй үс тайралт (Women's Haircut)",
    price: 35000,
    durationMinutes: 45
  },
  {
    id: "srv-2",
    name: "Энгийн маникюр (Basic Manicure)",
    price: 25000,
    durationMinutes: 60
  },
  {
    id: "srv-3",
    name: "Бүтэн биеийн массаж (Full Body Massage)",
    price: 80000,
    durationMinutes: 90
  }
];