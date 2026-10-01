
// 1. Updated Data: Removed phone/email/images, added full 'details' array
const staffList = [
  {
    id: "staff-1",
    firstName: "Солонго",
    lastName: "Очирбат",
    role: "Сургалт хариуцсан менежер, Мастер гоо засалч",
    details: [
      "🎓 Боловсрол: Эмчилгээний гоо заслын магистр, Ражив Ганди ТӨҮТ (2007-2011).",
      "⏳ Туршлага: 2012 оноос хойш тасралтгүй 14 жил ажиллаж байна.",
      "📜 Сургалт: Францын Thalgo брэндийн сургалт (2015, 2018), БНСУ-ын COSMICA 'GBTT' 2026 төгсөгч.",
      "🏆 Шагнал: Cosmobeauty 2026 (Солонгос) үзэсгэлэнд оролцох эрхээр шагнагдсан."
    ]
  },
  {
    id: "staff-2",
    firstName: "Ганганмөрөн",
    lastName: "Мөнхдалай",
    role: "Гоо засалч",
    details: [
      "🎓 Боловсрол: Гоо засалч бакалавр (СИТИ Их сургууль), Гоо засал технологичийн мастер 1-р зэрэг.",
      "⏳ Туршлага: Салбартаа нийт 8 гаруй жил, Арома Спа салонд 2024 оноос хойш ажиллаж байна.",
      "📜 Сургалт: БНСУ-ын COSMICA 'GBTT' MONGOLIA 2026 сургалтад хамрагдсан.",
      "🏆 Шагнал: Cosmobeauty 2026 (Солонгос) үзэсгэлэнд оролцох эрхээр шагнагдсан."
    ]
  },
  {
    id: "staff-3",
    firstName: "Баасансүрэн",
    lastName: "Лхагвадорж",
    role: "Гоо засалч, Борлуулалтын менежер",
    details: [
      "⏳ Туршлага: Арома Спа салонд 2017 оноос хойш тасралтгүй 9 жил ажиллаж байна.",
      "💡 Мэргэшил: 2024 оны Сөүл хотын экспод оролцож Биеийн спа, Экзосом үйлчилгээг салондоо нэвтрүүлсэн.",
      "📜 Сургалт: COSMICA KOREA Толгойн спа (2025), БНСУ-ын 'GBTT' 2026 төгсөгч.",
      "🏆 Шагнал: Cosmobeauty 2026 (Солонгос) үзэсгэлэнд оролцох эрхээр шагнагдсан."
    ]
  },
  {
    id: "staff-4",
    firstName: "Ариунзаяа",
    lastName: "Ганхуяг",
    role: "Ахлах гоо засалч",
    details: [
      "⏳ Туршлага: 2016 оноос хойш тасралтгүй 10 жил ажиллаж байгаа Ахлах мэргэжилтэн.",
      "📈 Удирдлага: 2019–2021 онд Дорнод аймаг дахь салбарыг амжилттай удирдсан.",
      "📜 Сургалт: 2026.04.28-нд БНСУ-ын COSMICA 'GBTT' 2026 Mongolia сургалтыг төгссөн.",
      "🏆 Шагнал: Cosmobeauty 2026 (Солонгос) үзэсгэлэнд оролцох эрхээр шагнагдсан."
    ]
  },
  {
    id: "staff-5",
    firstName: "Чимэдням",
    lastName: "Чинбаатар",
    role: "Гоо сайханч, Бариа засалч",
    details: [
      "🎓 Боловсрол: Булган аймгийн МСҮТ-ийг Гоо сайханч мэргэжлээр төгссөн (2017-2019).",
      "⏳ Туршлага: 2020 оноос хойш гоо сайханч, бариа засалчаар тасралтгүй 4+ жил ажиллаж байна.",
      "📜 Сургалт: 2026.04.28-нд БНСУ-ын COSMICA 'GBTT' 2026 Mongolia сургалтад амжилттай суралцсан."
    ]
  }
];

export default function StaffPage() {
  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-6xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary">Манай баг хамт олон</h1>
      
      <div className="flex flex-col gap-10 w-full max-w-4xl">
        {staffList.map((staff) => (
          <div 
            key={staff.id} 
            className="border border-border bg-card text-card-foreground rounded-lg p-6 md:p-8 shadow-sm flex flex-col"
          >
            {/* Top Section: Name & Role */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="w-24 h-24 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-muted-foreground text-sm shadow-inner overflow-hidden">
                 {/* Fallback avatar until you add real photos */}
                <span className="text-4xl">👩‍⚕️</span>
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-primary">{staff.firstName} {staff.lastName}</h2>
                <p className="text-foreground font-medium text-lg mt-1">{staff.role}</p>
              </div>
            </div>

            {/* Bottom Section: Full History & Details */}
            <div>
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">
                Боловсрол & Туршлага
              </h3>
              
              <ul className="space-y-3">
                {staff.details.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}