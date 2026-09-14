export interface CropInfo {
  id: string
  name: string
  localNames: { ig?: string; ha?: string; yo?: string }
  emoji: string
  stages: GrowthStage[]
  optimalTemp: [number, number]
  optimalHumidity: [number, number]
  daysToHarvest: number
  yieldPerSqM: number
  description: string
  tips: string[]
  commonPests: string[]
  watering: WateringSchedule
}

export interface WateringSchedule {
  frequencyDays: number          // water every N days
  litresPerSqM: number           // water volume per session
  method: string                 // drip / furrow / sprinkler
  notes: string
  bottleDripTip?: string         // zero-cost bottle drip instruction
}

export interface GrowthStage {
  index: number
  name: string
  daysFromPlanting: number
  description: string
  tasks: string[]
}

export const CROPS: CropInfo[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    localNames: { ig: 'Tomati', ha: 'Tumatir', yo: 'Tomati' },
    emoji: '🍅',
    daysToHarvest: 75,
    yieldPerSqM: 8,
    optimalTemp: [21, 27],
    optimalHumidity: [65, 75],
    description: 'High-value crop well suited to Nigerian greenhouse conditions. Thrives with consistent moisture and temperatures.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 3,
      method: 'drip',
      notes: 'Water at base, never on leaves. Consistent moisture prevents blossom-end rot.',
      bottleDripTip: 'Puncture 3 small holes in 1.5L bottle cap, fill and invert near root zone. Refill every 2 days.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Seed sprouting phase', tasks: ['Maintain 25°C soil temp', 'Keep media moist', 'Ensure 70% humidity'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 10, description: 'First true leaves emerge', tasks: ['Thin to one plant per cell', 'Begin dilute fertilizer', 'Introduce ventilation'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 21, description: 'Rapid leaf and stem growth', tasks: ['Stake plants', 'Side-dress with NPK', 'Monitor for whitefly'] },
      { index: 3, name: 'Flowering', daysFromPlanting: 45, description: 'Flower clusters appear', tasks: ['Shake plants for pollination', 'Reduce nitrogen', 'Increase potassium'] },
      { index: 4, name: 'Fruiting', daysFromPlanting: 55, description: 'Green fruits developing', tasks: ['Remove suckers', 'Maintain consistent watering', 'Watch for blight'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 75, description: 'Fruits ripen to red/orange', tasks: ['Harvest every 2-3 days', 'Handle gently', 'Store at 12-15°C'] },
    ],
    tips: ['Avoid overhead irrigation to prevent fungal disease', 'Pinch suckers weekly for indeterminate varieties', 'Use calcium spray to prevent blossom-end rot'],
    commonPests: ['Whitefly', 'Tomato hornworm', 'Early blight', 'Fusarium wilt'],
  },
  {
    id: 'pepper',
    name: 'Bell Pepper',
    localNames: { ig: 'Ose Oyibo', ha: 'Tattasai', yo: 'Ata Rodo' },
    emoji: '🫑',
    daysToHarvest: 85,
    yieldPerSqM: 6,
    optimalTemp: [20, 26],
    optimalHumidity: [60, 70],
    description: 'Lucrative crop for urban markets. Greenhouse cultivation extends growing season and protects from rain damage.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2.5,
      method: 'drip',
      notes: 'Peppers are drought-sensitive at flowering. Never let soil dry out completely.',
      bottleDripTip: 'Use 0.5L bottles with 2 pin-holes in cap, one bottle per plant. Replace daily in hot harmattan.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Seed sprouting', tasks: ['Soak seeds 8h before planting', 'Keep at 28°C', 'Cover with plastic'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 14, description: 'Cotyledons open', tasks: ['Move to brighter location', 'Water from below', 'Harden off gradually'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 28, description: 'Branching begins', tasks: ['Transplant to final container', 'Begin weekly feeding', 'Install support cages'] },
      { index: 3, name: 'Budding', daysFromPlanting: 50, description: 'Flower buds form', tasks: ['Increase phosphorus', 'Check pH 6.0-6.5', 'Ventilate well'] },
      { index: 4, name: 'Flowering', daysFromPlanting: 60, description: 'White flowers open', tasks: ['Vibrate stems for pollination', 'Avoid temperature spikes', 'Watch for aphids'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 85, description: 'Fruits reach full size', tasks: ['Harvest green or wait for color', 'Cut with scissors', 'Refrigerate quickly'] },
    ],
    tips: ['Consistent watering prevents blossom drop', 'Night temps below 15°C cause poor fruit set', 'Mulch containers to retain moisture'],
    commonPests: ['Aphids', 'Spider mites', 'Bacterial spot', 'Anthracnose'],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    localNames: { ig: 'Cucumber', ha: 'Kokwamba', yo: 'Kukumba' },
    emoji: '🥒',
    daysToHarvest: 55,
    yieldPerSqM: 12,
    optimalTemp: [24, 30],
    optimalHumidity: [70, 80],
    description: 'Fast-growing, high-yield crop. Excellent for greenhouse because it loves heat and humidity found inside.',
    watering: {
      frequencyDays: 1,
      litresPerSqM: 4,
      method: 'drip',
      notes: 'Cucumbers are thirsty — daily watering required in greenhouse heat. Mulch to retain moisture.',
      bottleDripTip: 'Use 2L bottles with 4 holes in cap, placed at root zone. Cucumbers need bottles refilled daily.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Rapid sprouting', tasks: ['Plant 2cm deep', 'Keep at 28°C', 'Germinates in 3-5 days'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 7, description: 'First leaves appear', tasks: ['Provide 16h light', 'Do not overwater', 'Start training on string'] },
      { index: 2, name: 'Vine Growth', daysFromPlanting: 14, description: 'Rapid climbing growth', tasks: ['Guide vine upward daily', 'Feed with high-N fertilizer', 'Remove side shoots below 50cm'] },
      { index: 3, name: 'Flowering', daysFromPlanting: 30, description: 'Male then female flowers', tasks: ['Ensure good air flow', 'Introduce pollinators or hand-pollinate', 'Monitor for downy mildew'] },
      { index: 4, name: 'Fruiting', daysFromPlanting: 40, description: 'Cucumbers size rapidly', tasks: ['Harvest every 2 days', 'Remove curved/yellowing fruit', 'Increase potassium feed'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 55, description: 'Fruits at peak quality', tasks: ['Pick at 15-20cm length', 'Handle carefully', 'Keep cool after harvest'] },
    ],
    tips: ['Never let fruits over-mature — stops plant producing', 'Parthenocarpic varieties need no pollination', 'Train vertically to maximize space'],
    commonPests: ['Downy mildew', 'Powdery mildew', 'Cucumber mosaic virus', 'Thrips'],
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    localNames: { ig: 'Lettisi', ha: 'Salati', yo: 'Letusi' },
    emoji: '🥬',
    daysToHarvest: 45,
    yieldPerSqM: 4,
    optimalTemp: [15, 22],
    optimalHumidity: [60, 70],
    description: 'Quick-turnaround leafy green. Perfect for cooler northern Nigerian highlands or dry-season greenhouse production.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2,
      method: 'furrow',
      notes: 'Lettuce has shallow roots — light, frequent watering is better than deep, infrequent watering.',
      bottleDripTip: 'Punch 2 tiny holes in bottle cap, lay bottle on its side near root zone for slow seep.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Tiny sprouts emerge', tasks: ['Surface sow, do not cover', 'Keep at 18-20°C', 'Mist twice daily'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 7, description: 'True leaves visible', tasks: ['Thin to 2cm spacing', 'Begin half-strength nutrient', 'Protect from direct midday sun'] },
      { index: 2, name: 'Juvenile', daysFromPlanting: 21, description: 'Rosette forming', tasks: ['Final spacing 25cm apart', 'Full nutrient solution', 'Check for tip burn'] },
      { index: 3, name: 'Heading', daysFromPlanting: 35, description: 'Head compacting (if heading type)', tasks: ['Reduce nitrogen', 'Increase air circulation', 'Watch for slugs'] },
      { index: 4, name: 'Harvest', daysFromPlanting: 45, description: 'Full head or cut-and-come-again', tasks: ['Harvest in morning', 'Cut 2cm above base for regrowth', 'Wash and refrigerate immediately'] },
    ],
    tips: ['Tip burn indicates calcium deficiency — increase air flow', 'Bolt risk increases when temps exceed 25°C', 'Hydroponic NFT systems ideal for lettuce'],
    commonPests: ['Aphids', 'Slugs', 'Botrytis', 'Downy mildew'],
  },
  {
    id: 'spinach',
    name: 'Spinach',
    localNames: { ig: 'Alayyahu', ha: 'Alayafi', yo: 'Ẹfọ Tètè' },
    emoji: '🌿',
    daysToHarvest: 40,
    yieldPerSqM: 3,
    optimalTemp: [15, 20],
    optimalHumidity: [55, 65],
    description: 'Nutritious and fast-growing. High demand in Nigerian urban markets. Suits cooler greenhouse sections.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 1.5,
      method: 'furrow',
      notes: 'Keep evenly moist. Avoid waterlogging which causes root rot in spinach.',
      bottleDripTip: 'Small 35cl bottles with 1 pinhole work well — slow drip keeps spinach moist without waterlogging.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Seeds sprout', tasks: ['Sow 1cm deep', 'Keep at 18°C', 'Pre-soak seeds for better germination'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 7, description: 'First leaves open', tasks: ['Thin to 5cm', 'Keep soil moist not wet', 'Protect from heat'] },
      { index: 2, name: 'Growth', daysFromPlanting: 20, description: 'Leaves develop rapidly', tasks: ['Side-dress with nitrogen', 'Begin harvesting outer leaves', 'Monitor for downy mildew'] },
      { index: 3, name: 'Harvest', daysFromPlanting: 40, description: 'Full plant harvestable', tasks: ['Harvest outer leaves first', 'Leave growing tip for continued harvest', 'Harvest before bolting'] },
    ],
    tips: ['Bolts quickly in heat above 25°C — shade in afternoon', 'High nitrogen demand, feed weekly', 'Use successive sowings every 2 weeks for continuous supply'],
    commonPests: ['Leaf miners', 'Downy mildew', 'Aphids', 'Cercospora leaf spot'],
  },
  {
    id: 'okra',
    name: 'Okra',
    localNames: { ig: 'Okwuru', ha: 'Kubewa', yo: 'Ilá' },
    emoji: '🌱',
    daysToHarvest: 60,
    yieldPerSqM: 2,
    optimalTemp: [25, 35],
    optimalHumidity: [50, 65],
    description: 'Nigerian staple crop. Thrives in greenhouse heat. Short harvesting window — pick every 2-3 days.',
    watering: {
      frequencyDays: 3,
      litresPerSqM: 3,
      method: 'furrow',
      notes: 'Okra is drought-tolerant but yields more with consistent moisture. Reduce watering frequency in cooler months.',
      bottleDripTip: 'Use 2L bottles with 3 holes, buried 5cm deep next to plant. Top up every 3 days.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Fast sprouting in heat', tasks: ['Soak seeds 24h', 'Plant 2cm deep', 'Keep above 25°C'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 10, description: 'Rapid early growth', tasks: ['Thin to one plant per spot', 'Begin feeding at 2 weeks', 'Watch for damping off'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 25, description: 'Large leaves forming', tasks: ['Remove lower leaves for air flow', 'Apply balanced NPK', 'Stake tall varieties'] },
      { index: 3, name: 'Flowering', daysFromPlanting: 45, description: 'Yellow hibiscus-like flowers', tasks: ['Reduce nitrogen', 'Boost phosphorus and potassium', 'Hand-pollinate if needed'] },
      { index: 4, name: 'Harvest', daysFromPlanting: 60, description: 'Pods ready at 7-10cm', tasks: ['Harvest every 2-3 days', 'Use gloves — plant is prickly', 'Remove old pods to encourage production'] },
    ],
    tips: ['Wear gloves when harvesting — the hairs cause skin irritation', 'Over-mature pods become woody and tough', 'Intercrop with basil to deter pests'],
    commonPests: ['Okra shoot and fruit borer', 'Cotton stainer bug', 'Fusarium wilt', 'Leaf curl virus'],
  },
  {
    id: 'beetroot',
    name: 'Beetroot',
    localNames: { ig: 'Beet', ha: 'Beet', yo: 'Beet' },
    emoji: '🟣',
    daysToHarvest: 60,
    yieldPerSqM: 5,
    optimalTemp: [16, 24],
    optimalHumidity: [55, 70],
    description: 'High-value root vegetable gaining popularity in Nigerian urban markets, hospitals, and juice bars. Cooler greenhouse section ideal.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2,
      method: 'furrow',
      notes: 'Consistent moisture produces smooth, round roots. Irregular watering causes splitting or woody texture.',
      bottleDripTip: 'Bury a 1L bottle with 2 holes cap-down beside each plant. Refill every 3 days.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Seed clusters sprout', tasks: ['Soak seed clusters 2h before planting', 'Sow 2cm deep', 'Keep at 18-20°C'] },
      { index: 1, name: 'Thinning', daysFromPlanting: 14, description: 'Multiple seedlings per cluster', tasks: ['Thin to strongest seedling per spot', 'Final spacing 10cm apart', 'Begin light feeding'] },
      { index: 2, name: 'Leaf Growth', daysFromPlanting: 25, description: 'Dark green leaves develop', tasks: ['Side-dress with potassium', 'Weed around base carefully', 'Watch for leaf miners'] },
      { index: 3, name: 'Root Bulking', daysFromPlanting: 40, description: 'Root swells beneath soil', tasks: ['Reduce nitrogen, boost potassium', 'Do not disturb roots', 'Ensure even moisture'] },
      { index: 4, name: 'Harvest', daysFromPlanting: 60, description: 'Root golf-ball to fist size', tasks: ['Twist off gently', 'Leave 3cm of stem to prevent bleeding', 'Store in cool dry place'] },
    ],
    tips: ['Boron deficiency causes hollow, black rot in roots — use borax solution monthly', 'Harvest before roots exceed 8cm — they get woody', 'Leaves are edible and nutritious — sell as bonus greens'],
    commonPests: ['Leaf miners', 'Aphids', 'Cercospora leaf spot', 'Root rot'],
  },
  {
    id: 'irish-potato',
    name: 'Irish Potato',
    localNames: { ig: 'Ede Oyibo', ha: 'Dankali', yo: 'Ànàmọ̀' },
    emoji: '🥔',
    daysToHarvest: 90,
    yieldPerSqM: 4,
    optimalTemp: [18, 22],
    optimalHumidity: [60, 75],
    description: 'Major food security crop in Plateau State and Benue. Greenhouse cultivation protects from late blight which destroys field crops in rainy season.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 3,
      method: 'furrow',
      notes: 'Critical to stop watering 2 weeks before harvest so skins toughen. Over-watering at harvest causes rots.',
      bottleDripTip: 'Deep-bury 2L bottles (cap with 4 holes) 10cm into soil beside stem for subsurface drip. Refill every 3 days.',
    },
    stages: [
      { index: 0, name: 'Sprouting', daysFromPlanting: 0, description: 'Seed tuber develops eyes', tasks: ['Use certified seed tubers', 'Pre-sprout in light for 2 weeks', 'Plant 10cm deep, 30cm apart'] },
      { index: 1, name: 'Emergence', daysFromPlanting: 14, description: 'Shoots break soil surface', tasks: ['Begin earthing up soil', 'Apply balanced fertilizer', 'Watch for late blight signs'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 30, description: 'Rapid leafy growth', tasks: ['Continue earthing up', 'Apply fungicide if blight spotted', 'Irrigate consistently'] },
      { index: 3, name: 'Tuber Initiation', daysFromPlanting: 50, description: 'Tubers begin forming underground', tasks: ['Stop earthing up', 'Reduce nitrogen', 'Increase phosphorus and potassium'] },
      { index: 4, name: 'Tuber Bulking', daysFromPlanting: 70, description: 'Tubers grow rapidly', tasks: ['Maintain consistent watering', 'Watch for Colorado beetle', 'Avoid disturbing soil'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 90, description: 'Haulms die back, skins set', tasks: ['Stop watering 2 weeks before', 'Harvest when haulms turn yellow', 'Cure in dry shade for 1 week'] },
    ],
    tips: ['Never plant in same spot as tomatoes — they share blight', 'Plateau State seed tubers are best for Nigerian greenhouse use', 'Store harvested tubers in darkness — light causes greening and toxicity'],
    commonPests: ['Late blight', 'Early blight', 'Aphids (virus vectors)', 'Colorado potato beetle'],
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    localNames: { ig: 'Strawberi', ha: 'Strawberi', yo: 'Strawberi' },
    emoji: '🍓',
    daysToHarvest: 90,
    yieldPerSqM: 1.5,
    optimalTemp: [15, 25],
    optimalHumidity: [60, 70],
    description: 'Premium crop with very high market value in Nigerian cities. Can be grown year-round in a cool greenhouse. Jos Plateau is ideal location.',
    watering: {
      frequencyDays: 1,
      litresPerSqM: 1.5,
      method: 'drip',
      notes: 'Never wet leaves or fruit — causes grey mould (Botrytis). Drip to root zone only. Reduce in cool weather.',
      bottleDripTip: 'Insert 0.5L bottle neck-down into soil beside crown. 2 tiny pin holes in cap. Keeps moisture at root, leaves dry.',
    },
    stages: [
      { index: 0, name: 'Establishment', daysFromPlanting: 0, description: 'Crown and roots settle', tasks: ['Plant crowns at soil level — never too deep', 'Remove all flowers for 4 weeks', 'Water gently for first 2 weeks'] },
      { index: 1, name: 'Runner Control', daysFromPlanting: 21, description: 'Runners may form', tasks: ['Remove runners to concentrate energy to fruit', 'Apply balanced fertilizer', 'Mulch with straw to keep fruit clean'] },
      { index: 2, name: 'Flowering', daysFromPlanting: 45, description: 'White flowers open', tasks: ['Hand-pollinate with small brush', 'Increase potassium', 'Ensure 8+ hours light'] },
      { index: 3, name: 'Fruiting', daysFromPlanting: 60, description: 'Green fruits develop', tasks: ['Prop fruit off soil with straw', 'Watch for Botrytis', 'Maintain dry leaves'] },
      { index: 4, name: 'Harvest', daysFromPlanting: 90, description: 'Bright red fruit', tasks: ['Harvest with stalk attached', 'Pick every 2 days', 'Refrigerate within 2 hours'] },
    ],
    tips: ['High-value crop — sell fresh or to hotels and juice bars in Lagos, Abuja, Port Harcourt', 'Renew plants every 2-3 years for best yields', 'Everbearing varieties give multiple flushes — better for smallholders'],
    commonPests: ['Botrytis grey mould', 'Spider mites', 'Slugs', 'Powdery mildew'],
  },
  {
    id: 'green-beans',
    name: 'Green Beans',
    localNames: { ig: 'Agwa Nkwu', ha: 'Wake', yo: 'Ẹwà' },
    emoji: '🫘',
    daysToHarvest: 55,
    yieldPerSqM: 3,
    optimalTemp: [18, 28],
    optimalHumidity: [55, 70],
    description: 'Fast-cropping legume that fixes nitrogen into the soil. Excellent rotation crop after heavy feeders like tomato.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2,
      method: 'furrow',
      notes: 'Avoid waterlogging — beans fix nitrogen and dislike wet feet. Critical watering during flowering and pod fill.',
      bottleDripTip: 'Place 1L bottle with 2 holes between every 2 plants. Green beans do not need much — less is more.',
    },
    stages: [
      { index: 0, name: 'Germination', daysFromPlanting: 0, description: 'Seeds sprout quickly', tasks: ['Direct sow 3cm deep', 'Keep at 22-25°C', 'Germinates in 5-8 days'] },
      { index: 1, name: 'Seedling', daysFromPlanting: 8, description: 'Cotyledons emerge', tasks: ['Thin to 15cm spacing', 'Do not over-fertilize (fixes own N)', 'Provide trellis for climbing types'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 20, description: 'Leafy growth, climbing', tasks: ['Train vines up support strings', 'Light phosphorus feed', 'Watch for bean fly'] },
      { index: 3, name: 'Flowering', daysFromPlanting: 35, description: 'Small white/purple flowers', tasks: ['Critical watering period', 'Ensure pollination', 'Watch for aphids'] },
      { index: 4, name: 'Pod Fill', daysFromPlanting: 45, description: 'Pods swell rapidly', tasks: ['Increase potassium', 'Harvest before beans bulge in pod', 'Daily check during this stage'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 55, description: 'Pods young, tender, crisp', tasks: ['Snap test — should break cleanly', 'Harvest every 2 days', 'Keep plants picked to extend production'] },
    ],
    tips: ['As a legume, inoculate seeds with Rhizobium bacteria for free nitrogen — ask at agro-input stores', 'Succession sow every 3 weeks for continuous harvest', 'Export quality green beans fetch very high prices — research standards for export'],
    commonPests: ['Bean fly', 'Aphids', 'Anthracnose', 'Bean rust'],
  },,
  {
    id: 'onion',
    name: 'Onion',
    localNames: { ig: 'Yabasị', ha: 'Albasa', yo: 'Alubosa' },
    emoji: '🧅',
    daysToHarvest: 110,
    yieldPerSqM: 4,
    optimalTemp: [13, 24],
    optimalHumidity: [50, 70],
    description: 'Thesis focal crop for protected production trials in Southeastern Nigeria. Use locally adapted varieties and manage heat, drainage and bulb-stage watering carefully.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2,
      method: 'drip',
      notes: 'Keep the root zone evenly moist during establishment and bulb development; avoid waterlogging and reduce irrigation as bulbs mature.',
      bottleDripTip: 'Use clean reused bottles only for water delivery; keep holes small and observe soil moisture before refilling.',
    },
    stages: [
      { index: 0, name: 'Nursery', daysFromPlanting: 0, description: 'Seedling establishment', tasks: ['Use clean media and shallow sowing', 'Maintain even moisture without saturation', 'Protect seedlings from extreme midday heat'] },
      { index: 1, name: 'Transplant', daysFromPlanting: 35, description: 'Seedlings move to prepared beds', tasks: ['Transplant into well-drained beds', 'Record spacing and date', 'Inspect for damping-off or root damage'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 50, description: 'Leaf and root growth', tasks: ['Keep weeds controlled', 'Maintain consistent moisture', 'Monitor thrips and leaf symptoms'] },
      { index: 3, name: 'Bulbing', daysFromPlanting: 75, description: 'Bulb expansion begins', tasks: ['Avoid waterlogging', 'Keep ventilation adequate', 'Use soil-test/extension guidance before nutrient correction'] },
      { index: 4, name: 'Maturity', daysFromPlanting: 100, description: 'Necks soften and tops begin to fall', tasks: ['Reduce irrigation as maturity approaches', 'Keep bulbs dry', 'Plan curing space'] },
      { index: 5, name: 'Harvest', daysFromPlanting: 110, description: 'Bulbs ready for lifting and curing', tasks: ['Harvest in dry conditions where possible', 'Cure with good airflow', 'Remove damaged bulbs from storage lots'] },
    ],
    tips: ['Prioritise drainage and airflow in humid conditions', 'Do not apply lime, fertilizer or pesticides by guesswork — use test results, labels and extension guidance', 'Record variety and planting date because day-length response varies'],
    commonPests: ['Thrips', 'Purple blotch', 'Downy mildew', 'Basal rot'],
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    localNames: { ig: 'Kabeeji', ha: 'Kabeji', yo: 'Kabeji' },
    emoji: '🥬',
    daysToHarvest: 85,
    yieldPerSqM: 6,
    optimalTemp: [15, 24],
    optimalHumidity: [60, 75],
    description: 'Thesis focal crop for low-cost greenhouse/screenhouse testing. Protected cultivation can reduce weather exposure, but heat, humidity, pests and soil-borne disease still require active management.',
    watering: {
      frequencyDays: 2,
      litresPerSqM: 2.5,
      method: 'drip',
      notes: 'Maintain steady soil moisture during head formation while avoiding standing water and prolonged leaf wetness.',
      bottleDripTip: 'Use clean reused bottles only when they can deliver water slowly to the root zone without touching edible leaves.',
    },
    stages: [
      { index: 0, name: 'Nursery', daysFromPlanting: 0, description: 'Seedling emergence and establishment', tasks: ['Use clean nursery media', 'Avoid overwatering', 'Remove weak or diseased seedlings'] },
      { index: 1, name: 'Transplant', daysFromPlanting: 28, description: 'Seedlings establish in prepared beds', tasks: ['Use well-drained treated beds', 'Water immediately after transplanting', 'Record transplant survival'] },
      { index: 2, name: 'Vegetative', daysFromPlanting: 40, description: 'Rapid leaf expansion', tasks: ['Maintain ventilation', 'Scout leaf undersides for pests', 'Keep weeds and diseased debris out of beds'] },
      { index: 3, name: 'Heading', daysFromPlanting: 60, description: 'Head formation', tasks: ['Keep moisture even', 'Avoid excessive heat', 'Escalate unusual wilt/root symptoms for diagnosis'] },
      { index: 4, name: 'Harvest', daysFromPlanting: 85, description: 'Heads firm enough for harvest', tasks: ['Harvest firm heads with clean tools', 'Remove damaged outer leaves', 'Record weight and marketable yield for pilot evidence'] },
    ],
    tips: ['Use clean tools and remove diseased residues promptly', 'Correct poor drainage before planting', 'Use diagnosis and locally appropriate extension guidance before chemical treatment'],
    commonPests: ['Diamondback moth', 'Aphids', 'Black rot', 'Clubroot'],
  }
]

export function getCropById(id: string): CropInfo | undefined {
  return CROPS.find(c => c.id === id)
}
