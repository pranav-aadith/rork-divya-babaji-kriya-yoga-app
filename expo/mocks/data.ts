export interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  duration: string;
  level: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  category: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  isOnline: boolean;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export const dailyQuotes: Quote[] = [
  {
    id: "1",
    text: "Attaining inner peace can bring peace to the world; attaining inner harmony can bring harmony to the world; attaining inner bliss can bring glory to the entire world.",
    author: "Pujya Guru Mahavatar Babaji",
  },
  {
    id: "2",
    text: "Sushumna Kriya Yoga is a powerful and ancient meditation technique gifted by Siddha Masters for the spiritual upliftment of humanity.",
    author: "Divya Babaji Sushumna Kriya Yoga Foundation",
  },
  {
    id: "3",
    text: "Spread the message of universal love, peace, and harmony.",
    author: "Foundation Mission",
  },
  {
    id: "4",
    text: "Awaken the invincible hidden power within human beings to construct the modern spiritual world.",
    author: "Foundation Mission",
  },
  {
    id: "5",
    text: "Initiate everyone into the practice of Sushumna Kriya Yoga without discrimination.",
    author: "Foundation Mission",
  },
];

export const programs: Program[] = [
  {
    id: "1",
    title: "Sushumna Kriya Yoga",
    subtitle: "The Core Meditation Practice",
    description:
      "Sushumna Kriya Yoga is a powerful and ancient meditation technique gifted by Siddha Masters, notably Pujya Guru Bhoga Siddhar and Pujya Guru Mahavatar Babaji, and transmitted through Pujya Guruma Aathmanandamayi. This transformative practice serves as a pathway to self-realization and inner transformation, helping practitioners achieve well-being at all levels — physical, mental, and spiritual.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    duration: "Ongoing",
    level: "All Levels",
  },
  {
    id: "2",
    title: "Sushumna Vani",
    subtitle: "The Voice of Sushumna Kriya",
    description:
      "Sushumna Vani is a podcast series about Sushumna Kriya Meditation and its profound impact on life. Available in English, Hindi, and Telugu, these teachings guide listeners through the sacred knowledge and lived experiences of the Kriya Yoga tradition. Welcome to the blissful journey of inner discovery.",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b9fc3366?w=800",
    duration: "Multiple episodes",
    level: "All Levels",
  },
  {
    id: "3",
    title: "Sushumna Sikshana",
    subtitle: "Holistic Education for Children",
    description:
      "An initiative by Mataji Pujyasri Aathmanandamayi to introduce young minds into Sanatana Dharma. These weekly sessions develop children's spiritual, moral, cultural, and ethical values — including honesty, integrity, empathy, and cultural appreciation. Sessions include Shlokas, Bhajans, storytelling, crafts, drawing, puzzles, games, and meditation to help children lead a healthy, happy, and joyous life. Sushumna Prathamik Sikshana is for ages 5–8 (Telugu, Saturday), and Sushumna Bala Sikshana is for ages 8–14 (English, Saturday).",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb17ddb9?w=800",
    duration: "Weekly sessions",
    level: "Ages 5–14",
  },
  {
    id: "4",
    title: "Sushumna Garbha Sanskaar",
    subtitle: "Vedic Prenatal Guidance",
    description:
      "Sushumna Garbha Sanskaar is a sacred program of Vedic Genetic Engineering, offering prenatal lifestyle guidance for expecting mothers. Through meditation, mantras, and positive spiritual practices, this program nurtures the spiritual and holistic development of the unborn child, connecting the mother and baby to ancient wisdom and divine energy.",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800",
    duration: "Throughout pregnancy",
    level: "Expecting Mothers",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "The Lineage of Sushumna Kriya Yoga",
    excerpt:
      "Sushumna Kriya Yoga is transmitted from Siddha Masters including Pujya Guru Bhoga Siddhar and Pujya Guru Mahavatar Babaji, through Pujya Guruma Aathmanandamayi. Explore the sacred lineage that carries this ancient meditation technique.",
    image:
      "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800",
    readTime: "6 min read",
    category: "History",
    date: "2024-06-01",
  },
  {
    id: "2",
    title: "The Divya Babaji Sushumna Kriya Yoga Foundation",
    excerpt:
      "Founded in 2005 by Pujya Guruma Aathmanandamayi Amma, the Foundation introduces Sushumna Kriya Yoga meditation to the world, aiming to help individuals achieve well-being at all levels. With thousands of followers worldwide, it has become a divine path for seekers.",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
    readTime: "5 min read",
    category: "About",
    date: "2024-05-20",
  },
  {
    id: "3",
    title: "The Mission and Vision of the Foundation",
    excerpt:
      "Spread the message of universal love, peace, and harmony. Strive for the holistic well-being of all humanity. Awaken the invincible hidden power within. Promote noble actions by propagating meditation. Learn about the guiding principles of the Foundation.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    readTime: "7 min read",
    category: "Philosophy",
    date: "2024-05-10",
  },
  {
    id: "4",
    title: "Live Online Meditation Sessions",
    excerpt:
      "Join live online meditation sessions available across multiple regions — India, UAE, Australia, and USA. Find a live meditation closest to you and begin your blissful journey with Sushumna Kriya Yoga.",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
    readTime: "4 min read",
    category: "Practice",
    date: "2024-04-28",
  },
  {
    id: "5",
    title: "The Power of Sushumna Kriya Meditation",
    excerpt:
      "Sushumna Kriya Yoga is described as a pathway to self-realization and inner transformation. Discover how this ancient technique, gifted by Siddha Masters, can bring well-being to all levels of your life and help you attain inner peace, harmony, and bliss.",
    image:
      "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800",
    readTime: "8 min read",
    category: "Philosophy",
    date: "2024-04-15",
  },
];

export const events: Event[] = [
  {
    id: "1",
    title: "Live Online Meditation — India",
    description:
      "Join a live online Sushumna Kriya Yoga meditation session conducted for practitioners in India. Experience the transformative power of group meditation and deepen your practice with guidance from the Foundation.",
    date: "2024-07-20",
    time: "6:00 PM IST",
    location: "Online via Zoom",
    image:
      "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800",
    isOnline: true,
  },
  {
    id: "2",
    title: "Live Online Meditation — USA",
    description:
      "A live online meditation session for practitioners in the USA. Join the community of Sushumna Kriya Yoga practitioners and experience the blissful journey of inner transformation.",
    date: "2024-07-27",
    time: "9:00 AM EST",
    location: "Online via Zoom",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    isOnline: true,
  },
  {
    id: "3",
    title: "Guru Purnima Celebration",
    description:
      "A special occasion celebrating the sacred guru-shishya tradition. Join us for meditation, chanting, and spiritual discourse as we honor the lineage of Pujya Guru Mahavatar Babaji, Pujya Guru Bhoga Siddhar, and Pujya Guruma Aathmanandamayi.",
    date: "2024-07-21",
    time: "6:00 PM onwards",
    location: "Ashram & Online",
    image:
      "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800",
    isOnline: false,
  },
  {
    id: "4",
    title: "Initiation & Public Class — India",
    description:
      "An initiation ceremony and public class for those new to Sushumna Kriya Yoga. The Foundation conducts sessions extensively across India for spiritual upliftment. Learn about the practice, its benefits, and begin your journey.",
    date: "2024-08-10",
    time: "10:00 AM - 12:00 PM",
    location: "Multiple centers across India",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
    isOnline: false,
  },
];

export const getRandomQuote = (): Quote => {
  const index = Math.floor(Math.random() * dailyQuotes.length);
  return dailyQuotes[index];
};
