export const salonInfo = {
  owner: {
    firstName: "Tuya", // Replace with real name later
    lastName: "Bat",
    phone: "99112233",
    email: "admin@beautysalon.mn"
  },
  details: {
    location: "ХУД, Маршал Таун “King Tower” 135-р байр",
    bookingPhone: "77454040",
    workingHours: "09:00 - 20:00",
    interiorPhotos: ["/images/interior-1.jpg", "/images/interior-2.jpg"] // You'll add real images to public/images later
  },
  portfolio: [
    "/images/portfolio-1.jpg", 
    "/images/portfolio-2.jpg",
    "/images/portfolio-3.jpg"
  ]
};

export const servicesList = [
  // --- БИЕИЙН СПА БАГЦ (BODY SPA MENU) ---
  {
    id: "trt-1",
    category: "Body Spa",
    name: "Жасмин Спа Багц (Jasmin Spa)",
    price: 159900,
    durationMinutes: 90,
    description: "Уурын саун, бүтэн биеийн арома массажтай далайн давсан гуужуулалт, нүүрний арома массаж, толгойн бариа." //[cite: 2]
  },
  {
    id: "trt-2",
    category: "Body Spa",
    name: "Лаванда Спа Багц (Lavanda Spa)",
    price: 229900,
    durationMinutes: 120,
    description: "Уурын саун, бүтэн биеийн арома массажтай далайн давсан гуужуулалт, хуйхны гүн цэвэрлэгээ, үсний маск, хоргүйжүүлэх далайн замагт эмчилгээ, нүүрний залуужуулах үйлчилгээ." //[cite: 2]
  },
  {
    id: "trt-3",
    category: "Body Spa",
    name: "Сарнайн Спа Багц (Rose Spa)",
    price: 259900,
    durationMinutes: 120,
    description: "Уурын саун, бүтэн биеийн арома массаж, хуйхны гүн цэвэрлэгээ, үсний маск, далайн замагт эмчилгээ, нүүрний залуужуулах арома массаж, толгойн бариа." //[cite: 2]
  },
  {
    id: "trt-4",
    category: "Body Spa",
    name: "Чийгшүүлэх Спа Багц (Hydrating Spa)",
    price: 349900,
    durationMinutes: 120,
    description: "Уурын саун, арома массажтай органик давсан гуужуулалт, хуйхны гүн цэвэрлэгээ, биеийг гүн чийгшүүлэх сүүн замагт халуун хөнжил, нүүрний Талго арчилгаа." //[cite: 2]
  },

  // --- БИЕИЙН СПА ҮЙЛЧИЛГЭЭ ---
  {
    id: "trt-5",
    category: "Body Spa",
    name: "Бүтэн биеийн алжаал тайлах массаж",
    price: 109900,
    durationMinutes: 60,
    description: "Органик арома биеийн тосоор хийгдэх бүтэн биеийн бариа." //[cite: 2]
  },
  {
    id: "trt-6",
    category: "Body Spa",
    name: "Бүтэн биеийн арома иллэг",
    price: 159900,
    durationMinutes: 90,
    description: "Бумбатай, нүүрний арома амраах иллэг сонголтоор хийгдэнэ." //[cite: 2]
  },
  {
    id: "trt-7",
    category: "Body Spa",
    name: "Жирэмсэн эхийн алжаал тайлах массаж",
    price: 129900,
    durationMinutes: 60,
    description: "Жирэмсэн эхчүүдэд зориулсан органик арома тостой массаж." //[cite: 2]
  },
  {
    id: "trt-8",
    category: "Body Spa",
    name: "Хүүхдийн биеийн бариа",
    price: 89900,
    durationMinutes: 60,
    description: "16 нас хүртэлх хүүхдийн органик арома биеийн тостой бариа." //[cite: 2]
  },
  {
    id: "trt-9",
    category: "Body Spa",
    name: "Биеийг гуужуулах үйлчилгээ",
    price: 119900, 
    durationMinutes: 60,
    description: "Биеийн гуужуулах бүтээгдэхүүний сонголтоор хийгдэнэ (Үнэ: 119,900₮ - 139,900₮)." //[cite: 2]
  },
  {
    id: "trt-10",
    category: "Body Spa",
    name: "Биеийн замагт үйлчилгээ",
    price: 119900,
    durationMinutes: 60,
    description: "Олон минералт, эрдэс агуулсан, биеийг хоргүйжүүлэх органик далайн замаг." //[cite: 2]
  },

  // --- НҮҮРНИЙ ҮЙЛЧИЛГЭЭ (FACIAL TREATMENT) ---
  {
    id: "trt-11",
    category: "Facial",
    name: "Арома нүүрний арьс арчилгаа",
    price: 150000,
    durationMinutes: 60,
    description: "Нүүрний арьс амраах, тайвшруулах арома арчилгаа." //[cite: 2]
  },
  {
    id: "trt-12",
    category: "Facial",
    name: "Тослог арьсны батгашилттай арьс арчилгаа",
    price: 130000,
    durationMinutes: 60,
    description: "Батгашилттай, тослог арьсны тусгай арчилгаа." //[cite: 2]
  },
  {
    id: "trt-13",
    category: "Facial",
    name: "Сүүн хүчлийн гуужуулалт",
    price: 100000,
    durationMinutes: 30,
    description: "Сүүн хүчил ашигласан нүүрний зөөлөн гуужуулалт." //[cite: 2]
  },
  {
    id: "trt-14",
    category: "Facial",
    name: "Карбокси үйлчилгээ",
    price: 100000,
    durationMinutes: 60,
    description: "Арьсанд хүчилтөрөгч өгч, гүн цэвэрлэх үйлчилгээ." //[cite: 2]
  },

  // --- THALGO НҮҮРНИЙ ҮЙЛЧИЛГЭЭ ---
  {
    id: "trt-15",
    category: "Facial",
    name: "Thalgo: Гүн чийгшүүлэх (Source Marine)",
    price: 170000,
    durationMinutes: 70,
    description: "Францын далайн эрдэс витамин, тэжээлийн уурагт коллагентай гүн чийгшүүлэх арчилгаа." //[cite: 2]
  },
  {
    id: "trt-16",
    category: "Facial",
    name: "Thalgo: Гиалурон-Проколлаген",
    price: 190000,
    durationMinutes: 60,
    description: "Гиалуронов өндөр идэвхтэй бүтээгдэхүүн, патенцлагдсан технологийн үйлчилгээ." //[cite: 2]
  },
  {
    id: "trt-17",
    category: "Facial",
    name: "Thalgo: Эрчимтэй цайруулах (Brightening)",
    price: 170000,
    durationMinutes: 60,
    description: "Эрчимтэй цайруулах нүүрний арьс арчилгаа." //[cite: 2]
  },
  {
    id: "trt-18",
    category: "Facial",
    name: "Thalgo: 40+ Залуужуулах (Silicium Lift)",
    price: 220000,
    durationMinutes: 75,
    description: "40-өөс дээш насныханд зориулсан арьс өргөж, залуужуулах үйлчилгээ." //[cite: 2]
  },
  {
    id: "trt-19",
    category: "Facial",
    name: "Thalgo: 50+ Залуужуулах (Exception Redensifying)",
    price: 270000,
    durationMinutes: 75,
    description: "50-иас дээш насныханд зориулсан гүн залуужуулах, нөхөн төлжүүлэх үйлчилгээ." //[cite: 2]
  },

  // --- THALGO iBEAUTY PRO АППАРАТ ---
  {
    id: "trt-20",
    category: "Facial",
    name: "iBeauty Pro: Гүн чийгшүүлэх",
    price: 150000,
    durationMinutes: 70,
    description: "Өвдөлт зовиургүйгээр арьсны гүнд өндөр идэвхит бүтээгдэхүүн шингээх үйлчилгээ." //[cite: 2]
  },
  {
    id: "trt-21",
    category: "Facial",
    name: "iBeauty Pro: Арьс өргөх, залуужуулах",
    price: 170000,
    durationMinutes: 70,
    description: "Арьс өргөх, чийгшүүлэн залуужуулах патентат үйлчилгээтэй аппарат." //[cite: 2]
  },
  {
    id: "trt-22",
    category: "Facial",
    name: "Зовхины арьс арчилгаа",
    price: 100000,
    durationMinutes: 30,
    description: "Нүдний орчмын нарийн үрчлээг тэжээлээр хангах арчилгаа." //[cite: 2]
  },

  // --- ЛАЗЕР (LASER) ---
  {
    id: "trt-23",
    category: "Facial",
    name: "Laser ME (Мэдээ алдуулагчгүй)",
    price: 280000,
    durationMinutes: 60,
    description: "Лазер аппаратаар хийгдэх үйлчилгээ (мэдээ алдуулагчгүй)." //[cite: 2]
  },
  {
    id: "trt-24",
    category: "Facial",
    name: "Laser ME (Мэдээ алдуулагчтай)",
    price: 330000,
    durationMinutes: 90,
    description: "Лазер аппаратаар хийгдэх үйлчилгээ (мэдээ алдуулагчтай)." //[cite: 2]
  },

  // --- ҮСНИЙ ЭМЧИЛГЭЭ (HAIR TREATMENT) ---
  {
    id: "trt-25",
    category: "Hair",
    name: "COSMICO Хуйхны гүн цэвэрлэгээ, чийгшүүлэх",
    price: 150000,
    durationMinutes: 60,
    description: "Солонгосын хуйхны гүн цэвэрлэгээ, чийгшүүлэх эмчилгээ (Purifying Head Spa)." //[cite: 2]
  },
  {
    id: "trt-26",
    category: "Hair",
    name: "COSMICO Хуйхны эмчилгээ + Тариа",
    price: 0, // Үнэ тодорхойгүй, лавлах шаардлагатай
    durationMinutes: 60,
    description: "Хуйхны гүн цэвэрлэгээ болон үсний уналтыг зогсоох тарианы хавсарсан эмчилгээ." //[cite: 2]
  }
];

export const clinicList = [
  // --- CELLBOOSTER МЕЗОТЕРАПИ ---
  {
    id: "cln-1",
    category: "Mesotherapy",
    name: "Cellbooster Glow",
    price: 0, 
    durationMinutes: 30,
    description: "Нөсөөжилт, үрчлээ үүссэн, хуурайшсан арьсанд. Арьсны эмзэгшил, улайлт багасч өнгө сэргэнэ (3мл)." //[cite: 2]
  },
  {
    id: "cln-2",
    category: "Mesotherapy",
    name: "Cellbooster Lift",
    price: 0,
    durationMinutes: 30,
    description: "Батганы дараах сорви, үрчлээ, суларсан арьсанд. Бичил цусан хангамж сайжруулна (3мл)." //[cite: 2]
  },
  {
    id: "cln-3",
    category: "Mesotherapy",
    name: "Cellbooster Shape",
    price: 0,
    durationMinutes: 30,
    description: "Хэсэг газрын өөхөн хуримтлал, давхар эрүү, целлюлит багасгаж тунгалгийн урсгал сайжруулна." //[cite: 2]
  },
  {
    id: "cln-4",
    category: "Mesotherapy",
    name: "Cellbooster Hair",
    price: 0,
    durationMinutes: 30,
    description: "Үсний ширхэг гэмтсэн, андрогений гаралтай үс уналт, эрт бууралталтын эсрэг хуйханд хийх тэжээл." //[cite: 2]
  },

  // --- БОТОКС ТАРИЛГА ---
  {
    id: "cln-5",
    category: "Botox",
    name: "Үрчлээ арилгах ботокс (1 тун)",
    price: 10000, 
    durationMinutes: 15,
    description: "Нэг тунгийн үнээр тооцогдох үрчлээний эсрэг тарилга." //[cite: 2]
  },
  {
    id: "cln-6",
    category: "Botox",
    name: "Ботокс: Дээд 3/1",
    price: 200000, 
    durationMinutes: 30,
    description: "Нүүрний дээд хэсгийн үрчлээ арилгах (Үнэ: 200,000₮ - 350,000₮)." //[cite: 2]
  },
  {
    id: "cln-7",
    category: "Botox",
    name: "Ботокс: Завжны булчин суллах, V-Line",
    price: 500000,
    durationMinutes: 30,
    description: "Эрүүний булчин суллаж, нүүрний хэлбэр засах тарилга." //[cite: 2]
  },
  {
    id: "cln-8",
    category: "Botox",
    name: "Ботокс: Суганы хөлрөлт багасгах",
    price: 500000,
    durationMinutes: 30,
    description: "Суганы хэт их хөлрөлт зогсоох эмчилгээ (Үнэ: 500,000₮ - 600,000₮)." //[cite: 2]
  },

  // --- ФИЛЛЕР & УТАС ---
  {
    id: "cln-9",
    category: "Filler",
    name: "Филлер: Чихний омог дүүргэх",
    price: 650000,
    durationMinutes: 30,
    description: "Чихний омог хэлбэржүүлж дүүргэх филлер тарилга." //[cite: 2]
  },
  {
    id: "cln-10",
    category: "Threads",
    name: "Коллагентай утас: Хацар, завж",
    price: 500000,
    durationMinutes: 45,
    description: "Хацар болон завжны унжилт татах моно утас суулгах." //[cite: 2]
  },
  {
    id: "cln-11",
    category: "Threads",
    name: "Коллагентай утас: Хүзүү",
    price: 400000,
    durationMinutes: 45,
    description: "Хүзүүний арьс чангалах моно утас (Үнэ: 400,000₮ - 500,000₮)." //[cite: 2]
  },
  {
    id: "cln-12",
    category: "Threads",
    name: "PDO Утас",
    price: 600000,
    durationMinutes: 45,
    description: "Арьс гүн чангалах PDO утас суулгах ажилбар." //[cite: 2]
  },

  // --- ПИЛИНГ & МЕЗОТЕРАПИ ТАРИЛГУУД ---
  {
    id: "cln-13",
    category: "Peeling",
    name: "Peeling (Гуужуулах эмчилгээ)",
    price: 200000,
    durationMinutes: 45,
    description: "Үхэжсэн арьс гуужуулж, сэвх нөсөө бүдгэрүүлэн батга хатаах курс эмчилгээ (Үнэ: 200,000₮ - 400,000₮)." //[cite: 2]
  },
  {
    id: "cln-14",
    category: "Mesotherapy",
    name: "Lucsi Exosome Мезотерапи",
    price: 550000,
    durationMinutes: 45,
    description: "Ургамлын 4,5 тэрбум эксосом, PDRN, өсөлтийн фактор, Вит С агуулсан чийгшүүлж нөхөн төлжүүлэх тарилга." //[cite: 2]
  },
  {
    id: "cln-15",
    category: "Mesotherapy",
    name: "LAPORUUN Aurora",
    price: 550000,
    durationMinutes: 45,
    description: "Өндөр тунтай гиалуроны хүчил, PDRN, пептид агуулсан арьсны уян хатан чанар сайжруулах тарилга." //[cite: 2]
  },
  {
    id: "cln-16",
    category: "Mesotherapy",
    name: "Elravie RE20",
    price: 900000,
    durationMinutes: 45,
    description: "Арьсны хөгшрөлтийн эсрэг, коллаген, эластин нэмж нүхжилт багасгах өндөр үйлчилгээтэй тарилга." //[cite: 2]
  },
  {
    id: "cln-17",
    category: "Mesotherapy",
    name: "Pink",
    price: 450000,
    durationMinutes: 45,
    description: "10 төрлийн амин дэм, 14 төрлийн амин хүчил, глютатион агуулсан арьс чийгшүүлэх тарилга." //[cite: 2]
  },
  {
    id: "cln-18",
    category: "Mesotherapy",
    name: "Lipo Lab",
    price: 0, // Үнэ бичигдээгүй, 1 тун нь 10мл байна
    durationMinutes: 30,
    description: "Хэвлий, бугалга, нуруу зэрэг хүссэн хэсэгт тарьж өөхийг хайлуулж чангалах тарилга." //[cite: 2]
  }
];
export const staffList = [
  {
    id: "staff-1",
    firstName: "Солонго",
    lastName: "Очирбат",
    role: "Сургалт үйлчилгээ хариуцсан менежер, Мастер гоо засалч",
    experience: "14 жил",
    education: "Эмчилгээний гоо заслын магистр (Ражив Ганди ТӨҮТ)",
    phone: "7777-XXXX",
    email: "solongo@aromaspa.mn",
    portfolio: ["/img1.jpg", "/img2.jpg", "/img3.jpg"] // Add placeholder portfolio
  },
  {
    id: "staff-2",
    firstName: "Ганганмөрөн",
    lastName: "Мөнхдалай",
    role: "Гоо засалч",
    experience: "4 жил",
    education: "Гоо засалч бакалавр (СИТИ Их сургууль), Мастер 1-р зэрэг",
    phone: "7777-XXXX",
    email: "ganganmoron@aromaspa.mn",
    portfolio: ["/img1.jpg", "/img2.jpg", "/img3.jpg"]
  },
  {
    id: "staff-3",
    firstName: "Баасансүрэн",
    lastName: "Лхагвадорж",
    role: "Гоо засалч, Борлуулалтын менежер",
    experience: "9 жил",
    education: "COSMICA KOREA Толгойн спа, БНСУ-ын 'GBTT' төгсөгч",
    phone: "7777-XXXX",
    email: "baasansuren@aromaspa.mn",
    portfolio: ["/img1.jpg", "/img2.jpg", "/img3.jpg"]
  },
  {
    id: "staff-4",
    firstName: "Ариунзаяа",
    lastName: "Ганхуяг",
    role: "Ахлах гоо засалч",
    experience: "10 жил",
    education: "БНСУ-ын COSMICA 'GBTT' 2026 төгсөгч",
    phone: "7777-XXXX",
    email: "ariunzaya@aromaspa.mn",
    portfolio: ["/img1.jpg", "/img2.jpg", "/img3.jpg"]
  },
  {
    id: "staff-5",
    firstName: "Чимэдням",
    lastName: "Чинбаатар",
    role: "Гоо сайханч, Бариа засалч",
    experience: "4 жил",
    education: "Мэргэжлийн гоо сайханч (Булган МСҮТ)",
    phone: "7777-XXXX",
    email: "chimednyam@aromaspa.mn",
    portfolio: ["/img1.jpg", "/img2.jpg", "/img3.jpg"]
  }
];