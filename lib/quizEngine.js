// quizEngine.js - Bo tao cau hoi Giai Do Tri Thuc (Toan & Khoa hoc tu nhien tu Lop 1 - 12)
// Chia ro rang theo cap hoc va mon hoc.

// -------------------------------------------------------------
// 1. TOAN HOC: CAP 1 (LOP 1 - 5)
// Cong tru nhan chia co ban, tim x, toan meo nhanh phan xa
// -------------------------------------------------------------
const MATH_GRADE_1_5_TRICKS = [
  {
    q: "Một đàn vịt: 1 con đi trước 2 con, 1 con đi sau 2 con, 1 con đi giữa 2 con. Hỏi đàn vịt có mấy con?",
    options: ["3 con", "4 con", "5 con", "6 con"],
    ans: 0,
    exp: "Chỉ có 3 con vịt đi theo hàng dọc: con thứ nhất đi trước 2 con sau, con thứ ba đi sau 2 con trước, con thứ hai đi giữa!",
  },
  {
    q: "Một cây nến cháy trong 10 phút. Hỏi 5 cây nến thắp cùng một lúc thì cháy hết trong mấy phút?",
    options: ["10 phút", "50 phút", "2 phút", "25 phút"],
    ans: 0,
    exp: "Thắp cùng một lúc thì tất cả 5 cây nến đều cháy đồng thời và cùng tắt sau 10 phút!",
  },
  {
    q: "Có 10 con chim đậu trên cành cây. Người thợ săn bắn rơi 1 con. Hỏi trên cành cây còn lại mấy con?",
    options: ["0 con", "9 con", "8 con", "1 con"],
    ans: 0,
    exp: "Khi tiếng súng nổ, 9 con chim còn lại giật mình và bay đi hết, không còn con nào trên cành!",
  },
  {
    q: "Một hình vuông có chu vi là 36 cm. Diện tích của hình vuông đó là bao nhiêu?",
    options: ["81 cm²", "36 cm²", "72 cm²", "144 cm²"],
    ans: 0,
    exp: "Cạnh hình vuông = 36 : 4 = 9 cm. Diện tích = 9 x 9 = 81 cm².",
  },
  {
    q: "Mẹo tính nhanh: 35 x 11 bằng bao nhiêu?",
    options: ["385", "375", "395", "355"],
    ans: 0,
    exp: "Mẹo nhân với 11: Lấy 3 + 5 = 8 chèn vào giữa số 3 và 5 => 385.",
  },
  {
    q: "Một đoàn tàu chạy với vận tốc 60 km/h. Trong 2 giờ 30 phút tàu chạy được quãng đường là:",
    options: ["150 km", "120 km", "180 km", "140 km"],
    ans: 0,
    exp: "2 giờ 30 phút = 2.5 giờ. Quãng đường = 60 x 2.5 = 150 km.",
  },
  {
    q: "Số nào sau đây chia hết cho cả 2, 3 và 5?",
    options: ["180", "145", "172", "190"],
    ans: 0,
    exp: "Số chia hết cho 2 và 5 tận cùng là 0. Chia hết cho 3 thì tổng các chữ số chia hết cho 3. 180 có 1+8+0=9 chia hết cho 3!",
  },
  {
    q: "Tam giác có đáy 12 cm, chiều cao tương ứng 8 cm. Diện tích hình tam giác là:",
    options: ["48 cm²", "96 cm²", "24 cm²", "60 cm²"],
    ans: 0,
    exp: "Diện tích tam giác = (đáy x chiều cao) : 2 = (12 x 8) : 2 = 48 cm².",
  },
];

function generateMathGrade1_5() {
  const mode = Math.random() < 0.4 ? 'trick' : (Math.random() < 0.7 ? 'find_x' : 'arithmetic');
  if (mode === 'trick') {
    const item = MATH_GRADE_1_5_TRICKS[Math.floor(Math.random() * MATH_GRADE_1_5_TRICKS.length)];
    const opts = [...item.options];
    const ansVal = opts[item.ans];
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 1,
      category: 'Toán Đố Mẹo & Phản Xạ (Cấp 1)',
      question: item.q,
      options: opts,
      correctIndex: opts.indexOf(ansVal),
      explanation: item.exp,
      points: 15,
      timeLimit: 15,
    };
  } else if (mode === 'find_x') {
    const op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    let q, correct, distractors;
    if (op === '+') {
      const x = Math.floor(Math.random() * 45) + 5;
      const a = Math.floor(Math.random() * 45) + 5;
      const b = x + a;
      q = `Tìm x, biết: x + ${a} = ${b}`;
      correct = String(x);
      distractors = [String(x + 1), String(x - 1), String(b + a)];
    } else if (op === '-') {
      const x = Math.floor(Math.random() * 60) + 20;
      const a = Math.floor(Math.random() * (x - 5)) + 5;
      const b = x - a;
      q = `Tìm x, biết: x - ${a} = ${b}`;
      correct = String(x);
      distractors = [String(x + 2), String(x - 2), String(b - a > 0 ? b - a : x + 5)];
    } else if (op === '*') {
      const x = Math.floor(Math.random() * 8) + 2;
      const a = Math.floor(Math.random() * 8) + 2;
      const b = x * a;
      q = `Tìm x, biết: ${a} x x = ${b}`;
      correct = String(x);
      distractors = [String(x + 1), String(x > 1 ? x - 1 : x + 3), String(b - a)];
    } else {
      const a = Math.floor(Math.random() * 7) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const x = a * b;
      q = `Tìm x, biết: x : ${a} = ${b}`;
      correct = String(x);
      distractors = [String(x + a), String(x - a > 0 ? x - a : x + 3), String(b + a)];
    }
    const opts = Array.from(new Set([correct, ...distractors]));
    while (opts.length < 4) opts.push(String(Number(correct) + opts.length));
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 1,
      category: 'Toán Tìm X (Cấp 1)',
      question: q,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `Giải phương trình ra x = ${correct}.`,
      points: 12,
      timeLimit: 15,
    };
  } else {
    const op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    let q, ans;
    if (op === '+') {
      const a = Math.floor(Math.random() * 70) + 15;
      const b = Math.floor(Math.random() * 70) + 15;
      ans = a + b;
      q = `Tính nhanh: ${a} + ${b} = ?`;
    } else if (op === '-') {
      const a = Math.floor(Math.random() * 70) + 25;
      const b = Math.floor(Math.random() * (a - 10)) + 10;
      ans = a - b;
      q = `Tính nhanh: ${a} - ${b} = ?`;
    } else if (op === '*') {
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 9) + 4;
      ans = a * b;
      q = `Tính nhanh: ${a} x ${b} = ?`;
    } else {
      const b = Math.floor(Math.random() * 7) + 3;
      ans = Math.floor(Math.random() * 9) + 3;
      const a = b * ans;
      q = `Tính nhanh: ${a} : ${b} = ?`;
    }
    const correct = String(ans);
    const distractors = [String(ans + 1), String(ans - 1), String(ans + 10)];
    const opts = Array.from(new Set([correct, ...distractors]));
    while (opts.length < 4) opts.push(String(ans + opts.length * 2));
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 1,
      category: 'Toán Phản Xạ Nhanh (Cấp 1)',
      question: q,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `Đáp án chính xác: ${ans}.`,
      points: 10,
      timeLimit: 12,
    };
  }
}

// -------------------------------------------------------------
// 2. TOAN HOC: CAP 2 (LOP 6 - 9)
// Phan so, luy thua, phuong trinh bac 1/2, hinh hoc Pythagoras
// -------------------------------------------------------------
const MATH_GRADE_6_9_GEOMETRY = [
  {
    q: "Tam giác vuông ABC vuông tại A có hai cạnh góc vuông AB = 6 cm, AC = 8 cm. Độ dài cạnh huyền BC là:",
    options: ["10 cm", "12 cm", "14 cm", "9 cm"],
    ans: 0,
    exp: "Theo định lý Pythagoras: BC² = AB² + AC² = 6² + 8² = 100 => BC = 10 cm.",
  },
  {
    q: "Một tam giác có số đo hai góc lần lượt là 45° và 65°. Số đo góc còn lại là:",
    options: ["70°", "80°", "60°", "75°"],
    ans: 0,
    exp: "Tổng 3 góc trong tam giác bằng 180°. Góc còn lại = 180° - 45° - 65° = 70°.",
  },
  {
    q: "Hình thang có độ dài hai đáy lần lượt là 8 cm và 12 cm, chiều cao 5 cm. Diện tích hình thang là:",
    options: ["50 cm²", "100 cm²", "40 cm²", "60 cm²"],
    ans: 0,
    exp: "Diện tích hình thang = [(8 + 12) x 5] : 2 = 50 cm².",
  },
  {
    q: "Hằng đẳng thức: (a - b)² khai triển ra là:",
    options: ["a² - 2ab + b²", "a² + 2ab + b²", "a² - b²", "a² - 2ab - b²"],
    ans: 0,
    exp: "(a - b)² = a² - 2ab + b² (Bình phương của một hiệu).",
  },
];

function generateMathGrade6_9() {
  const mode = ['linear', 'quadratic', 'powers', 'geometry'][Math.floor(Math.random() * 4)];
  if (mode === 'geometry') {
    const item = MATH_GRADE_6_9_GEOMETRY[Math.floor(Math.random() * MATH_GRADE_6_9_GEOMETRY.length)];
    const opts = [...item.options];
    const ansVal = opts[item.ans];
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 2,
      category: 'Hình Học & Đại Số (Cấp 2)',
      question: item.q,
      options: opts,
      correctIndex: opts.indexOf(ansVal),
      explanation: item.exp,
      points: 25,
      timeLimit: 25,
    };
  } else if (mode === 'linear') {
    const a = Math.floor(Math.random() * 5) + 2;
    const x = Math.floor(Math.random() * 20) - 8;
    const b = Math.floor(Math.random() * 30) - 15;
    const c = a * x + b;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const q = `Giải phương trình: ${a}x ${bStr} = ${c}. Giá trị của x là:`;
    const correct = String(x);
    const opts = Array.from(new Set([correct, String(x + 1), String(-x), String(x - 2)]));
    while (opts.length < 4) opts.push(String(x + opts.length));
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 2,
      category: 'Phương Trình Bậc Nhất (Cấp 2)',
      question: q,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `${a}x = ${c - b} => x = ${x}.`,
      points: 20,
      timeLimit: 25,
    };
  } else if (mode === 'quadratic') {
    const x1 = Math.floor(Math.random() * 5) + 1;
    const x2 = x1 + Math.floor(Math.random() * 4) + 1;
    const S = x1 + x2;
    const P = x1 * x2;
    const q = `Nghiệm lớn nhất của phương trình: x² - ${S}x + ${P} = 0 là:`;
    const correct = String(x2);
    const opts = Array.from(new Set([correct, String(x1), String(S), String(x2 + 1)]));
    while (opts.length < 4) opts.push(String(x2 + opts.length));
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 2,
      category: 'Phương Trình Bậc Hai (Cấp 2)',
      question: q,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `Phương trình có 2 nghiệm x = ${x1} và x = ${x2}. Nghiệm lớn nhất là ${x2}.`,
      points: 25,
      timeLimit: 25,
    };
  } else {
    const base = [2, 3, 5][Math.floor(Math.random() * 3)];
    const m = Math.floor(Math.random() * 3) + 2;
    const n = Math.floor(Math.random() * 3) + 2;
    const resPow = m + n;
    const val = Math.pow(base, resPow);
    const q = `Rút gọn: ${base}^${m} x ${base}^${n} = ?`;
    const correct = `${base}^${resPow} (${val})`;
    const opts = [correct, `${base}^${m * n}`, `${base * 2}^${resPow}`, `${base}^${m + n - 1}`];
    opts.sort(() => Math.random() - 0.5);
    return {
      subject: 'toan',
      level: 2,
      category: 'Lũy Thừa (Cấp 2)',
      question: q,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `Quy tắc nhân lũy thừa cùng cơ số: aᵐ x aⁿ = aᵐ⁺ⁿ => ${base}^${resPow} = ${val}.`,
      points: 20,
      timeLimit: 20,
    };
  }
}

// -------------------------------------------------------------
// 3. TOAN HOC: CAP 3 (LOP 10 - 12)
// Luong giac, logarit, dao ham, tich phan, xac suat
// -------------------------------------------------------------
const MATH_GRADE_10_12_QUESTIONS = [
  {
    q: "Giá trị của biểu thức sin(30°) + cos(60°) bằng bao nhiêu?",
    options: ["1", "√3/2", "1/2", "√3"],
    ans: 0,
    exp: "sin(30°) = 1/2 và cos(60°) = 1/2. Do đó: 1/2 + 1/2 = 1.",
  },
  {
    q: "Giá trị của log₂ 32 bằng bao nhiêu?",
    options: ["5", "4", "6", "16"],
    ans: 0,
    exp: "2⁵ = 32 => log₂ 32 = 5.",
  },
  {
    q: "Đạo hàm của hàm số y = x³ - 3x² + 4 là:",
    options: ["y' = 3x² - 6x", "y' = 3x² - 6", "y' = x² - 3x", "y' = 3x² - 6x + 4"],
    ans: 0,
    exp: "(x³)' = 3x², (-3x²)' = -6x, (4)' = 0 => y' = 3x² - 6x.",
  },
  {
    q: "Tích phân ∫ (từ 0 đến 2) của 2x dx bằng bao nhiêu?",
    options: ["4", "2", "8", "6"],
    ans: 0,
    exp: "Nguyên hàm của 2x là x². Thay cận từ 0 đến 2: 2² - 0² = 4.",
  },
  {
    q: "Có bao nhiêu cách chọn 3 học sinh từ một tổ gồm 10 học sinh?",
    options: ["120 cách", "720 cách", "30 cách", "240 cách"],
    ans: 0,
    exp: "Số cách chọn là tổ hợp C₁₀³ = (10 x 9 x 8) / (3 x 2 x 1) = 120 cách.",
  },
  {
    q: "Gieo một con xúc xắc 1 lần. Xác suất để xuất hiện mặt có số chấm chia hết cho 3 là:",
    options: ["1/3", "1/2", "1/6", "2/3"],
    ans: 0,
    exp: "Các mặt chia hết cho 3 là {3, 6} (2 mặt). Xác suất = 2/6 = 1/3.",
  },
  {
    q: "Đạo hàm của hàm số y = e^(2x) là:",
    options: ["2e^(2x)", "e^(2x)", "2e^x", "e^x / 2"],
    ans: 0,
    exp: "[e^(2x)]' = 2 x e^(2x).",
  },
  {
    q: "Số phức z = 3 + 4i có mô-đun |z| bằng:",
    options: ["5", "7", "25", "√7"],
    ans: 0,
    exp: "|z| = √(3² + 4²) = √25 = 5.",
  },
];

function generateMathGrade10_12() {
  const item = MATH_GRADE_10_12_QUESTIONS[Math.floor(Math.random() * MATH_GRADE_10_12_QUESTIONS.length)];
  const opts = [...item.options];
  const ansVal = opts[item.ans];
  opts.sort(() => Math.random() - 0.5);
  return {
    subject: 'toan',
    level: 3,
    category: 'Toán Cao Cấp THPT (Cấp 3)',
    question: item.q,
    options: opts,
    correctIndex: opts.indexOf(ansVal),
    explanation: item.exp,
    points: 40,
    timeLimit: 35,
  };
}

// -------------------------------------------------------------
// 4. KHOA HOC TU NHIEN: CAP 1 (LOP 1 - 5)
// -------------------------------------------------------------
const SCIENCE_GRADE_1_5_QUESTIONS = [
  {
    q: "Bộ phận nào của cây chủ yếu thực hiện chức năng quang hợp chế tạo chất dinh dưỡng?",
    options: ["Lá cây", "Rễ cây", "Thân cây", "Hoa"],
    ans: 0,
    exp: "Lá cây chứa chất diệp lục giúp hấp thụ ánh sáng mặt trời để thực hiện quang hợp.",
  },
  {
    q: "Nước chuyển từ thể lỏng sang thể khí (hơi nước) được gọi là hiện tượng gì?",
    options: ["Bay hơi", "Ngưng tụ", "Đông đặc", "Nóng chảy"],
    ans: 0,
    exp: "Nước lỏng sang thể hơi gọi là bay hơi (ngược lại là ngưng tụ).",
  },
  {
    q: "Trong không khí, khí nào chiếm thể tích lớn nhất (khoảng 78%)?",
    options: ["Khí Nitơ", "Khí Oxi", "Khí Cacbonic", "Khí Hiđrô"],
    ans: 0,
    exp: "Không khí gồm khoảng 78% Nitơ, 21% Oxi và 1% các khí khác.",
  },
  {
    q: "Cơ quan nào trong cơ thể người có nhiệm vụ co bóp đẩy máu đi khắp cơ thể?",
    options: ["Trái tim", "Dạ dày", "Phổi", "Gan"],
    ans: 0,
    exp: "Trái tim hoạt động như một máy bơm liên tục đẩy máu nuôi toàn bộ cơ thể.",
  },
  {
    q: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
    options: ["Sao Thủy (Mercury)", "Sao Kim (Venus)", "Trái Đất (Earth)", "Sao Hỏa (Mars)"],
    ans: 0,
    exp: "Sao Thủy là hành tinh nằm gần Mặt Trời nhất.",
  },
  {
    q: "Động vật nào sau đây đẻ con và nuôi con bằng sữa mẹ?",
    options: ["Cá voi", "Cá sấu", "Cá chép", "Đà điểu"],
    ans: 0,
    exp: "Cá voi là động vật có vú (thú) sống dưới nước, đẻ con và cho con bú.",
  },
  {
    q: "Nhiệt độ sôi của nước tinh khiết ở điều kiện áp suất tiêu chuẩn là bao nhiêu?",
    options: ["100°C", "0°C", "50°C", "120°C"],
    ans: 0,
    exp: "Nước đóng băng ở 0°C và sôi ở 100°C.",
  },
  {
    q: "Vào ban ngày, cây xanh hấp thụ khí gì và thải ra khí gì trong quá trình quang hợp?",
    options: ["Hấp thụ CO₂, thải ra O₂", "Hấp thụ O₂, thải ra CO₂", "Hấp thụ N₂, thải ra O₂", "Hấp thụ O₂, thải ra H₂"],
    ans: 0,
    exp: "Khi quang hợp, cây xanh hấp thụ khí Cacbonic (CO₂) và giải phóng khí Oxi (O₂).",
  },
];

function generateScienceGrade1_5() {
  const item = SCIENCE_GRADE_1_5_QUESTIONS[Math.floor(Math.random() * SCIENCE_GRADE_1_5_QUESTIONS.length)];
  const opts = [...item.options];
  const ansVal = opts[item.ans];
  opts.sort(() => Math.random() - 0.5);
  return {
    subject: 'khoahoc',
    level: 1,
    category: 'KHTN Khám Phá (Cấp 1)',
    question: item.q,
    options: opts,
    correctIndex: opts.indexOf(ansVal),
    explanation: item.exp,
    points: 15,
    timeLimit: 15,
  };
}

// -------------------------------------------------------------
// 5. KHOA HOC TU NHIEN: CAP 2 (LOP 6 - 9)
// Lop 6: KHTN tong hop, Lop 7: KHTN+Li, Lop 8: Li-Hoa, Lop 9: Li-Hoa-Sinh
// -------------------------------------------------------------
const SCIENCE_GRADE_6_9_QUESTIONS = [
  {
    grade: 6,
    q: "[Lớp 6] Đơn vị cấu trúc và chức năng cơ bản của mọi cơ thể sống là gì?",
    options: ["Tế bào", "Mô", "Cơ quan", "Nguyên tử"],
    ans: 0,
    exp: "Tế bào là đơn vị cơ sở cấu tạo nên sự sống của mọi sinh vật.",
  },
  {
    grade: 7,
    q: "[Lớp 7 - Vật lí] Theo định luật phản xạ ánh sáng, nếu góc tới bằng 40° thì góc phản xạ bằng:",
    options: ["40°", "50°", "80°", "20°"],
    ans: 0,
    exp: "Định luật phản xạ: Góc phản xạ luôn bằng góc tới (i' = i = 40°).",
  },
  {
    grade: 7,
    q: "[Lớp 7 - Vật lí] Âm thanh KHÔNG THỂ truyền qua môi trường nào sau đây?",
    options: ["Chân không", "Nước (chất lỏng)", "Sắt (chất rắn)", "Không khí"],
    ans: 0,
    exp: "Sóng âm cần các hạt vật chất để truyền dao động, do đó không truyền được trong chân không.",
  },
  {
    grade: 8,
    q: "[Lớp 8 - Hóa học] Dung dịch axit làm quỳ tím chuyển sang màu gì?",
    options: ["Màu đỏ (hồng)", "Màu xanh", "Màu vàng", "Không đổi màu"],
    ans: 0,
    exp: "Axit làm quỳ tím hóa đỏ, dung dịch kiềm (bazơ) làm quỳ tím hóa xanh.",
  },
  {
    grade: 8,
    q: "[Lớp 8 - Hóa học] 1 mol khí ở điều kiện chuẩn (25°C, 1 bar) có thể tích xấp xỉ bằng:",
    options: ["24.79 lít", "22.4 lít", "24.0 lít", "20.5 lít"],
    ans: 0,
    exp: "Theo chương trình GDPT mới (25°C, 1 bar), 1 mol khí chiếm 24.79 lít.",
  },
  {
    grade: 8,
    q: "[Lớp 8 - Vật lí] Lực đẩy Ác-si-mét tác dụng lên vật nhúng trong chất lỏng có hướng như thế nào?",
    options: ["Phương thẳng đứng, chiều từ dưới lên trên", "Phương thẳng đứng, chiều từ trên xuống", "Phương nằm ngang", "Ngẫu nhiên"],
    ans: 0,
    exp: "Lực đẩy Ác-si-mét luôn có phương thẳng đứng, chiều hướng từ dưới lên trên.",
  },
  {
    grade: 9,
    q: "[Lớp 9 - Vật lí] Định luật Ôm: Cường độ dòng điện I chạy qua dây dẫn được tính bằng công thức:",
    options: ["I = U / R", "I = U x R", "I = R / U", "I = U² x R"],
    ans: 0,
    exp: "Định luật Ôm: I = U / R (tỉ lệ thuận với hiệu điện thế, tỉ lệ nghịch với điện trở).",
  },
  {
    grade: 9,
    q: "[Lớp 9 - Hóa học] Khí nào sau đây chiếm thành phần chính trong khí thiên nhiên và Biogas?",
    options: ["Metan (CH₄)", "Etilen (C₂H₄)", "Axetilen (C₂H₂)", "Cacbonic (CO₂)"],
    ans: 0,
    exp: "Metan (CH₄) là thành phần chủ yếu của khí thiên nhiên và khí sinh học Biogas.",
  },
  {
    grade: 9,
    q: "[Lớp 9 - Sinh học] Trong phân tử ADN, các nucleotit liên kết theo nguyên tắc bổ sung như thế nào?",
    options: ["A liên kết với T, G liên kết với X", "A liên kết với U, G liên kết với X", "A liên kết với G, T liên kết với X", "A liên kết với X, T liên kết với G"],
    ans: 0,
    exp: "Nguyên tắc bổ sung trên phân tử ADN: A liên kết với T bằng 2 liên kết H, G liên kết với X bằng 3 liên kết H.",
  },
];

function generateScienceGrade6_9() {
  const item = SCIENCE_GRADE_6_9_QUESTIONS[Math.floor(Math.random() * SCIENCE_GRADE_6_9_QUESTIONS.length)];
  const opts = [...item.options];
  const ansVal = opts[item.ans];
  opts.sort(() => Math.random() - 0.5);
  return {
    subject: 'khoahoc',
    level: 2,
    category: `Khoa Học Tự Nhiên Lớp ${item.grade} (Cấp 2)`,
    question: item.q,
    options: opts,
    correctIndex: opts.indexOf(ansVal),
    explanation: item.exp,
    points: 25,
    timeLimit: 25,
  };
}

// -------------------------------------------------------------
// 6. KHOA HOC TU NHIEN: CAP 3 (LOP 10 - 12)
// Vat li, Hoa hoc, Sinh hoc THPT chuyen sau
// -------------------------------------------------------------
const SCIENCE_GRADE_10_12_QUESTIONS = [
  {
    branch: "Vật lí",
    q: "[Vật lí THPT] Trong dao động điều hòa x = A cos(ωt + φ), chu kì T được tính bằng:",
    options: ["T = 2π / ω", "T = ω / 2π", "T = 2π x ω", "T = 1 / (2πω)"],
    ans: 0,
    exp: "Chu kì T = 2π / ω = 1 / f.",
  },
  {
    branch: "Vật lí",
    q: "[Vật lí THPT] Chu kì dao động riêng của con lắc lò xo (khối lượng m, độ cứng k) là:",
    options: ["T = 2π √(m / k)", "T = 2π √(k / m)", "T = √(m / k) / 2π", "T = 2π √(l / g)"],
    ans: 0,
    exp: "Con lắc lò xo: T = 2π √(m / k).",
  },
  {
    branch: "Vật lí",
    q: "[Vật lí THPT] Lượng tử ánh sáng (photon) mang năng lượng được tính bằng công thức:",
    options: ["ε = hf = hc / λ", "ε = h / f", "ε = h λ", "ε = mc"],
    ans: 0,
    exp: "Năng lượng photon: ε = hf = hc / λ (với h là hằng số Planck).",
  },
  {
    branch: "Hóa học",
    q: "[Hóa học THPT] Este CH₃COOC₂H₅ có tên gọi quốc tế là gì?",
    options: ["Etyl axetat", "Metyl propionat", "Etyl fomat", "Metyl axetat"],
    ans: 0,
    exp: "CH₃COO- là axetat, -C₂H₅ là etyl => Etyl axetat.",
  },
  {
    branch: "Hóa học",
    q: "[Hóa học THPT] Kim loại nào sau đây có tính dẫn điện và dẫn nhiệt tốt nhất?",
    options: ["Bạc (Ag)", "Đồng (Cu)", "Vàng (Au)", "Nhôm (Al)"],
    ans: 0,
    exp: "Thứ tự dẫn điện tốt nhất: Bạc (Ag) > Đồng (Cu) > Vàng (Au) > Nhôm (Al).",
  },
  {
    branch: "Sinh học",
    q: "[Sinh học THPT] Bộ ba nào trên mARN làm nhiệm vụ mở đầu dịch mã và mã hóa Methionine?",
    options: ["5' AUG 3'", "5' UAA 3'", "5' UAG 3'", "5' UGA 3'"],
    ans: 0,
    exp: "5' AUG 3' là mã mở đầu cho quá trình dịch mã.",
  },
  {
    branch: "Sinh học",
    q: "[Sinh học THPT] Quá trình nhân đôi ADN diễn ra theo nguyên tắc nào?",
    options: ["Nguyên tắc bổ sung và bán bảo tồn", "Nguyên tắc bổ sung và bảo tồn hoàn toàn", "Chỉ theo nguyên tắc bổ sung", "Nguyên tắc gián đoạn"],
    ans: 0,
    exp: "Nhân đôi ADN diễn ra theo nguyên tắc bổ sung và bán bảo tồn.",
  },
];

function generateScienceGrade10_12() {
  const item = SCIENCE_GRADE_10_12_QUESTIONS[Math.floor(Math.random() * SCIENCE_GRADE_10_12_QUESTIONS.length)];
  const opts = [...item.options];
  const ansVal = opts[item.ans];
  opts.sort(() => Math.random() - 0.5);
  return {
    subject: 'khoahoc',
    level: 3,
    category: `${item.branch} THPT (Cấp 3)`,
    question: item.q,
    options: opts,
    correctIndex: opts.indexOf(ansVal),
    explanation: item.exp,
    points: 40,
    timeLimit: 35,
  };
}

// -------------------------------------------------------------
// 7. PUBLIC DISPATCHER
// -------------------------------------------------------------
export function getQuizQuestion({ subject = 'toan', level = 1 } = {}) {
  const sub = String(subject).toLowerCase();
  const lvl = Number(level) || 1;

  if (sub === 'khoahoc' || sub === 'khtn' || sub === 'science') {
    if (lvl === 1) return generateScienceGrade1_5();
    if (lvl === 2) return generateScienceGrade6_9();
    return generateScienceGrade10_12();
  } else {
    // Mac dinh: Toan hoc
    if (lvl === 1) return generateMathGrade1_5();
    if (lvl === 2) return generateMathGrade6_9();
    return generateMathGrade10_12();
  }
}

