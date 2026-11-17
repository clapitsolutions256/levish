export type BlogSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  updated?: string;
  image: string;
  imageAlt: string;
  category: string;
  intro: string[];
  sections: BlogSection[];
  /** Products the post talks about, shown under it while they are in the shop. */
  products: string[];
};

// Covers are real product photos from the shop's own image bucket.
const photo = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fvpukvbdvtfqlnvlijqa.supabase.co"}/storage/v1/object/public/levish-images/${path}`;

export const blogs: BlogPost[] = [
  {
    slug: "how-to-measure-your-bra-size-at-home",
    title: "How to measure your bra size at home",
    excerpt:
      "Two measurements and a soft tape are all you need. Here is how to find your band and cup size, and what to do when you are between sizes.",
    date: "2026-11-17",
    image: photo("85cdd3c5-80c3-40fd-86c1-53dca54e5779.webp"),
    imageAlt: "Seamless push-up bra in skin colour, worn",
    category: "Bra guide",
    intro: [
      "Most women in Pakistan buy bras by guessing, or by repeating the size they bought years ago. Bodies change with weight, pregnancy and age, so the size that fitted once may not fit now. A bra in the wrong size is the main reason straps dig in, the band rides up the back, or the cups gap.",
      "You can measure yourself at home in five minutes. All you need is a soft measuring tape (the kind a tailor uses), a mirror, and an unpadded bra or no bra at all.",
    ],
    sections: [
      {
        heading: "Step 1: Measure your band (underbust)",
        paragraphs: [
          "Stand straight and wrap the tape around your ribcage, just under your bust, where the bra band sits. Keep the tape level all the way round; check in the mirror that it has not dropped at the back. Pull it snug, but you should still be able to breathe normally.",
          "Read the number in inches and round it to the nearest whole number. If it is an odd number, round up to the next even number. That is your band size. For example, 31 inches becomes a 32 band, and 34 inches stays 34.",
        ],
      },
      {
        heading: "Step 2: Measure your bust",
        paragraphs: [
          "Now wrap the tape around the fullest part of your bust, usually across the nipples. Keep it level and loose enough that it does not press the bust flat. Write this number down too.",
        ],
      },
      {
        heading: "Step 3: Work out your cup",
        paragraphs: [
          "Take the band size away from the bust measurement. Each inch of difference is one cup size:",
        ],
        points: [
          "1 inch: A cup",
          "2 inches: B cup",
          "3 inches: C cup",
          "4 inches: D cup",
          "5 inches: DD (sometimes written E)",
        ],
      },
      {
        heading: "An example",
        paragraphs: [
          "Your underbust is 33 inches, so your band is 34. Your bust is 37 inches. 37 minus 34 is 3, so you are a 34C.",
        ],
      },
      {
        heading: "How a bra should fit",
        paragraphs: [
          "Measurements are a starting point. When you try a bra on, check these things:",
        ],
        points: [
          "The band sits level all the way round and does not ride up your back. Most of the support comes from the band, not the straps.",
          "You can fit two fingers under the band, no more.",
          "The cups are smooth, with no gaps at the top and no spilling over the edge.",
          "The straps stay on your shoulders without digging in. If you need to tighten them hard, the band is probably too loose.",
          "A new bra should fit well on the loosest hook. As the band stretches with wear, move to the tighter hooks.",
        ],
      },
      {
        heading: "Between sizes? Try a sister size",
        paragraphs: [
          "Sister sizes have the same cup volume on a different band. If the cups fit but the band is too tight, go one band up and one cup down: a 34C becomes a 36B. If the band is too loose, go one band down and one cup up: a 34C becomes a 32D.",
          "Stretchy, seamless and wireless bras are more forgiving than wired ones, so they are a good choice if you are between sizes or your size changes during the month.",
        ],
      },
      {
        heading: "Ordering from Levish",
        paragraphs: [
          "Our Seamless Push-Up Bra comes in band sizes 32 to 52, and each product page shows the sizes in stock for every colour. If you are not sure which size to pick, send us your two measurements on WhatsApp and we will tell you which size to order.",
        ],
      },
    ],
    products: [
      "seamless-crisscross-back-push-up-bra-comfortable-breathable",
      "seamless-wireless-bra-soft-comfort-bra",
      "premium-front-open-bra-for-women-full-coverage-everyday",
      "seamless-padded-wireless-bra-soft-stretchable",
    ],
  },
  {
    slug: "push-up-wireless-or-tube-bra-which-to-wear",
    title: "Push-up, wireless or tube bra: which one to wear when",
    excerpt:
      "A quick guide to the main bra styles, what each one is good for, and which outfits they go under.",
    date: "2026-11-17",
    image: photo("bffdfd6a-f8ed-422f-8e2f-48d89182a05c.webp"),
    imageAlt: "Black seamless push-up bra, worn",
    category: "Bra guide",
    intro: [
      "One bra cannot do every job. A bra that looks perfect under a fitted kurti may show under a sleeveless top, and the one you love for lounging at home will not hold you in place at the gym. Here are the styles we sell and when each one works best.",
    ],
    sections: [
      {
        heading: "Push-up bra",
        paragraphs: [
          "A push-up bra has padding at the lower and outer part of the cup, which lifts the bust and brings it closer together. It gives a fuller, rounder shape under fitted clothes and party wear.",
          "Our Seamless Push-Up Bra adds a criss-cross back that pulls the shoulders back gently, so it also helps with posture during a long day. The Butterfly Push-Up Bra has a front closure and lace detail, so it is easy to put on and looks pretty under a sheer top.",
        ],
        points: [
          "Best for: fitted shirts, party wear, dresses, days you want more shape.",
          "Skip it for: sleeping, exercise, or very hot days if you prefer something lighter.",
        ],
      },
      {
        heading: "Wireless bra",
        paragraphs: [
          "A wireless bra has no metal underwire. The support comes from the band and the fabric, so there is nothing pressing under the bust. Seamless wireless bras are knitted in one piece, which means no lines show through thin fabric.",
          "This is the bra most women end up wearing every day: to work, for errands, for long travel. If you have been told underwires hurt, start here.",
        ],
        points: [
          "Best for: everyday wear, long hours, working from home, after pregnancy.",
          "Skip it for: if you want strong lift for a fitted outfit, choose a push-up instead.",
        ],
      },
      {
        heading: "Tube bra and strapless bra",
        paragraphs: [
          "A tube bra is a stretchy band with light padding and no straps. It is made for off-shoulder tops, halter necks, backless blouses and lehengas with open backs. A multiway strapless bra comes with straps you can attach in different ways (regular, crossed, halter or one shoulder), so one bra covers many necklines.",
        ],
        points: [
          "Best for: off-shoulder and backless outfits, wedding wear.",
          "Tip: choose a snug band. A strapless bra stays up because of the band, so a loose one will slip.",
        ],
      },
      {
        heading: "Front open bra",
        paragraphs: [
          "Front open bras fasten with hooks or buttons at the front instead of the back. They are easy to put on if you have shoulder stiffness, and many mothers prefer them while feeding. Our Premium Front Open Bra also has full coverage cups for everyday comfort.",
        ],
      },
      {
        heading: "Sports bra",
        paragraphs: [
          "A sports bra holds the bust close to the body so it moves less while you walk fast, run or train. It should feel firmer than your everyday bra. Racerback styles keep the straps from sliding off during exercise.",
        ],
      },
      {
        heading: "A simple starter set",
        paragraphs: [
          "If you are building your drawer from scratch, start with two everyday wireless bras in skin and black, one push-up for going out, and one strapless or tube bra for special outfits. Skin tone (nude) is the colour that disappears under white and light fabrics, not white.",
        ],
      },
    ],
    products: [
      "seamless-crisscross-back-push-up-bra-comfortable-breathable",
      "butterfly-push-up-bra-beauty-meets-comfortable",
      "seamless-wireless-bra-soft-comfort-bra",
      "women-s-seamless-tube-bra",
      "womens-strapless-multiway-seam",
      "premium-front-open-bra-for-women-full-coverage-everyday",
    ],
  },
  {
    slug: "how-to-wash-and-care-for-your-bras",
    title: "How to wash and care for your bras so they last",
    excerpt:
      "Hot water, the dryer and a crowded washing machine are what ruin bras. A few small habits keep them soft and supportive for much longer.",
    date: "2026-11-17",
    image: photo("loomlace/53211944517915.webp"),
    imageAlt: "Ivory lace wireless bra",
    category: "Care",
    intro: [
      "A good bra is made of stretchy fibres that slowly lose their spring with heat and friction. Washed the right way, it keeps its shape for many months. Washed with jeans in hot water, it can be stretched out in a few weeks.",
    ],
    sections: [
      {
        heading: "How often to wash",
        paragraphs: [
          "Wash a bra after two or three wears in normal weather, and after every wear in summer or after exercise. Sweat and body oil break down the elastic if they sit in the fabric for days. Rotating between at least three bras gives each one a rest, which also helps the elastic recover.",
        ],
      },
      {
        heading: "Hand washing (the best way)",
        points: [
          "Fill a bucket or basin with cool or lukewarm water. Never hot.",
          "Add a small amount of mild liquid detergent or a gentle soap. Avoid bleach.",
          "Soak for 10 to 15 minutes, then press the fabric gently with your hands. Do not twist or rub hard.",
          "Rinse in clean cool water until no soap is left.",
          "Press out the water between two towels. Do not wring.",
        ],
        paragraphs: [],
      },
      {
        heading: "If you use a washing machine",
        paragraphs: [
          "Close all the hooks first so they do not catch on other clothes. Put the bra in a mesh laundry bag, choose the delicate or wool cycle with cold water, and wash it with other light clothes, never with jeans or towels. Take it out as soon as the cycle ends.",
        ],
      },
      {
        heading: "Drying",
        paragraphs: [
          "Air dry flat or hang the bra from the middle (the centre between the cups), not from the straps, because wet straps stretch under the weight. Keep it out of strong direct sun, which fades colours and dries out the elastic. Never use a tumble dryer or an iron.",
        ],
      },
      {
        heading: "Storing padded and push-up bras",
        paragraphs: [
          "Store moulded and padded bras with the cups open, one cup tucked behind the next. Folding one cup into the other dents the padding and leaves a crease that shows under clothes.",
        ],
      },
      {
        heading: "When to replace a bra",
        paragraphs: [
          "Replace a bra when the band no longer fits on the tightest hook, the band rides up even after you adjust it, or the fabric has gone thin or bobbly. With good care, an everyday bra worn in rotation usually lasts six months to a year.",
        ],
      },
    ],
    products: [
      "black-lace-wireless-bra-for-grils-elegant-everyday-comfort",
      "women-s-nylon-padded-bra-thong-panty-set-love-secret",
      "seamless-wireless-bra-soft-comfort-bra",
    ],
  },
  {
    slug: "period-panties-how-they-work",
    title: "Period panties: how they work and how to use them",
    excerpt:
      "Leak-proof period panties can replace a pad on light days or back one up on heavy days. Here is how they work, how long to wear them and how to wash them.",
    date: "2026-11-17",
    image: photo("product-refresh-20261116/products/period-panty/beige-front.jpg"),
    imageAlt: "Beige period panty, front",
    category: "Women's health",
    intro: [
      "Period panties look like normal underwear, but they have extra layers sewn into the gusset (the part between the legs) that soak up and hold blood. Many women use them to sleep without worrying about stains, or to feel safer on the first heavy days of their period.",
    ],
    sections: [
      {
        heading: "How they work",
        paragraphs: [
          "Most period panties have three layers in the gusset: a soft top layer that pulls moisture away from the skin, an absorbent middle layer that holds the fluid, and a leak-proof bottom layer that stops it from coming through to your clothes. The rest of the panty is regular stretchy fabric, so it feels like normal underwear.",
        ],
      },
      {
        heading: "Who they are good for",
        points: [
          "Light days at the start and end of your period, worn on their own.",
          "Heavy days and nights, worn as a backup with a pad.",
          "Light bladder leaks, discharge, and days you are expecting your period but are not sure when it will start.",
          "Girls who have just started their periods and worry about leaking at school.",
        ],
        paragraphs: [],
      },
      {
        heading: "How long you can wear them",
        paragraphs: [
          "This depends on your flow. On light days, one pair can be worn for most of the day. On heavier days, change every few hours or use a pad as well, the same way you would change a pad. If the panty feels damp or heavy, it is time to change.",
        ],
      },
      {
        heading: "How to wash them",
        points: [
          "Rinse in cold water straight after taking them off, until the water runs clear. Hot water sets blood stains.",
          "Wash by hand or in a mesh bag on a gentle cold cycle with mild detergent.",
          "Do not use fabric softener or bleach. Softener coats the absorbent layer and stops it from working.",
          "Air dry. Do not iron or tumble dry.",
        ],
        paragraphs: [],
      },
      {
        heading: "How many pairs you need",
        paragraphs: [
          "If you want to use them for your whole period, three to five pairs lets you wear one while the others wash and dry. If you only want them for nights, two pairs is enough to start.",
        ],
      },
    ],
    products: ["period-panty"],
  },
  {
    slug: "what-to-wear-to-the-gym-women",
    title: "What to wear to the gym: a simple guide for women",
    excerpt:
      "A supportive sports bra, high-waist shorts or leggings, and fabric that dries fast. That is most of what you need to train comfortably.",
    date: "2026-11-17",
    image: photo("product-refresh-20261116/products/gym-suit/lavender-front.jpg"),
    imageAlt: "Lavender gym suit with sports bra and shorts",
    category: "Activewear",
    intro: [
      "You do not need a lot of gym clothes, but the ones you have should stay in place. If you are pulling your top down after every squat or adjusting your waistband on the treadmill, the clothes are taking your attention away from the workout.",
    ],
    sections: [
      {
        heading: "Start with the sports bra",
        paragraphs: [
          "The sports bra is the most important piece. It should feel firm when you first put it on and keep the bust from bouncing when you jump or run. Wide straps and a racerback spread the weight across your shoulders. For walking and yoga, a light seamless sports bra is enough; for running and jumping, choose a firmer one.",
        ],
      },
      {
        heading: "High-waist bottoms that stay put",
        paragraphs: [
          "High-waist shorts and leggings sit above the hip bones, so they do not roll down when you bend. Do a deep squat in the trial room or at home: if you can see through the fabric or the waist slips, it is not the right pair.",
        ],
      },
      {
        heading: "Choose fabric that dries quickly",
        paragraphs: [
          "Stretchy synthetic fabrics like nylon and spandex blends pull sweat away from the skin and dry fast. Cotton soaks up sweat and stays wet and heavy, which is fine for a slow walk but uncomfortable for a hard session.",
        ],
      },
      {
        heading: "Why a matching set helps",
        paragraphs: [
          "A matching set (a sports bra and shorts made to be worn together) takes the thinking out of getting dressed. Our Gym Suit comes in eight colours, from lavender and pink to black and navy, so you can keep one in your bag and one in the wash.",
        ],
      },
      {
        heading: "Looking after gym wear",
        points: [
          "Wash after every session. Sweat left in the fabric causes smell and breaks down the stretch.",
          "Turn the pieces inside out and wash in cold water.",
          "Skip fabric softener; it traps smell in synthetic fabric.",
          "Hang to dry out of direct sun.",
        ],
        paragraphs: [],
      },
    ],
    products: ["gym-suit", "women-s-seamless-sports-bra"],
  },
  {
    slug: "body-shapers-and-waist-trainers-guide",
    title: "Body shapers and waist trainers: how to choose and wear them comfortably",
    excerpt:
      "Shapewear smooths your shape under fitted clothes. Here is the difference between a body shaper, a waist trainer and a postpartum binder, and how to wear each one safely.",
    date: "2026-11-17",
    image: photo("loomlace/53351731200283.webp"),
    imageAlt: "Black high-waist body shaper, worn",
    category: "Shapewear",
    intro: [
      "Shapewear does not change your body, but it does change how clothes sit on it. Under a fitted kurti, a saree blouse or a bodycon dress, a good shaper smooths the tummy and hips so the fabric falls cleanly. Here is how to pick the right type and wear it comfortably.",
    ],
    sections: [
      {
        heading: "High-waist body shaper",
        paragraphs: [
          "A high-waist shaper is a pair of shorts that comes up to just under the bust. It smooths the tummy, waist, hips and thighs in one piece, and stops thighs from rubbing in summer. It is the most comfortable type to wear for a whole event.",
        ],
      },
      {
        heading: "Waist trainer belt",
        paragraphs: [
          "A waist trainer is a firm band with hooks that wraps around the middle. It pulls the waist in more strongly than a body shaper. Use it for a few hours at a time, not all day, and close it on the looser hooks first.",
        ],
      },
      {
        heading: "Postpartum binder",
        paragraphs: [
          "An abdominal binder is an adjustable wrap many women wear after delivery to support the tummy and lower back while they move around. If you have had a C-section or any complication, ask your doctor when it is safe to start wearing one and how tight it should be.",
        ],
      },
      {
        heading: "Getting the size right",
        paragraphs: [
          "Measure your waist at its narrowest point and choose the size that matches. Do not size down to look slimmer: shapewear that is too small rolls at the edges, digs in, and is the reason most people stop wearing it.",
        ],
      },
      {
        heading: "Wear it safely",
        points: [
          "You should be able to breathe deeply, sit and eat comfortably.",
          "Take it off if you feel numbness, tingling, heartburn or pain.",
          "Do not sleep in a waist trainer.",
          "Give your body breaks; wear firm shapewear for an event or a working day, not every hour of every day.",
        ],
        paragraphs: [],
      },
    ],
    products: [
      "premium-high-waist-tummy-control-body-shaper",
      "women-s-waist-trainer-belly-shaper",
      "womens-adjustable-postpartum-abdominal-b",
    ],
  },
  {
    slug: "co-ord-sets-and-bodysuits-easy-outfits",
    title: "Co-ord sets and bodysuits: easy outfits that always look put together",
    excerpt:
      "A co-ord set is a whole outfit in one purchase, and a bodysuit is the neatest top you can tuck in. Here is how to wear both.",
    date: "2026-11-17",
    image: photo("cfe31bc4-3d60-482c-9991-d4d9213a3894.webp"),
    imageAlt: "Cream crop tank and mini skirt co-ord set",
    category: "Style",
    intro: [
      "Some days you want to look dressed without thinking about it. Co-ord sets and bodysuits are made for those days: one gives you a matching outfit, the other gives you a top that stays smooth and tucked from morning to night.",
    ],
    sections: [
      {
        heading: "Why co-ord sets work",
        paragraphs: [
          "A co-ord set is a top and bottom made from the same fabric and colour. Because they match, the outfit looks planned even when it took you thirty seconds. Wear the pieces together, then split them up: the crop top goes with high-waist jeans, and the shorts or skirt go with an oversized sweatshirt.",
        ],
      },
      {
        heading: "Why a bodysuit is better than a tucked top",
        paragraphs: [
          "A bodysuit fastens under the body, so it never comes untucked and leaves no bunching at the waist. That makes it the neatest top for high-waist trousers and jeans. A short-sleeve black bodysuit and a cream strappy one cover most outfits between them.",
        ],
      },
      {
        heading: "Easy outfits to start with",
        points: [
          "Black bodysuit, wide-leg jeans and a hoodie on top for a cool evening.",
          "Cream co-ord set on its own for a day out, with flat sandals.",
          "Crop top from a set with relaxed trousers for a casual look.",
          "Strappy bodysuit under an open shirt or jacket.",
        ],
        paragraphs: [],
      },
      {
        heading: "Choosing your size",
        paragraphs: [
          "Sets and bodysuits are fitted, so check the size chart on the product page. If you are between sizes and prefer comfort over a close fit, choose the larger size.",
        ],
      },
    ],
    products: [
      "cream-crop-tank-and-mini-skirt-co-ord-set",
      "black-cross-wrap-crop-top-and-shorts-co-ord-set",
      "06-studio-crop-tank-and-shorts-co-ord-set",
      "black-short-sleeve-bodysuit",
      "cream-strappy-bodysuit",
    ],
  },
  {
    slug: "how-to-style-an-oversized-sweatshirt",
    title: "How to style an oversized sweatshirt",
    excerpt:
      "An oversized sweatshirt is the easiest winter top there is. Here is how to pick the size, what to wear it with, and how to keep it soft.",
    date: "2026-11-17",
    image: photo("elvevier/0fe406c2-87a8-4842-8c84-47864aa2aac9.jpg"),
    imageAlt: "Dark green Croppsy oversized sweatshirt worn with white trousers",
    category: "Sweatshirts",
    intro: [
      "When Lahore mornings turn cold, an oversized sweatshirt is the top most of us reach for first. It is warm without being bulky, it hides a long day of sitting, and it looks relaxed rather than sloppy when the rest of the outfit is chosen with a little care.",
    ],
    sections: [
      {
        heading: "Getting the oversized fit right",
        paragraphs: [
          "An oversized sweatshirt is cut wider through the body and shoulders on purpose, so take your usual size. Going up a size makes the sleeves cover your hands and the hem fall too low, which is when it starts to look borrowed. The shoulder seam should sit a little below your shoulder, and the hem should end around the hip.",
        ],
      },
      {
        heading: "Balance a loose top with a clean bottom",
        paragraphs: [
          "Because the top is roomy, keep the bottom tidy: straight trousers, wide-leg jeans with a defined waist, or leggings. A front tuck (tucking just the middle of the hem into the waistband) shows your waist and makes the whole outfit look more put together.",
        ],
      },
      {
        heading: "Outfits to try",
        points: [
          "Dark green sweatshirt with white straight trousers and white trainers, the look in the photo above.",
          "White sweatshirt with wide-leg vintage-wash jeans.",
          "Brown sweatshirt with matching brown or cream trousers for an easy tonal outfit.",
          "Any of them over a long kurti-length shirt, with the collar showing at the neck.",
        ],
        paragraphs: [],
      },
      {
        heading: "Colours that go with everything",
        paragraphs: [
          "Dark green, brown and white are the three we keep coming back to. Green and brown hide marks and look rich in winter light; white looks fresh with blue denim. If you want one sweatshirt for the season, choose the colour that matches the trousers you already wear most.",
        ],
      },
      {
        heading: "Keeping it soft",
        points: [
          "Turn it inside out before washing so the print does not crack.",
          "Wash in cold or lukewarm water with similar colours.",
          "Dry flat or over a line, not in direct strong sun, so the colour stays deep.",
          "Do not iron directly on the print.",
        ],
        paragraphs: [],
      },
    ],
    products: [
      "dark-green-croppsy-sweatshirt",
      "white-croppsy-sweatshirt",
      "brown-croppsy-sweatshirt",
      "trouser-croppsy-white",
    ],
  },
  {
    slug: "hoodies-that-still-look-dressed",
    title: "Hoodies that still look dressed",
    excerpt: "A soft hoodie can leave the house. Pair it with a clean trouser or wide-leg jeans and it stops feeling like loungewear.",
    date: "2026-09-18",
    updated: "2026-11-17",
    image: photo("4595f283-3f72-4398-8eba-1181aa3ff50a.jpg"),
    imageAlt: "White Croppsy zip hoodie worn with wide-leg jeans",
    category: "Hoodies",
    intro: [
      "A hoodie is the most comfortable thing in the wardrobe, which is why it so often gets saved for home. With the right bottoms and a little thought about colour, it works for a coffee, a university day or a winter evening out.",
    ],
    sections: [
      {
        heading: "Pair soft with structured",
        paragraphs: [
          "Wear a hoodie with something that has shape: straight trousers, wide-leg jeans or a pleated skirt. The contrast is what makes it look chosen. A hoodie with matching joggers says lounge; a hoodie with wide-leg denim says weekend.",
        ],
      },
      {
        heading: "Keep the colours quiet",
        paragraphs: [
          "Cream, white, black and forest green hoodies go with almost everything. Keep the rest of the outfit to one or two colours, so the hoodie stays the softest thing in the picture. A white zip hoodie over a white tee with blue jeans is a whole outfit.",
        ],
      },
      {
        heading: "Zip or pullover",
        paragraphs: [
          "A zip hoodie works as a light jacket you can open over a bodysuit or a tee. A pullover is warmer and looks neater on its own. If you can only have one, the zip version is the more flexible.",
        ],
      },
    ],
    products: ["white-hoddie-croppsy", "white-croppsy-sweatshirt", "dark-green-croppsy-sweatshirt", "brown-croppsy-sweatshirt"],
  },
  {
    slug: "trousers-for-an-easy-week",
    title: "Trousers for an easy week",
    excerpt: "A relaxed straight leg, a colour you can repeat, and a waist that stays comfortable all day. That is the whole formula.",
    date: "2026-09-12",
    updated: "2026-11-17",
    image: photo("elvevier/c545beef-441f-4241-ba7f-b74152747a6b.jpg"),
    imageAlt: "Dark green Croppsy trousers worn with a white tank top",
    category: "Trousers",
    intro: [
      "A good pair of trousers should disappear into the week. Relaxed, straight-leg trousers in a handful of colours cover almost every plan, from a slow morning to dinner with friends.",
    ],
    sections: [
      {
        heading: "Pick the shape first",
        paragraphs: [
          "Straight and wide legs sit better under a sweatshirt, hoodie or short top than skinny cuts do, and they are cooler in warm weather. A drawstring or soft waistband keeps them comfortable for long days of sitting.",
        ],
      },
      {
        heading: "Then pick colours you will repeat",
        paragraphs: [
          "White, navy, black and dark green go with nearly every top you own. Start with one neutral you will actually wear twice a week. White is the freshest with a dark top; navy and black are the easiest with everything.",
        ],
      },
      {
        heading: "Three easy outfits",
        points: [
          "Dark green trousers, white tank top and a white zip hoodie.",
          "White trousers with a brown or green oversized sweatshirt.",
          "Black relaxed trousers with a fitted bodysuit.",
        ],
        paragraphs: [],
      },
    ],
    products: [
      "trouser-croppsy-dark-green",
      "trouser-croppsy-white",
      "trouser-croppsy-navy-blue",
      "zara-lycra-interlock-relaxed-fit-trousers-black",
    ],
  },
  {
    slug: "denim-without-the-stiff-break-in",
    title: "How to wear wide-leg jeans",
    excerpt: "Wide-leg jeans are comfortable, flattering and easy to dress up or down. Here is what to wear them with and how to get the length right.",
    date: "2026-09-06",
    updated: "2026-11-17",
    image: photo("19846e1f-c3e4-4492-8249-b596b9ee90db.jpg"),
    imageAlt: "GUESS women's vintage-wash wide-leg jeans, worn",
    category: "Jeans",
    intro: [
      "Wide-leg jeans have replaced skinny jeans in most wardrobes, and for good reason: they are comfortable to sit in all day, cooler in warm weather, and they make the legs look longer when the waist sits high. Our GUESS Women's Vintage-Wash Wide-Leg Jeans are the pair in the photo.",
    ],
    sections: [
      {
        heading: "Why wide-leg jeans flatter",
        paragraphs: [
          "A high waist marks the narrowest part of your body, and the straight, wide leg falls from the hip without clinging. The result is a long, clean line from waist to floor that suits most body shapes.",
        ],
      },
      {
        heading: "What to wear on top",
        paragraphs: [
          "Because the leg is full, keep the top closer to the body or tucked in. A fitted tank top, a bodysuit or a cropped tee balances the volume. In winter, front-tuck an oversized sweatshirt or wear a short zip hoodie so the waist still shows.",
        ],
        points: [
          "White tank top and a white zip hoodie, as in the photo.",
          "Black short-sleeve bodysuit for an evening out.",
          "Oversized sweatshirt with a front tuck for cold days.",
        ],
      },
      {
        heading: "Shoes that work",
        paragraphs: [
          "Chunky trainers and flat sandals keep the look casual. For a dressier outfit, a small heel or platform lifts the hem off the floor and adds height.",
        ],
      },
      {
        heading: "Get the length right",
        paragraphs: [
          "Wide-leg jeans should just skim the floor with the shoes you wear most, so the hem does not drag or gather. If they are too long, have them hemmed with the shoes on. Wash denim inside out in cold water, and less often than you think, so the colour lasts.",
        ],
      },
    ],
    products: ["guess-women-s-vintage-wash-wide-leg-jeans", "black-short-sleeve-bodysuit", "white-hoddie-croppsy"],
  },
];

export function getBlog(slug: string) {
  return blogs.find((post) => post.slug === slug);
}

/** The three posts the home page shows: a bra guide, women's jeans and sweatshirts. */
export const HOME_POSTS = ["how-to-measure-your-bra-size-at-home", "denim-without-the-stiff-break-in", "how-to-style-an-oversized-sweatshirt"];

/** Every word a post contains, for reading time and structured data. */
export function blogWordCount(post: BlogPost) {
  const text = [...post.intro, ...post.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.points ?? [])])].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function headingId(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function formatBlogDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
