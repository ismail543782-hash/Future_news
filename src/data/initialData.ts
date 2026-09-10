import { Category, Author, Article, BreakingNews, Advertisement, BlogPost, CountryEdition } from '../types/news';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'politics', name_bn: 'রাজনীতি', name_en: 'Politics', icon: 'Landmark', display_order: 1, is_active: true },
  { id: 'cat-2', slug: 'tech', name_bn: 'প্রযুক্তি', name_en: 'Tech & AI', icon: 'Cpu', display_order: 2, is_active: true },
  { id: 'cat-3', slug: 'economy', name_bn: 'বাণিজ্য', name_en: 'Economy', icon: 'TrendingUp', display_order: 3, is_active: true },
  { id: 'cat-4', slug: 'world', name_bn: 'আন্তর্জাতিক', name_en: 'World', icon: 'Globe', display_order: 4, is_active: true },
  { id: 'cat-5', slug: 'sports', name_bn: 'খেলাধুলা', name_en: 'Sports', icon: 'Trophy', display_order: 5, is_active: true },
  { id: 'cat-6', slug: 'entertainment', name_bn: 'বিনোদন', name_en: 'Entertainment', icon: 'Film', display_order: 6, is_active: true },
  { id: 'cat-7', slug: 'science', name_bn: 'বিজ্ঞান ও পরিবেশ', name_en: 'Science & Climate', icon: 'Leaf', display_order: 7, is_active: true },
];

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'auth-1',
    slug: 'ismail-hossain',
    name_bn: 'ইসমাইল হোসেন',
    name_en: 'Ismail Hossain',
    role_bn: 'প্রধান সম্পাদক ও প্রকাশক',
    role_en: 'Editor-in-Chief & Publisher',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio_bn: 'দীর্ঘ এক যুগের অনুসন্ধানী সাংবাদিকতা এবং ডিজিটাল মিডিয়া রূপান্তর গবেষক।',
    bio_en: 'Investigative journalist and digital media strategist with over a decade of reporting.',
  },
  {
    id: 'auth-2',
    slug: 'farhana-rahman',
    name_bn: 'ফারহানা রহমান',
    name_en: 'Farhana Rahman',
    role_bn: 'প্রযুক্তি ও উদ্ভাবন বিষয়ক বিশেষ প্রতিবেদক',
    role_en: 'Tech & Innovation Correspondent',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio_bn: 'কৃত্রিম বুদ্ধিমত্তা, সাইবার নিরাপত্তা ও নতুন প্রযুক্তি নিয়ে নিয়মিত লেখেন।',
    bio_en: 'Writes on Artificial Intelligence, frontier technology, and cyber security ecosystems.',
  },
  {
    id: 'auth-3',
    slug: 'tanvir-ahmed',
    name_bn: 'তানভীর আহমেদ',
    name_en: 'Tanvir Ahmed',
    role_bn: 'আন্তর্জাতিক অর্থনৈতিক বিশ্লেষক',
    role_en: 'Global Economics Analyst',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio_bn: 'বৈশ্বিক বাণিজ্যনীতি এবং আন্তর্জাতিক মুদ্রা বাজার নিয়ে গবেষণারত।',
    bio_en: 'Researches global macroeconomic policy, trade corridors, and financial markets.',
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    category_id: 'cat-2',
    author_id: 'auth-2',
    slug: 'bangladesh-ai-hub-south-asia-breakthrough',
    featured_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    image_caption_bn: 'ভবিষ্যতের কৃত্রিম বুদ্ধিমত্তা ও ডেটাসেন্টার অবকাঠামো তৈরিতে অগ্রণী ভূমিকা রাখছে নতুন প্রযুক্তি ক্লাস্টার।',
    image_caption_en: 'Next-generation AI compute clusters driving high-tech transformation across South Asia.',
    image_credit: 'Unsplash / Deep Tech Collective',
    status: 'published',
    is_featured: true,
    is_breaking: true,
    is_trending: true,
    is_sponsored: false,
    views: 14280,
    reading_time_minutes: 4,
    published_at: '2026-09-09T18:30:00Z',
    created_at: '2026-09-09T17:00:00Z',
    updated_at: '2026-09-09T18:30:00Z',
    tags: ['Artificial Intelligence', 'Bangla AI', 'Tech Innovation', 'Data Center'],

    title_bn: 'দক্ষিণ এশিয়ার শীর্ষস্থানীয় এআই ও ডেটা হাবে রূপান্তরের পথে বাংলাদেশ: নতুন জাতীয় মহাপরিকল্পনা ঘোষণা',
    title_en: 'Bangladesh Accelerates Vision to Become South Asia’s Next Premier AI & Cloud Data Hub with New Mega Policy',
    summary_bn: 'দেশজুড়ে অত্যাধুনিক সুপারকম্পিউটিং ক্লাস্টার স্থাপন এবং বাংলা ভাষা মডেলের উচ্চগতির উন্নয়নে ২০০ কোটি টাকার বিশেষ তহবিল বরাদ্দ।',
    summary_en: 'Major national fund announced to build indigenous bilingual LLM infrastructure, edge data centres and next-gen chip development labs.',
    content_bn: `তথ্যপ্রযুক্তি খাতের বৈপ্লবিক রূপান্তরে দক্ষিণ এশিয়ার নেতৃত্ব নিতে দীর্ঘমেয়াদি নতুন জাতীয় কৃত্রিম বুদ্ধিমত্তা মহাপরিকল্পনা ২০২৬ ঘোষণা করা হয়েছে। এই মহাপরিকল্পনার আওতায় দেশের শীর্ষ প্রকৌশল বিশ্ববিদ্যালয় এবং বেসরকারি ক্লাউড অপারেটরদের যৌথ উদ্যোগে একটি সার্বভৌম সুপারকম্পিউটিং ক্লাস্টার স্থাপিত হবে।

বিশেষজ্ঞরা বলছেন, আধুনিক বিশ্বের অর্থনীতি এখন ডেটা এবং কম্পিউট সক্ষমতার ওপর নির্ভরশীল। নিজস্ব বাংলা ভাষার বৃহৎ ভাষা মডেল (LLM) প্রশিক্ষণ এবং স্থানীয় সাইবার সুরক্ষার ক্ষেত্রে এই উদ্যোগ যুগান্তকারী ফল বয়ে আনবে।

পরিকল্পনার প্রধান স্তম্ভসমূহ:
১. দেশীয় শিল্প ও গবেষকদের জন্য ভর্তুকিযুক্ত এআই ক্লাউড অ্যাক্সেস।
২. বাংলা ও ক্ষুদ্র নৃগোষ্ঠীর ভাষাসমূহ সংরক্ষণে ওপেন-সোর্স ভাষাগত ডেটাসেট উন্মোচন।
৩. আন্তর্জাতিক সেমিকন্ডাক্টর ও সফটওয়্যার ফার্মগুলোর জন্য বিশেষ কর প্রণোদনা অঞ্চল।

আন্তর্জাতিক বিনিয়োগকারীরা জানিয়েছেন, তরুণ ও দক্ষ জনশক্তির প্রাচুর্যের কারণে এই অঞ্চলে প্রযুক্তি বিনিয়োগের বিপুল অপার সম্ভাবনা তৈরি হয়েছে।`,
    content_en: `A transformative National Artificial Intelligence & Compute Blueprint 2026 was unveiled today, cementing a visionary pathway to position the nation as a leading frontier technology hub in South Asia.

The policy commits strategic public-private investments into sovereign cloud compute clusters, high-bandwidth subsea connectivity corridors, and bilingual natural language models specifically calibrated for localized enterprise needs.

Key Strategic Pillars:
1. Subsidized GPU compute infrastructure for domestic deep-tech innovators and university research labs.
2. Comprehensive multi-modal linguistic datasets capturing native idioms, dialects, and cultural folklore.
3. Tailored fiscal incentives for global semiconductor testing and edge-AI fabrication partnerships.

Global technology analysts emphasize that this landmark initiative arrives at an opportune inflection point, leveraging demographic dividends and expanding engineering talent pools to capture high-value export contracts.`,

    seo_title_bn: 'বাংলাদেশ এআই ও ডেটা হাব মহাপরিকল্পনা ২০২৬ | ফিউচার নিউজ প্রযুক্তি',
    seo_title_en: 'South Asia AI Hub Transformation 2026: Official Roadmap | Future News',
    seo_description_bn: 'দক্ষিণ এশিয়ার কৃত্রিম বুদ্ধিমত্তা ও ডেটাসেন্টার ক্লাস্টার প্রতিষ্ঠায় নতুন মহাপরিকল্পনা ঘোষণা। বিস্তারিত প্রতিবেদন পড়ুন ফিউচার নিউজে।',
    seo_description_en: 'In-depth coverage on the launch of the National AI & Sovereign Compute Infrastructure Blueprint in South Asia.',
    focus_keyphrase_bn: 'বাংলাদেশ এআই হাব ২০২৬',
    focus_keyphrase_en: 'South Asia AI Hub Policy 2026',
  },
  {
    id: 'art-2',
    category_id: 'cat-3',
    author_id: 'auth-3',
    slug: 'global-green-energy-investments-record-high',
    featured_image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    image_caption_bn: 'সৌর ও বায়ুবিদ্যুৎ প্রকল্পে বিশ্বজুড়ে নতুন বিনিয়োগের নতুন রেকর্ড।',
    image_caption_en: 'Solar and wind farm deployments hit all-time high milestone globally.',
    image_credit: 'Unsplash / Clean Energy Grid',
    status: 'published',
    is_featured: false,
    is_breaking: false,
    is_trending: true,
    is_sponsored: false,
    views: 8920,
    reading_time_minutes: 3,
    published_at: '2026-09-09T14:15:00Z',
    created_at: '2026-09-09T13:00:00Z',
    updated_at: '2026-09-09T14:15:00Z',
    tags: ['Economy', 'Renewable Energy', 'Solar Power', 'Green Finance'],

    title_bn: 'সবুজ জ্বালানিতে বিশ্বব্যাপী রেকর্ড ২ ট্রিলিয়ন ডলারের বিনিয়োগ: অর্থনৈতিক গতিতে নতুন মোড়',
    title_en: 'Global Renewable Energy Investments Surge Past Record $2 Trillion Milestone Amid Clean Transition',
    summary_bn: 'জীবাশ্ম জ্বালানি নির্ভরতা কাটিয়ে সৌর ও উপকূলীয় বায়ুপ্রকল্পে ঝুঁকছে শীর্ষ অর্থনীতির দেশগুলো। এশিয়ার বাজারে সর্বোচ্চ প্রবৃদ্ধি।',
    summary_en: 'Capital flows into clean grid infrastructure outpace conventional fossil fuel expenditures for third consecutive quarter.',
    content_bn: `চলতি অর্থবছরে বৈশ্বিক পুনর্নবীকরণযোগ্য জ্বালানি খাতে বিনিয়োগ সর্বকালের সর্বোচ্চ রেকর্ড অতিক্রম করেছে। আন্তর্জাতিক শক্তি সংস্থার (IEA) সর্বশেষ প্রান্তিক প্রতিবেদনে দেখা গেছে, বিগত ১২ মাসে শুধু সৌরশক্তি এবং ব্যাটারি স্টোরেজ খাতেই বিনিয়োগ বেড়েছে প্রায় ৩৫ শতাংশ।

ইউরোপীয় ইউনিয়ন ও এশিয়ার উদীয়মান অর্থনীতির দেশগুলোতে গ্রিড আধুনিকায়ন এবং বিদ্যুৎ সঞ্চালন ব্যবস্থার অটোমেশনে বিপুল মূলধন প্রবাহিত হচ্ছে। ফলে একদিকে যেমন কার্বন নির্গমন উল্লেখযোগ্য হারে কমছে, তেমনি সৃষ্টি হচ্ছে লক্ষাধিক টেকসই কর্মসংস্থান।

অর্থনীতিবিদদের মতে, সবুজ অর্থায়নের এই ঊর্ধ্বমুখী ধারা দীর্ঘমেয়াদে জ্বালানি নিরাপত্তার সংকট নিরসনে মূল নিয়ামক হিসেবে কাজ করবে।`,
    content_en: `Global capital allocation toward renewable power systems, utility-scale battery storage, and smart grid modernization has crossed an unprecedented $2 trillion benchmark, according to the latest quarterly report by the International Energy Agency.

Emerging markets across Asia and Latin America contributed over 40% of the net capacity additions, spurred by rapid cost deflation in high-efficiency photovoltaic modules and grid-scale lithium-iron-phosphate storage units.

Financial strategists observe that structural capital reallocation toward climate-resilient energy networks is steadily decoupling GDP expansion from fossil fuel dependency.`,

    seo_title_bn: 'সবুজ জ্বালানিতে রেকর্ড ২ ট্রিলিয়ন ডলার বিনিয়োগ | ফিউচার নিউজ বাণিজ্য',
    seo_title_en: 'Renewable Energy Investments Cross Record $2T Mark | Future News Economy',
    seo_description_bn: 'বিশ্বজুড়ে নবায়নযোগ্য সৌর ও বায়ুবিদ্যুৎ প্রকল্পে বিনিয়োগের নতুন রেকর্ড তৈরি। পড়ুন আন্তর্জাতিক অর্থ সংবাদের বিস্তারিত।',
    seo_description_en: 'Comprehensive financial analysis of the global clean energy transition crossing $2 trillion in capital investments.',
    focus_keyphrase_bn: 'সবুজ জ্বালানি বিনিয়োগ রেকর্ড',
    focus_keyphrase_en: 'Renewable Energy Investment Record',
  },
  {
    id: 'art-3',
    category_id: 'cat-5',
    author_id: 'auth-1',
    slug: 'champions-trophy-cricket-thriller-last-over-drama',
    featured_image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    image_caption_bn: 'শেষ ওভারের টানটান উত্তেজনায় শেষ বলে অবিস্মরণীয় চার মেরে জয় নিশ্চিত।',
    image_caption_en: 'Celebrations erupt under floodlights after sensational final-ball boundary victory.',
    image_credit: 'Unsplash / Sports Arena Live',
    status: 'published',
    is_featured: false,
    is_breaking: true,
    is_trending: true,
    is_sponsored: false,
    views: 21540,
    reading_time_minutes: 3,
    published_at: '2026-09-09T16:45:00Z',
    created_at: '2026-09-09T16:00:00Z',
    updated_at: '2026-09-09T16:45:00Z',
    tags: ['Cricket', 'Champions Trophy', 'Match Report', 'Sports Thriller'],

    title_bn: 'শেষ বলের অবিশ্বাস্য নাটকীয়তায় জয়: সমর্থকদের বাঁধভাঙা উল্লাসে মেগা ফাইনাল নিশ্চিত',
    title_en: 'Final-Ball Masterpiece: Historic Thriller Seals Final Spot in Unforgettable Cricket Classic',
    summary_bn: 'জয়ের জন্য শেষ ওভারে প্রয়োজন ছিল ১৪ রান। শ্বাসরুদ্ধকর ম্যাচে দুর্দান্ত ব্যাটিং দৃঢ়তায় জয় তুলে নিলো দল।',
    summary_en: 'Requiring 14 runs off the final 6 deliveries, a sensational batting display under pressure secures dramatic victory.',
    content_bn: `ক্রিকেট ইতিহাসের অন্যতম রোমাঞ্চকর ম্যাচে পরিণত হলো রাতের সেমিফাইনাল। গ্যালারিভর্তি দর্শকের প্রতিটি মুহূর্তের নিঃশ্বাস বন্ধ রাখা ম্যাচে শেষ বলের নাটকীয়তায় দল পৌঁছে গেলো স্বপ্নের ফাইনালে।

শেষ ওভারে জয়ের সমীকরণ ছিল অত্যন্ত কঠিন—৬ বলে ১৪ রান। প্রতিপক্ষের অভিজ্ঞ পেসারের করা নিখুঁত ইয়র্কারের বিরুদ্ধে শান্ত মাথায় স্ট্রোক খেলে চতুর্থ ও পঞ্চম বলে বাউন্ডারি আদায় করেন ব্যাটসম্যান। শেষ বলে প্রয়োজনীয় ২ রান নিতে ব্যাকওয়ার্ড পয়েন্ট দিয়ে দৃষ্টিনন্দন চারে খেলা শেষ করেন তিনি।

ম্যাচসেরা খেলোয়াড় প্রতিক্রিয়ায় জানান, ‘আমরা কখনো আশা হারাইনি। ড্রেসিংরুমের সবার আত্মবিশ্বাসই মাঠে সেরাটা দিতে প্রেরণা যুগিয়েছে।’`,
    content_en: `In what will undoubtedly enter cricketing lore as one of the sport's most electrifying finishes, the high-stakes semifinal concluded with a heart-stopping boundary struck on the absolute final delivery of the encounter.

Faced with a daunting target of 14 runs from the final six balls against pinpoint yorkers, the lower-order partnership displayed nerves of steel. Executing two scintillating boundaries under the deafening roar of stadium floodlights, the team clinched victory in unforgettable style.

The captain praised the collective resilience, remarking: 'When you represent millions of passionate fans, you fight for every single run until the final dust settles.'`,

    seo_title_bn: 'শেষ বলের জয়ে ফাইনালে ক্রিকেট দল | ফিউচার নিউজ খেলাধুলা',
    seo_title_en: 'Cricket Thriller: Last-Ball Miracle Match Report | Future News Sports',
    seo_description_bn: 'শ্বাসরুদ্ধকর সেমিফাইনালে শেষ বলের চারে অবিশ্বাস্য জয়। পড়ুন খেলার খুঁটিনাটি বল-বাই-বল প্রতিবেদন।',
    seo_description_en: 'Full match analysis and highlights breakdown of the breathtaking cricket semifinal showdown.',
    focus_keyphrase_bn: 'ক্রিকেট সেমিফাইনাল নাটকীয় জয়',
    focus_keyphrase_en: 'Cricket Semifinal Thriller Victory',
  },
  {
    id: 'art-4',
    category_id: 'cat-4',
    author_id: 'auth-3',
    slug: 'un-global-peace-summit-climate-accord',
    featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    image_caption_bn: 'জাতিসংঘ সাধারণ অধিবেশনে বিশ্বনেতাদের গুরুত্বপূর্ণ মতবিনিময়।',
    image_caption_en: 'World delegates convening at the multilateral peace & climate conference.',
    image_credit: 'Unsplash / Diplomatic Press Corps',
    status: 'published',
    is_featured: false,
    is_breaking: false,
    is_trending: false,
    is_sponsored: false,
    views: 6310,
    reading_time_minutes: 4,
    published_at: '2026-09-09T11:20:00Z',
    created_at: '2026-09-09T10:00:00Z',
    updated_at: '2026-09-09T11:20:00Z',
    tags: ['World', 'UN Summit', 'Diplomacy', 'Climate Accord'],

    title_bn: 'জাতিসংঘ শান্তি সম্মেলনে ঐতিহাসিক ঐক্যমত্য: জলবায়ু উদ্বাস্তু পুনর্বাসনে বৈশ্বিক অঙ্গীকার',
    title_en: 'Historic Multilateral Consensus at UN Summit: Historic Framework for Climate Resilience Established',
    summary_bn: 'বিশ্বের ১৯২টি দেশের উপস্থিতিতে বিশেষ চুক্তিতে সই। ক্ষতিগ্রস্ত উপকূলীয় দেশসমূহের জন্য গঠন করা হলো জরুরি সহায়তা তহবিল।',
    summary_en: 'Unanimous adoption of binding climate displacement safeguard charter signed by 192 member states.',
    content_bn: `সুইজারল্যান্ডের জেনেভায় চলমান বিশেষ শান্তি ও জলবায়ু সুরক্ষা সম্মেলনে বিশ্বের ১৯২টি দেশের প্রতিনিধিরা একটি যুগান্তকারী সার্বজনীন ঘোষণাপত্রে সম্মতি জানিয়েছেন।

চুক্তির মূল উদ্দেশ্য হলো ক্রমবর্ধমান সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধি এবং তীব্র প্রাকৃতিক দুর্যোগে ভিটেমাটি হারানো মানুষের জন্য আন্তর্জাতিক আইনি সুরক্ষা ও পুনর্বাসন কাঠামো তৈরি করা। এজন্য একটি বহুপাক্ষিক জরুরি তহবিল গঠন করা হয়েছে, যেখানে শিল্পোন্নত দেশগুলো প্রথম বছরই ৩০ বিলিয়ন ডলার সহায়তা প্রদানের প্রতিশ্রুতি দিয়েছে।

আন্তর্জাতিক মানবাধিকার কর্মীরা এটিকে গত দুই দশকের মধ্যে সবচেয়ে কার্যকর সম্মিলিত কূটনৈতিক অগ্রগতি হিসেবে অভিহিত করেছেন।`,
    content_en: `Delegates spanning 192 sovereign member states ratified a comprehensive landmark multilateral treaty in Geneva today, formalizing an unprecedented international legal protection framework for communities displaced by severe weather volatility.

The treaty institutes a dedicated Global Climate Relocation & Relief Trust, capitalized by an initial $30 billion pledge from industrialized economies to fortify coastal embankments and fund planned relocation settlements.

Diplomats lauded the agreement as a defining breakthrough in global collective solidarity, establishing clear accountability mechanisms for environmental vulnerability mitigations.`,

    seo_title_bn: 'জাতিসংঘ সম্মেলনে জলবায়ু উদ্বাস্তু পুনর্বাসন চুক্তি | আন্তর্জাতিক খবর',
    seo_title_en: 'UN Climate Displacement Treaty Accord 2026 | Future News World',
    seo_description_bn: 'জেনেভায় জাতিসংঘ সম্মেলনে ১৯২ দেশের সম্মতিতে ঐতিহাসিক জলবায়ু চুক্তি স্বাক্ষরিত। পড়ুন বিস্তারিত খবর।',
    seo_description_en: 'World leaders ratify landmark climate relocation assistance treaty at United Nations global conference.',
    focus_keyphrase_bn: 'জাতিসংঘ জলবায়ু চুক্তি ২০২৬',
    focus_keyphrase_en: 'UN Climate Resilience Treaty 2026',
  },
  {
    id: 'art-5',
    category_id: 'cat-6',
    author_id: 'auth-2',
    slug: 'international-film-festival-independent-cinema-triumph',
    featured_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    image_caption_bn: 'কান ও ভেনিস উৎসবে প্রশংসিত দেশীয় তরুণ নির্মাতার চলচ্চিত্র।',
    image_caption_en: 'Independent cinematic brilliance honored at international film festival red carpet.',
    image_credit: 'Unsplash / Cinema Guild',
    status: 'published',
    is_featured: false,
    is_breaking: false,
    is_trending: true,
    is_sponsored: false,
    views: 7420,
    reading_time_minutes: 3,
    published_at: '2026-09-08T20:10:00Z',
    created_at: '2026-09-08T19:00:00Z',
    updated_at: '2026-09-08T20:10:00Z',
    tags: ['Cinema', 'Film Festival', 'Entertainment', 'Art'],

    title_bn: 'আন্তর্জাতিক চলচ্চিত্র উৎসবে দেশের তরুণ পরিচালকের শ্রেষ্ঠ জুরি পুরস্কার জয়: বিশ্বমঞ্চে অনন্য স্বীকৃতি',
    title_en: 'Young Indie Filmmaker Clinches Prestigious Grand Jury Honors at Renowned International Film Festival',
    summary_bn: 'বাস্তবধর্মী চিত্রনাট্য ও অসাধারণ নির্মাণশৈলীর জন্য বিচারকদের স্ট্যান্ডিং ওভেশন অর্জন করলো নতুন চলচ্চিত্র "জীবনচিত্র"।',
    summary_en: 'Groundbreaking neo-realist drama wins universal acclaim and highest artistic distinction from world jury.',
    content_bn: `আন্তর্জাতিক চলচ্চিত্র উৎসবের সমাপনী সন্ধ্যায় ঘোষিত হলো চলতি বছরের সর্বোচ্চ সম্মাননা। বিশ্বের শীর্ষ ১০০টি মনোনীত ছবির সাথে প্রতিদ্বন্দ্বিতা করে গ্র্যান্ড জুরি অ্যাওয়ার্ড ছিনিয়ে নিয়েছে তরুণ চলচ্চিত্র নির্মাতা রাশেদ চৌধুরীর চলচ্চিত্র ‘জীবনচিত্র’।

ছবির গল্পে তুলে ধরা হয়েছে সাধারণ খেটে খাওয়া মানুষের জীবনযুদ্ধ এবং সামাজিক পরিবর্তনের সূক্ষ্ম মানবিক অনুভূতি। উৎসবের বিচারকমণ্ডলী ছবির প্রাকৃতিক সিনেমাটোগ্রাফি ও অপেশাদার শিল্পীদের স্বতঃস্ফূর্ত অভিনয়ের উচ্ছ্বসিত প্রশংসা করেন।

পুরস্কার গ্রহণের সময় আবেগাপ্লুত কণ্ঠে নির্মাতা বলেন, ‘এই অর্জন দেশের প্রতিটি মুক্তমনা শিল্পী ও গল্পবলিয়েদের জন্য উৎসর্গ করলাম।’`,
    content_en: `In an electrifying culmination to one of global cinema’s most competitive festival seasons, the Grand Jury Award was conferred upon independent auteur Rashed Chowdhury for his evocative narrative masterpiece 'Portraits of Life'.

The cinematic piece delves into the raw, unfiltered emotional landscapes of working-class resilience amidst urban transition. The judging panel specifically commended the naturalistic lens work, immersive acoustic design, and profoundly poignant character arcs.

Accepting the accolade to a prolonged standing ovation, the director declared: 'Cinema is the universal mirror of our shared humanity. This honor belongs to all truth-seekers telling untold stories.'`,

    seo_title_bn: 'আন্তর্জাতিক চলচ্চিত্র উৎসবে তরুণ পরিচালকের পুরস্কার জয় | বিনোদন',
    seo_title_en: 'Indie Film Clinches Prestigious International Jury Award | Entertainment',
    seo_description_bn: 'বিশ্বমঞ্চে দেশের চলচ্চিত্রের অনন্য গৌরব। আন্তর্জাতিক উৎসবে শ্রেষ্ঠ পুরস্কার জিতল জীবনচিত্র।',
    seo_description_en: 'Sensational victory for emerging independent director at international film festival gala.',
    focus_keyphrase_bn: 'আন্তর্জাতিক চলচ্চিত্র পুরস্কার জয়',
    focus_keyphrase_en: 'International Film Festival Grand Jury Award',
  }
];

export const INITIAL_BREAKING_NEWS: BreakingNews[] = [
  {
    id: 'brk-1',
    title_bn: 'ব্রেকিং: দক্ষিণ এশিয়ায় আধুনিক এআই ও ক্লাউড ডেটাসেন্টার গড়ে তুলতে নতুন জাতীয় মহাপরিকল্পনা ঘোষণা',
    title_en: 'BREAKING: National Sovereign AI & Cloud Data Mega-Blueprint 2026 officially unveiled',
    article_slug: 'bangladesh-ai-hub-south-asia-breakthrough',
    priority: 1,
    is_active: true,
    created_at: '2026-09-09T18:30:00Z',
  },
  {
    id: 'brk-2',
    title_bn: 'ক্রিকেট: শেষ বলের অবিস্মরণীয় বাউন্ডারিতে শ্বাসরুদ্ধকর জয় পেয়ে ফাইনালে বাংলাদেশ টাইগার্স!',
    title_en: 'CRICKET: Historic last-ball boundary seals sensational semifinal victory into grand final!',
    article_slug: 'champions-trophy-cricket-thriller-last-over-drama',
    priority: 2,
    is_active: true,
    created_at: '2026-09-09T16:45:00Z',
  },
  {
    id: 'brk-3',
    title_bn: 'অর্থনীতি: নবায়নযোগ্য সবুজ বিদ্যুৎ উৎপাদনে বিশ্বব্যাপী রেকর্ড ২ ট্রিলিয়ন ডলার বিনিয়োগ অতিক্রম',
    title_en: 'ECONOMY: Global renewable energy deployments surpass historic $2 Trillion milestone',
    article_slug: 'global-green-energy-investments-record-high',
    priority: 3,
    is_active: true,
    created_at: '2026-09-09T14:15:00Z',
  }
];

export const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-header',
    title: 'শীর্ষ হেডার ব্যানার (728x90 Leaderboard)',
    slot: 'header_leaderboard',
    type: 'custom_banner',
    image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80',
    target_url: 'https://cloud.google.com',
    sponsor_name: 'Next-Gen Cloud Solutions Sponsor',
    code_html: `<!-- Google AdSense Demo Snippet -->
<div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #fff; padding: 16px 24px; border-radius: 8px; text-align: center; border: 1px solid #334155;">
  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600;">বিজ্ঞাপন / SPONSORED AD</span>
  <h4 style="margin: 6px 0 2px 0; font-size: 17px; font-weight: 700; color: #38bdf8;">প্রিমিয়াম ক্লাউড হোস্টিং ও ডেডিকেটেড সার্ভার — ৫০% ছাড়</h4>
  <p style="margin: 0; font-size: 13px; color: #cbd5e1;">আপনার নিউজ পোর্টাল ও অ্যাপ্লিকেশনের জন্য আল্ট্রা-ফাস্ট হোস্টিং। আজই শুরু করুন!</p>
</div>`,
    is_enabled: true,
    impressions: 24850,
    clicks: 1120,
  },
  {
    id: 'ad-article',
    title: 'খবরের ভেতরের বিজ্ঞাপন (In-Article Responsive)',
    slot: 'in_article',
    type: 'custom_banner',
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://workspace.google.com',
    sponsor_name: 'Enterprise Productivity Suite',
    code_html: `<!-- Google In-Article Ad -->
<div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
  <p style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">গুগল অ্যাডসেন্স / GOOGLE ADSENSE READY SLOT</p>
  <p style="font-weight: 600; color: #0f172a; margin: 0 0 6px 0;">ব্যবসা ও স্টার্টআপের জন্য স্মার্ট ফিনান্সিয়াল সফটওয়্যার</p>
  <button style="background: #e11d48; color: #fff; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; border: none; cursor: pointer;">ফ্রি ট্রায়াল শুরু করুন</button>
</div>`,
    is_enabled: true,
    impressions: 18400,
    clicks: 860,
  },
  {
    id: 'ad-sidebar',
    title: 'সাইডবার ব্যানার (300x600 Half Page)',
    slot: 'sidebar',
    type: 'custom_banner',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    target_url: 'https://news.google.com',
    sponsor_name: 'FinTech Banking Partner',
    code_html: `<!-- Sidebar 300x600 Ad -->
<div style="background: #f1f5f9; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; text-align: center;">
  <div style="font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">বিজ্ঞাপন পার্টনার</div>
  <h5 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">আন্তর্জাতিক মানি ট্রান্সফার ও রেমিট্যান্স</h5>
  <p style="font-size: 13px; color: #475569; margin-bottom: 14px;">জিরো ফি সহ দেশে প্রিয়জনের কাছে তাৎক্ষণিক টাকা পাঠান নিরাপদে।</p>
  <span style="display: inline-block; background: #0284c7; color: white; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600;">বিস্তারিত দেখুন &rarr;</span>
</div>`,
    is_enabled: true,
    impressions: 14200,
    clicks: 690,
  },
  {
    id: 'ad-sticky',
    title: 'স্টিকি বটম ফ্লোটিং ব্যানার (Sticky Footer Bar)',
    slot: 'sticky_bottom',
    type: 'custom_banner',
    image_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://google.com',
    sponsor_name: 'Digital Security Guardian',
    code_html: '',
    is_enabled: true,
    impressions: 31200,
    clicks: 1450,
  }
];

export const INITIAL_EDITIONS: CountryEdition[] = [
  {
    id: 'bd',
    name_bn: 'বাংলাদেশ',
    name_en: 'Bangladesh',
    flag: '🇧🇩',
    currency_label: 'USD / BDT',
    currency_rate: '৳১২১.৫০',
    weather_temp_c: 31,
    weather_desc_bn: 'রৌদ্রোজ্জ্বল',
    weather_desc_en: 'Sunny',
    timezone: 'Asia/Dhaka (GMT+6)',
    city_bn: 'ঢাকা',
    city_en: 'Dhaka',
  },
  {
    id: 'global',
    name_bn: 'আন্তর্জাতিক সংস্করণ',
    name_en: 'Global Edition',
    flag: '🌐',
    currency_label: 'EUR / USD',
    currency_rate: '$1.085',
    weather_temp_c: 22,
    weather_desc_bn: 'মেঘলা',
    weather_desc_en: 'Partly Cloudy',
    timezone: 'UTC (GMT+0)',
    city_bn: 'লন্ডন',
    city_en: 'London',
  },
  {
    id: 'us',
    name_bn: 'যুক্তরাষ্ট্র',
    name_en: 'United States',
    flag: '🇺🇸',
    currency_label: 'GBP / USD',
    currency_rate: '$1.305',
    weather_temp_c: 24,
    weather_desc_bn: 'স্বচ্ছ আকাশ',
    weather_desc_en: 'Clear Sky',
    timezone: 'America/New_York (EST)',
    city_bn: 'নিউ ইয়র্ক',
    city_en: 'New York',
  },
  {
    id: 'uk',
    name_bn: 'যুক্তরাজ্য',
    name_en: 'United Kingdom',
    flag: '🇬🇧',
    currency_label: 'GBP / EUR',
    currency_rate: '€1.19',
    weather_temp_c: 19,
    weather_desc_bn: 'হালকা বৃষ্টি',
    weather_desc_en: 'Light Drizzle',
    timezone: 'Europe/London (GMT+1)',
    city_bn: 'লন্ডন',
    city_en: 'London',
  },
  {
    id: 'me',
    name_bn: 'মধ্যপ্রাচ্য (গালফ)',
    name_en: 'Middle East',
    flag: '🇸🇦',
    currency_label: 'SAR / BDT',
    currency_rate: '৳৩২.৪০',
    weather_temp_c: 36,
    weather_desc_bn: 'উষ্ণ আবহাওয়া',
    weather_desc_en: 'Hot & Clear',
    timezone: 'Asia/Riyadh (AST)',
    city_bn: 'রিয়াদ / দুবাই',
    city_en: 'Riyadh / Dubai',
  },
  {
    id: 'in',
    name_bn: 'ভারত',
    name_en: 'India',
    flag: '🇮🇳',
    currency_label: 'USD / INR',
    currency_rate: '₹৮৬.৮৫',
    weather_temp_c: 32,
    weather_desc_bn: 'রোদ ঝলমলে',
    weather_desc_en: 'Hazy Sun',
    timezone: 'Asia/Kolkata (IST)',
    city_bn: 'কলকাতা / দিল্লি',
    city_en: 'Kolkata / Delhi',
  },
  {
    id: 'eu',
    name_bn: 'ইউরোপীয় ইউনিয়ন',
    name_en: 'Europe',
    flag: '🇪🇺',
    currency_label: 'EUR / USD',
    currency_rate: '$1.08',
    weather_temp_c: 21,
    weather_desc_bn: 'নাতিশীতোষ্ণ',
    weather_desc_en: 'Mild',
    timezone: 'Europe/Berlin (CET)',
    city_bn: 'বার্লিন / প্যারিস',
    city_en: 'Berlin / Paris',
  },
  {
    id: 'ca',
    name_bn: 'কানাডা',
    name_en: 'Canada',
    flag: '🇨🇦',
    currency_label: 'USD / CAD',
    currency_rate: '$1.41',
    weather_temp_c: 18,
    weather_desc_bn: 'ঝকঝকে রোদ',
    weather_desc_en: 'Sunny Breaks',
    timezone: 'America/Toronto (EDT)',
    city_bn: 'টরন্টো',
    city_en: 'Toronto',
  },
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'smartphone-photography-masterclass-techniques',
    title_bn: 'স্মার্টফোনে ডিজিটাল ফটোগ্রাফি: প্রফেশনাল ছবি তোলার ৫টি মাস্টার কৌশল ও আলোর খেলা',
    title_en: 'Mastering Smartphone Photography: 5 Expert Techniques for Pro-Level Storytelling & Light',
    summary_bn: 'দামি ক্যামেরা ছাড়াই শুধু হাতের মোবাইল দিয়ে অসাধারণ পোর্ট্রেট ও ল্যান্ডস্কেপ তোলার সহজ নিয়মাবলী। ফ্রেম রুল, গোল্ডেন আওয়ার এবং এডিটিং টিপস।',
    summary_en: 'Discover how to harness golden hour lighting, composition geometry, and mobile editing tools without expensive DSLR gear.',
    content_bn: `আজকের যুগে সবার হাতেই একটি শক্তিশালী ক্যামেরা ফোন রয়েছে। কিন্তু অনেকেই ছবি তোলার সময় আলোর অবস্থান, ফ্রেম এবং পার্সপেক্টিভ সম্পর্কে সচেতন থাকেন না। ভালো ছবি তোলার জন্য মূলত যন্ত্রের চেয়ে দৃষ্টি ও নান্দনিকতা বেশি গুরুত্বপূর্ণ।

১. আলোর দিক নির্ণয় (Golden Hour):
সূর্যোদয়ের ঠিক পর এবং সূর্যাস্তের আধা ঘণ্টা আগে প্রাকৃতিক আলো সবচেয়ে নরম ও সোনালি থাকে। এই সময় মোবাইল ক্যামেরায় ছবি তুললে ছায়া ও রঙের ভারসাম্য চমৎকার আসে।

২. রুল অব থার্ডস (Rule of Thirds):
মোবাইলের ক্যামেরা সেটিংসে গিয়ে 'Grid' অন করে নিন। ছবির মূল বিষয়বস্তু ঠিক কেন্দ্রে না রেখে গ্রিডের ছেদবিন্দুগুলোতে রাখুন, এতে ছবি অনেক বেশি পেশাদার দেখায়।

৩. লেন্সের পরিচ্ছন্নতা:
একটি অতি সাধারণ কিন্তু গুরুত্বপূর্ণ বিষয় হলো পকেট বা ব্যাগে রাখার কারণে ক্যামেরার লেন্সে আঙুলের ছাপ বা ধুলাবালি লেগে থাকা। ছবি তোলার আগে মাইক্রোফাইবার বা নরম কাপড়ে লেন্স মুছে নেওয়া উচিত।

৪. এক্সপোজার লক ও ম্যানুয়াল ফোকাস:
ক্যামেরা স্ক্রিনে ট্যাপ করে আঙুল ধরে রাখলে AE/AF Lock হবে। এরপর স্লাইডার নামিয়ে এক্সপোজার কিছুটা কমিয়ে দিলে হাইলাইটগুলো পুড়ে যাবে না এবং রঙের ঘনত্ব বাড়বে।`,
    content_en: `In the modern digital era, every smartphone carries a sophisticated photographic sensor. Yet great photography is not defined by expensive hardware alone, but by your artistic eye, spatial harmony, and intentional handling of natural light.

1. Master the Golden Hour:
Shoot within the 45-minute window following dawn or preceding sunset. Soft, horizontal illumination creates warm shadows and cinematic tones that no artificial filter can replicate.

2. Compose with the Rule of Thirds:
Turn on camera grid lines. Position your subject off-center along the intersections to introduce visual tension and organic balance.

3. Keep the Lens Spotless:
Pockets and hands introduce oil films on the camera sapphire glass. A quick wipe with microfiber restores crystal-sharp edge contrast.

4. Manual Exposure Control:
Tap and hold to lock focus, then pull the brightness sun slider slightly downward. Underexposing slightly retains highlight details in skies and human skin tones.`,
    featured_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
    additional_images: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80',
    ],
    image_caption_bn: 'মোবাইল ক্যামেরায় গোল্ডেন আওয়ারের আলোর ম্যাজিক এবং পার্সপেক্টিভ কম্পোজিশন।',
    image_caption_en: 'Harnessing the golden hour luminance and architectural symmetry on mobile.',
    author_name: 'সাদমান সাকিব (Sadman Sakib)',
    author_role_bn: 'ভিজ্যুয়াল স্টোরিটেলার ও ট্রাভেল ফটোগ্রাফার',
    author_role_en: 'Visual Storyteller & Travel Photographer',
    author_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    category_name_bn: 'ফটোগ্রাফি ও জীবনধারা',
    category_name_en: 'Photography & Lifestyle',
    tags: ['Photography', 'Smartphone', 'Creative', 'Design', 'PhotoStory'],
    reading_time_minutes: 5,
    views: 4520,
    likes: 342,
    status: 'published',
    published_at: '2026-09-09T16:00:00Z',
    created_at: '2026-09-09T15:30:00Z',
    is_user_submitted: false,
    seo_title_bn: 'স্মার্টফোনে ডিজিটাল ফটোগ্রাফি: ৫টি সেরা কৌশল | ফিউচার নিউজ ব্লগ',
    seo_title_en: 'Mastering Smartphone Photography: 5 Pro Secrets | Future News Blog',
    seo_description_bn: 'হাতের স্মার্টফোন দিয়ে প্রফেশনাল লেভেলের ছবি তোলার গোপনীয়তা ও লাইটিং টিপস পড়ুন ফিউচার নিউজ ব্লগে।',
    seo_description_en: 'Learn how to take professional-grade photos with just your phone in this comprehensive photo guide.',
  },
  {
    id: 'blog-2',
    slug: 'ai-and-human-future-opportunities',
    title_bn: 'কৃত্রিম বুদ্ধিমত্তা ও ভবিষ্যৎ মানবজীবন: কাজের রূপান্তর নাকি মানবিক সৃজনশীলতার জয়যাত্রা?',
    title_en: 'Artificial Intelligence & Human Civilization: Job Automation or Golden Era of Human Creativity?',
    summary_bn: 'এআই কি সত্যিই মানুষের কর্মসংস্থান কেড়ে নেবে নাকি পুনরাবৃত্তিমূলক কাজ সহজ করে সৃজনশীল কাজের সুযোগ বাড়িয়ে দেবে? গভীর দার্শনিক ও বাস্তববাদী বিশ্লেষণ।',
    summary_en: 'An in-depth philosophical and socioeconomic exploration of how generative AI reshapes intellect, craftsmanship, and daily living.',
    content_bn: `কৃত্রিম বুদ্ধিমত্তা (AI) নিয়ে বিশ্বজুড়ে চলছে প্রবল বিতর্ক। একদল মানুষ আতঙ্কিত যে তাদের রুটি-রুজি হারিয়ে যাবে, অন্যদল এটিকে দেখছেন উৎপাদনশীলতার ইতিহাসে সবচেয়ে বড় বিপ্লব হিসেবে।

ইতিহাস আমাদের বলে, বাষ্পীয় ইঞ্জিন কিংবা ইন্টারনেটের আবিষ্কারেও মানুষ ভেবেছিল কাজ কমে যাবে। বাস্তবে সেগুলো নতুন লক্ষ লক্ষ উচ্চমানের পেশা সৃষ্টি করেছিল। এআই মূলত মানুষের মেধা প্রতিস্থাপন করছে না, বরং চিন্তাশক্তিকে দশগুণ বাড়িয়ে দিচ্ছে।

আজকের প্রোগ্রামার, ডিজাইনার বা লেখক যদি এআই-কে সহচর হিসেবে ব্যবহার করেন, তবে তারা সাধারণ রুটিন কাজ কয়েক সেকেন্ডে শেষ করে মৌলিক উদ্ভাবনে সময় দিতে পারেন।`,
    content_en: `The rapid ascent of cognitive AI and generative agents sparks both acute anxiety and boundless optimism across global industries.

Historical precedent confirms that whenever transformative general-purpose technologies emerge—from mechanical looms to semiconductor computing—initial labor dislocations pave the path for higher-leverage creative paradigms.

AI does not eradicate human agency; it amplifies baseline capability. Professionals embracing algorithmic co-pilots redirect mundane hours toward architectural judgment, ethics, and authentic emotional narrative.`,
    featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    additional_images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80'
    ],
    image_caption_bn: 'মানুষ ও কৃত্রিম মেধার যৌথ সহযোগিতায় রচিত হচ্ছে আগামী শতকের রূপরেখা।',
    image_caption_en: 'The symbioses between human intuition and synthetic machine cognition.',
    author_name: 'অধ্যাপক ড. রিয়াজ উদ্দিন (Dr. Riaz Uddin)',
    author_role_bn: 'প্রযুক্তি দার্শনিক ও কলামিস্ট',
    author_role_en: 'Tech Philosopher & Columnist',
    author_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    category_name_bn: 'মতামত ও বিশ্লেষণ',
    category_name_en: 'Opinion & Insights',
    tags: ['Artificial Intelligence', 'Future of Work', 'Philosophy', 'TechTrend'],
    reading_time_minutes: 6,
    views: 6180,
    likes: 512,
    status: 'published',
    published_at: '2026-09-08T19:00:00Z',
    created_at: '2026-09-08T18:00:00Z',
    is_user_submitted: false,
    seo_title_bn: 'এআই ও ভবিষ্যৎ মানবজীবন: নতুন বিপ্লবের শুরু | ফিউচার নিউজ',
    seo_title_en: 'AI & The Human Future: The Evolution of Creativity | Future News',
    seo_description_bn: 'কৃত্রিম বুদ্ধিমত্তার প্রভাবে ভবিষ্যৎ কর্মজীবন ও সৃজনশীলতার রূপান্তর নিয়ে গভীর বিশ্লেষণ।',
    seo_description_en: 'Deep perspective on how generative artificial intelligence impacts employment and culture.',
  },
  {
    id: 'blog-3',
    slug: 'travel-sajek-valley-clouds-adventure',
    title_bn: 'ভ্রমণ কথকতা: মেঘের দেশে সাজেক ভ্যালি ও পাহাড়ের নীরব গান — সম্পূর্ণ গাইড ও ফটো ডায়েরি',
    title_en: 'Travel Memoir: Sajek Valley - Floating Above Clouds in the Lush Hills of Rangamati',
    summary_bn: 'পাহাড়ের বাঁকে মেঘের আলিঙ্গন, হেলিপ্যাড থেকে সূর্যাস্তের রঙধনু এবং আদিবাসী সংস্কৃতির আন্তরিক রূপ নিয়ে সাজেক ভ্রমণের পূর্ণাঙ্গ গল্প ও আলোকচিত্র।',
    summary_en: 'A visual travelogue from the misty peaks of Sajek Valley, featuring sunrise vistas, local culinary delights, and trail memories.',
    content_bn: `দীঘিনালা থেকে যখন চাঁদের গাড়ি পাহাড়ি আঁকাবাঁকা পথ বেয়ে সাজেকের দিকে ছুটতে শুরু করে, তখন থেকেই শুরু হয় রোমাঞ্চ। চারপাশে দিগন্তজোড়া সবুজ পাহাড় আর মাথার ওপরে তুলোর মতো ভাসমান মেঘ।

সাজেকের রুইলুই পাড়ায় পৌঁছানোর পর মনে হয় সময় যেন থমকে গেছে। ভোরে যখন কুয়াশা আর মেঘ ব্যালকনি ছুঁয়ে যায়, সেই অনুভূতি ভাষায় প্রকাশ করার মতো নয়।

ভ্রমণপিপাসুদের জন্য কিছু পরামর্শ:
১. কংলাক পাহাড়ের চূড়ায় ওঠার জন্য ভোরে রওনা দিন, মেঘের সমুদ্র তখন সবচেয়ে সুন্দর দেখা যায়।
২. স্থানীয় ব্যাম্বু চিকেন ও পাহাড়ি পেঁপের জুস চেখে দেখতে ভুলবেন না।
৩. প্রকৃতির পবিত্রতা রক্ষা করুন, প্লাস্টিক বা ময়লা পাহাড়ে ফেলবেন না।`,
    content_en: `Ascending the winding mountain road from Dighinala aboard an open-top safari truck initiates pure exhilaration. Crisp mountain air rushes past as layered emerald peaks unveil themselves beneath drifting ivory clouds.

Rongamoti’s Sajek Valley offers an ethereal sensation of serenity. Dawn unveils an ocean of fog gently cradling the wooden cottages perched along the ridge.

Travel Recommendations:
1. Trek to Konglak Peak at first twilight to witness unbroken 360-degree vistas of the hill tract horizons.
2. Savor regional delicacies including roasted bamboo chicken and fresh highland papayas.
3. Practice zero-trace ecotourism: keep all plastics and litter off sacred hill terrains.`,
    featured_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    additional_images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80'
    ],
    image_caption_bn: 'কংলাক পাহাড়ের চূড়া থেকে দেখা সাজেকের মেঘের অনন্ত সমুদ্র।',
    image_caption_en: 'Endless ocean of clouds stretching over the Konglak mountain ridge.',
    author_name: 'তানিয়া সুলতানা (Tania Sultana)',
    author_role_bn: 'ভ্রমণ লেখক ও ট্রেকার',
    author_role_en: 'Travel Writer & Trekker',
    author_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    category_name_bn: 'ভ্রমণ ও রোমাঞ্চ',
    category_name_en: 'Travel & Nature',
    tags: ['Travel', 'SajekValley', 'Tourism', 'Bangladesh', 'Adventure'],
    reading_time_minutes: 4,
    views: 8940,
    likes: 720,
    status: 'published',
    published_at: '2026-09-07T14:00:00Z',
    created_at: '2026-09-07T12:00:00Z',
    is_user_submitted: false,
    seo_title_bn: 'সাজেক ভ্যালি ভ্রমণ গাইড ও ফটো ডায়েরি | ফিউচার নিউজ ব্লগ',
    seo_title_en: 'Sajek Valley Complete Travelogue & Guide | Future News',
    seo_description_bn: 'পাহাড় আর মেঘের মিলনমেলা সাজেক ভ্রমণের রোমাঞ্চকর বিবরণ ও গাইড।',
    seo_description_en: 'Comprehensive guide to exploring Sajek Valley, Bangladesh - trekking, culture, and photography.',
  }
];

