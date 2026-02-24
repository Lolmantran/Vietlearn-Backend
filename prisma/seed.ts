import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Core Vocabulary — 30 essential words
// ---------------------------------------------------------------------------
const coreWords = [
  { word: 'xin chào', pronunciation: 'sin chow', meaning: 'hello / hi', partOfSpeech: 'interjection', exampleSentence: 'Xin chào! Bạn khoẻ không?' },
  { word: 'tạm biệt', pronunciation: 'tahm byeht', meaning: 'goodbye', partOfSpeech: 'expression', exampleSentence: 'Tạm biệt! Hẹn gặp lại.' },
  { word: 'cảm ơn', pronunciation: 'kahm uhn', meaning: 'thank you', partOfSpeech: 'expression', exampleSentence: 'Cảm ơn bạn rất nhiều.' },
  { word: 'xin lỗi', pronunciation: 'sin loy', meaning: 'sorry / excuse me', partOfSpeech: 'expression', exampleSentence: 'Xin lỗi, tôi không hiểu.' },
  { word: 'vâng', pronunciation: 'vuhng', meaning: 'yes (polite)', partOfSpeech: 'interjection', exampleSentence: 'Vâng, tôi hiểu rồi.' },
  { word: 'không', pronunciation: 'khohng', meaning: 'no / not', partOfSpeech: 'adverb', exampleSentence: 'Tôi không biết.' },
  { word: 'tôi', pronunciation: 'toy', meaning: 'I / me', partOfSpeech: 'pronoun', exampleSentence: 'Tôi là sinh viên.' },
  { word: 'bạn', pronunciation: 'bahn', meaning: 'you / friend', partOfSpeech: 'pronoun', exampleSentence: 'Bạn tên là gì?' },
  { word: 'ăn', pronunciation: 'an (low rising)', meaning: 'to eat', partOfSpeech: 'verb', exampleSentence: 'Bạn muốn ăn gì không?' },
  { word: 'uống', pronunciation: 'oong (falling)', meaning: 'to drink', partOfSpeech: 'verb', exampleSentence: 'Tôi muốn uống nước.' },
  { word: 'đi', pronunciation: 'dee', meaning: 'to go', partOfSpeech: 'verb', exampleSentence: 'Chúng ta đi thôi!' },
  { word: 'về', pronunciation: 'veh (falling)', meaning: 'to return / go home', partOfSpeech: 'verb', exampleSentence: 'Tôi muốn về nhà.' },
  { word: 'mua', pronunciation: 'moo-ah', meaning: 'to buy', partOfSpeech: 'verb', exampleSentence: 'Tôi muốn mua cái này.' },
  { word: 'bán', pronunciation: 'bahn (falling)', meaning: 'to sell', partOfSpeech: 'verb', exampleSentence: 'Họ bán trái cây ở đây.' },
  { word: 'học', pronunciation: 'hawk (short)', meaning: 'to study / learn', partOfSpeech: 'verb', exampleSentence: 'Tôi học tiếng Việt.' },
  { word: 'làm', pronunciation: 'lahm', meaning: 'to do / to work', partOfSpeech: 'verb', exampleSentence: 'Bạn làm gì?' },
  { word: 'nói', pronunciation: 'noy', meaning: 'to speak / to say', partOfSpeech: 'verb', exampleSentence: 'Bạn nói tiếng Anh không?' },
  { word: 'nghe', pronunciation: 'ngeh', meaning: 'to listen / to hear', partOfSpeech: 'verb', exampleSentence: 'Tôi nghe nhạc mỗi ngày.' },
  { word: 'đọc', pronunciation: 'dahk', meaning: 'to read', partOfSpeech: 'verb', exampleSentence: 'Tôi đọc sách mỗi tối.' },
  { word: 'viết', pronunciation: 'vyeht', meaning: 'to write', partOfSpeech: 'verb', exampleSentence: 'Bạn có thể viết tên của bạn không?' },
  { word: 'nhà', pronunciation: 'nyah', meaning: 'house / home', partOfSpeech: 'noun', exampleSentence: 'Nhà tôi ở gần đây.' },
  { word: 'nước', pronunciation: 'noock (falling)', meaning: 'water / country', partOfSpeech: 'noun', exampleSentence: 'Cho tôi xin một ly nước.' },
  { word: 'ngày', pronunciation: 'ngay', meaning: 'day', partOfSpeech: 'noun', exampleSentence: 'Hôm nay là ngày mấy?' },
  { word: 'hôm nay', pronunciation: 'hohm nay', meaning: 'today', partOfSpeech: 'adverb', exampleSentence: 'Hôm nay thời tiết rất đẹp.' },
  { word: 'giờ', pronunciation: 'yuh (hook)', meaning: 'hour / now / o\'clock', partOfSpeech: 'noun', exampleSentence: 'Bây giờ là mấy giờ?' },
  { word: 'tiền', pronunciation: 'tyehn', meaning: 'money', partOfSpeech: 'noun', exampleSentence: 'Bao nhiêu tiền?' },
  { word: 'người', pronunciation: 'nguh-oy', meaning: 'person / people', partOfSpeech: 'noun', exampleSentence: 'Có bao nhiêu người?' },
  { word: 'biết', pronunciation: 'byeht (falling)', meaning: 'to know', partOfSpeech: 'verb', exampleSentence: 'Tôi không biết.' },
  { word: 'muốn', pronunciation: 'moo-uhn (falling)', meaning: 'to want', partOfSpeech: 'verb', exampleSentence: 'Tôi muốn học tiếng Việt.' },
  { word: 'hiểu', pronunciation: 'hyeh-oo', meaning: 'to understand', partOfSpeech: 'verb', exampleSentence: 'Tôi không hiểu câu này.' },
];

// ---------------------------------------------------------------------------
// Travel & Navigation — 20 words
// ---------------------------------------------------------------------------
const travelWords = [
  { word: 'sân bay', pronunciation: 'suhn bay', meaning: 'airport', partOfSpeech: 'noun', exampleSentence: 'Sân bay cách đây bao xa?' },
  { word: 'ga tàu', pronunciation: 'gah tow', meaning: 'train station', partOfSpeech: 'noun', exampleSentence: 'Ga tàu ở đâu?' },
  { word: 'khách sạn', pronunciation: 'khahk sahn', meaning: 'hotel', partOfSpeech: 'noun', exampleSentence: 'Tôi muốn đặt phòng khách sạn.' },
  { word: 'taxi', pronunciation: 'tahk-see', meaning: 'taxi', partOfSpeech: 'noun', exampleSentence: 'Gọi taxi cho tôi nhé.' },
  { word: 'xe buýt', pronunciation: 'seh bwit', meaning: 'bus', partOfSpeech: 'noun', exampleSentence: 'Xe buýt số mấy đi trung tâm?' },
  { word: 'đường', pronunciation: 'doong (rising)', meaning: 'road / street', partOfSpeech: 'noun', exampleSentence: 'Đường này đến đâu vậy?' },
  { word: 'trái', pronunciation: 'chay', meaning: 'left', partOfSpeech: 'adjective', exampleSentence: 'Rẽ trái ở ngã tư.' },
  { word: 'phải', pronunciation: 'fai', meaning: 'right', partOfSpeech: 'adjective', exampleSentence: 'Rẽ phải rồi đi thẳng.' },
  { word: 'thẳng', pronunciation: 'thahng (falling)', meaning: 'straight ahead', partOfSpeech: 'adverb', exampleSentence: 'Đi thẳng khoảng 200 mét.' },
  { word: 'dừng lại', pronunciation: 'yung lie', meaning: 'stop / stop here', partOfSpeech: 'verb', exampleSentence: 'Dừng lại ở đây cho tôi nhé.' },
  { word: 'vé', pronunciation: 'veh (falling)', meaning: 'ticket', partOfSpeech: 'noun', exampleSentence: 'Tôi muốn mua vé một chiều.' },
  { word: 'hộ chiếu', pronunciation: 'hoh chyeh-oo', meaning: 'passport', partOfSpeech: 'noun', exampleSentence: 'Cho tôi xem hộ chiếu.' },
  { word: 'bản đồ', pronunciation: 'bahn doh', meaning: 'map', partOfSpeech: 'noun', exampleSentence: 'Bạn có bản đồ không?' },
  { word: 'giúp', pronunciation: 'yoop', meaning: 'to help', partOfSpeech: 'verb', exampleSentence: 'Bạn có thể giúp tôi không?' },
  { word: 'bao nhiêu', pronunciation: 'bow nyeh-oo', meaning: 'how much / how many', partOfSpeech: 'phrase', exampleSentence: 'Cái này bao nhiêu tiền?' },
  { word: 'ở đâu', pronunciation: 'uh dow', meaning: 'where (is it)?', partOfSpeech: 'phrase', exampleSentence: 'Nhà vệ sinh ở đâu?' },
  { word: 'xa', pronunciation: 'sah', meaning: 'far', partOfSpeech: 'adjective', exampleSentence: 'Còn xa không?' },
  { word: 'gần', pronunciation: 'guhn (hook)', meaning: 'near / close', partOfSpeech: 'adjective', exampleSentence: 'Trạm xe buýt gần đây thôi.' },
  { word: 'bên phải', pronunciation: 'behn fai', meaning: 'on the right', partOfSpeech: 'phrase', exampleSentence: 'Khách sạn ở bên phải.' },
  { word: 'bên trái', pronunciation: 'behn chay', meaning: 'on the left', partOfSpeech: 'phrase', exampleSentence: 'Ngân hàng ở bên trái.' },
];

// ---------------------------------------------------------------------------
// Food & Dining — 20 words
// ---------------------------------------------------------------------------
const foodWords = [
  { word: 'phở', pronunciation: 'fuh (hook)', meaning: 'pho — Vietnamese beef noodle soup', partOfSpeech: 'noun', exampleSentence: 'Cho tôi một tô phở bò.' },
  { word: 'cơm', pronunciation: 'kuhm', meaning: 'cooked rice', partOfSpeech: 'noun', exampleSentence: 'Tôi muốn ăn cơm chiên.' },
  { word: 'bánh mì', pronunciation: 'banh mee', meaning: 'Vietnamese baguette sandwich', partOfSpeech: 'noun', exampleSentence: 'Bánh mì ở đây rất ngon.' },
  { word: 'bún bò', pronunciation: 'boon boh', meaning: 'beef noodle soup (Hue style)', partOfSpeech: 'noun', exampleSentence: 'Bún bò Huế cay hơn phở.' },
  { word: 'chả giò', pronunciation: 'chah yoh', meaning: 'fried spring rolls', partOfSpeech: 'noun', exampleSentence: 'Chả giò giòn rụm rất ngon.' },
  { word: 'cà phê', pronunciation: 'kah feh', meaning: 'coffee', partOfSpeech: 'noun', exampleSentence: 'Cho tôi một ly cà phê đen.' },
  { word: 'trà', pronunciation: 'chah', meaning: 'tea', partOfSpeech: 'noun', exampleSentence: 'Bạn uống trà hay cà phê?' },
  { word: 'ngon', pronunciation: 'ngawn', meaning: 'delicious / tasty', partOfSpeech: 'adjective', exampleSentence: 'Món này thật ngon!' },
  { word: 'chay', pronunciation: 'chay', meaning: 'vegetarian', partOfSpeech: 'adjective', exampleSentence: 'Tôi ăn chay, không ăn thịt.' },
  { word: 'cay', pronunciation: 'kay', meaning: 'spicy / hot', partOfSpeech: 'adjective', exampleSentence: 'Đừng cho quá nhiều ớt, cay lắm.' },
  { word: 'ngọt', pronunciation: 'ngawt', meaning: 'sweet', partOfSpeech: 'adjective', exampleSentence: 'Món tráng miệng này rất ngọt.' },
  { word: 'chua', pronunciation: 'choo-ah', meaning: 'sour', partOfSpeech: 'adjective', exampleSentence: 'Canh chua cá là món tôi thích.' },
  { word: 'mặn', pronunciation: 'mahn (falling)', meaning: 'salty', partOfSpeech: 'adjective', exampleSentence: 'Món này mặn quá, ít muối vào nhé.' },
  { word: 'thực đơn', pronunciation: 'thuk duhn', meaning: 'menu', partOfSpeech: 'noun', exampleSentence: 'Cho tôi xem thực đơn được không?' },
  { word: 'tính tiền', pronunciation: 'ting tyehn', meaning: 'bill please / calculate the bill', partOfSpeech: 'phrase', exampleSentence: 'Tính tiền cho tôi nhé.' },
  { word: 'rau', pronunciation: 'row', meaning: 'vegetables / herbs', partOfSpeech: 'noun', exampleSentence: 'Cho thêm rau vào phở nhé.' },
  { word: 'thịt', pronunciation: 'tiht', meaning: 'meat', partOfSpeech: 'noun', exampleSentence: 'Bạn thích thịt bò hay thịt gà?' },
  { word: 'cá', pronunciation: 'kah (falling)', meaning: 'fish', partOfSpeech: 'noun', exampleSentence: 'Cá này tươi không?' },
  { word: 'tôm', pronunciation: 'tohm', meaning: 'shrimp / prawns', partOfSpeech: 'noun', exampleSentence: 'Tôm nướng rất ngon.' },
  { word: 'bia', pronunciation: 'byah', meaning: 'beer', partOfSpeech: 'noun', exampleSentence: 'Cho tôi hai chai bia lạnh.' },
];

// ---------------------------------------------------------------------------
// Business Vietnamese — 20 words
// ---------------------------------------------------------------------------
const businessWords = [
  { word: 'cuộc họp', pronunciation: 'kwawk hawp', meaning: 'meeting', partOfSpeech: 'noun', exampleSentence: 'Cuộc họp bắt đầu lúc 9 giờ.' },
  { word: 'văn phòng', pronunciation: 'van fohng', meaning: 'office', partOfSpeech: 'noun', exampleSentence: 'Văn phòng chúng tôi ở tầng 5.' },
  { word: 'công ty', pronunciation: 'kohng tee', meaning: 'company', partOfSpeech: 'noun', exampleSentence: 'Công ty chúng tôi có 200 nhân viên.' },
  { word: 'hợp đồng', pronunciation: 'huhp dohng', meaning: 'contract', partOfSpeech: 'noun', exampleSentence: 'Vui lòng ký vào hợp đồng.' },
  { word: 'dự án', pronunciation: 'yoo ahn (falling)', meaning: 'project', partOfSpeech: 'noun', exampleSentence: 'Dự án này sẽ hoàn thành vào tháng 3.' },
  { word: 'khách hàng', pronunciation: 'khahk hahng', meaning: 'client / customer', partOfSpeech: 'noun', exampleSentence: 'Khách hàng rất hài lòng.' },
  { word: 'đồng nghiệp', pronunciation: 'dohng nyehp', meaning: 'colleague', partOfSpeech: 'noun', exampleSentence: 'Tôi giới thiệu đồng nghiệp của tôi.' },
  { word: 'giám đốc', pronunciation: 'yahm dohk', meaning: 'director / manager', partOfSpeech: 'noun', exampleSentence: 'Giám đốc sẽ có mặt trong cuộc họp.' },
  { word: 'báo cáo', pronunciation: 'bow kow', meaning: 'report', partOfSpeech: 'noun', exampleSentence: 'Nộp báo cáo trước thứ Sáu.' },
  { word: 'hội nghị', pronunciation: 'hoy ngee (hook)', meaning: 'conference', partOfSpeech: 'noun', exampleSentence: 'Tôi tham dự hội nghị quốc tế.' },
  { word: 'email', pronunciation: 'ee-mayl', meaning: 'email', partOfSpeech: 'noun', exampleSentence: 'Vui lòng gửi email cho tôi.' },
  { word: 'lịch', pronunciation: 'lik', meaning: 'schedule / calendar', partOfSpeech: 'noun', exampleSentence: 'Kiểm tra lịch của bạn đi.' },
  { word: 'deadline', pronunciation: 'ded-layn', meaning: 'deadline', partOfSpeech: 'noun', exampleSentence: 'Deadline là ngày mai.' },
  { word: 'ngân sách', pronunciation: 'nguhn sahk', meaning: 'budget', partOfSpeech: 'noun', exampleSentence: 'Ngân sách dự án là 50 triệu.' },
  { word: 'lợi nhuận', pronunciation: 'loy nyoo-uhn', meaning: 'profit', partOfSpeech: 'noun', exampleSentence: 'Lợi nhuận quý này tăng 20%.' },
  { word: 'đối tác', pronunciation: 'doy tahk', meaning: 'business partner', partOfSpeech: 'noun', exampleSentence: 'Chúng tôi có đối tác ở Nhật Bản.' },
  { word: 'thương lượng', pronunciation: 'thoong loong', meaning: 'to negotiate', partOfSpeech: 'verb', exampleSentence: 'Chúng ta cần thương lượng về giá.' },
  { word: 'ký kết', pronunciation: 'kee keht', meaning: 'to sign / conclude (a deal)', partOfSpeech: 'verb', exampleSentence: 'Hai bên sẽ ký kết hợp đồng hôm nay.' },
  { word: 'thuyết trình', pronunciation: 'twyet ching', meaning: 'presentation', partOfSpeech: 'noun', exampleSentence: 'Bạn có thể thuyết trình về dự án không?' },
  { word: 'nhân viên', pronunciation: 'nyuhn vyehn', meaning: 'employee / staff', partOfSpeech: 'noun', exampleSentence: 'Nhân viên mới bắt đầu hôm nay.' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Create decks ──────────────────────────────────────────────────────────
  const decks = await Promise.all([
    prisma.deck.upsert({
      where: { id: 'deck-core-01' },
      update: {},
      create: {
        id: 'deck-core-01',
        name: 'Core Vocabulary',
        deckType: 'CORE',
        description: 'The 500 most essential Vietnamese words for everyday life',
      },
    }),
    prisma.deck.upsert({
      where: { id: 'deck-travel-01' },
      update: {},
      create: {
        id: 'deck-travel-01',
        name: 'Travel & Navigation',
        deckType: 'TRAVEL',
        description: 'Everything you need for travelling in Vietnam',
      },
    }),
    prisma.deck.upsert({
      where: { id: 'deck-food-01' },
      update: {},
      create: {
        id: 'deck-food-01',
        name: 'Food & Dining',
        deckType: 'CUSTOM',
        description: 'Order food, describe tastes, and talk about Vietnamese cuisine',
      },
    }),
    prisma.deck.upsert({
      where: { id: 'deck-business-01' },
      update: {},
      create: {
        id: 'deck-business-01',
        name: 'Business Vietnamese',
        deckType: 'BUSINESS',
        description: 'Professional vocabulary for the workplace and meetings',
      },
    }),
  ]);

  console.log(`✅ Created ${decks.length} decks`);

  // ── Create flashcards ─────────────────────────────────────────────────────
  const deckWordPairs = [
    { deckId: 'deck-core-01', words: coreWords },
    { deckId: 'deck-travel-01', words: travelWords },
    { deckId: 'deck-food-01', words: foodWords },
    { deckId: 'deck-business-01', words: businessWords },
  ];

  let totalCards = 0;
  for (const { deckId, words } of deckWordPairs) {
    for (const w of words) {
      await prisma.flashcard.upsert({
        where: { id: `card-${deckId}-${w.word.replace(/\s+/g, '-')}` },
        update: { partOfSpeech: w.partOfSpeech },
        create: {
          id: `card-${deckId}-${w.word.replace(/\s+/g, '-')}`,
          deckId,
          word: w.word,
          pronunciation: w.pronunciation,
          meaning: w.meaning,
          partOfSpeech: w.partOfSpeech,
          exampleSentence: w.exampleSentence,
        },
      });
      totalCards++;
    }
  }

  console.log(`✅ Created ${totalCards} flashcards`);
  console.log('🎉 Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
