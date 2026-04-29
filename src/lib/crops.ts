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
]

export function getCropById(id: string): CropInfo | undefined {
  return CROPS.find(c => c.id === id)
}
