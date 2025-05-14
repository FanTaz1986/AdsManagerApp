require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Ad = require('./models/adModel');

const householdItems = [
  { title: "Šaldytuvas", description: "Puikiai veikiantis šaldytuvas, energijos klasė A+.", price: 120 },
  { title: "Skalbimo mašina", description: "Automatinė skalbimo mašina, talpa 7kg.", price: 90 },
  { title: "Arbatinukas", description: "Elektrinis arbatinukas, 1.7L.", price: 15 },
  { title: "Mikrobangų krosnelė", description: "Mažai naudota mikrobangų krosnelė.", price: 35 },
  { title: "Virtuvinis stalas", description: "Medinis virtuvinis stalas, 4 vietos.", price: 60 },
  { title: "Kėdė", description: "Patogi kėdė su paminkštinimu.", price: 18 },
  { title: "Dulkių siurblys", description: "Galingas dulkių siurblys, su priedais.", price: 45 },
  { title: "Lygintuvas", description: "Garų lygintuvas, mažai naudotas.", price: 20 },
  { title: "Indaplovė", description: "Talpi indaplovė, veikia puikiai.", price: 110 },
  { title: "Stalinė lempa", description: "Reguliuojama stalinė lempa.", price: 10 },
  { title: "Sofa-lova", description: "Išskleidžiama sofa-lova, tamsiai pilka.", price: 150 },
  { title: "Spinta", description: "Dviejų durų spinta su lentynomis.", price: 80 },
  { title: "Veidrodis", description: "Didelis sieninis veidrodis.", price: 25 },
  { title: "Virtuvės kombainas", description: "Daugiafunkcis virtuvės kombainas.", price: 55 },
  { title: "Virdulys", description: "Nerūdijančio plieno virdulys.", price: 12 },
  { title: "Kavos aparatas", description: "Automatinis kavos aparatas.", price: 70 },
  { title: "Televizorius", description: "LED televizorius, 32 colių.", price: 130 },
  { title: "Elektrinė viryklė", description: "Keturių kaitviečių elektrinė viryklė.", price: 95 },
  { title: "Šviestuvas", description: "Lubinis šviestuvas, modernus dizainas.", price: 22 },
  { title: "Kilimėlis", description: "Didelis svetainės kilimėlis.", price: 28 }
];

async function seedAds() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove all existing ads
  await Ad.deleteMany({});

  // Get all users except admin
  const users = await User.find({ isAdmin: false });

  let itemIndex = 0;
  const ads = [];

  for (const user of users) {
    // Each user gets 2-5 ads
    const adCount = Math.floor(Math.random() * 4) + 2; // 2 to 5
    for (let i = 0; i < adCount; i++) {
      // Cycle through householdItems, wrap if needed
      const item = householdItems[itemIndex % householdItems.length];
      ads.push({
        title: item.title,
        description: item.description,
        price: item.price,
        user: user._id
      });
      itemIndex++;
    }
  }

  await Ad.insertMany(ads);
  console.log(`Seeded ${ads.length} ads for ${users.length} users!`);
  mongoose.disconnect();
}

seedAds();