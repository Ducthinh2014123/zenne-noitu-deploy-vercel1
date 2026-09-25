// quizEngine.js - He thong SINH CAU HOI TU DONG 100% (PROCEDURAL GENERATOR)
// Khong can luu tru danh sach co dinh. Moi lan choi se tinh toan va sinh ra cau hoi ngau nhien!

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function makeDistractors(correctVal, count = 3, step = 1, isFloat = false) {
  const format = (v) => (isFloat ? String(Math.round(v * 100) / 100) : String(Math.round(v)));
  const correctStr = format(correctVal);
  const opts = new Set([correctStr]);
  const deltas = [-1, 1, -2, 2, -5, 5, -10, 10, -step, step].sort(() => Math.random() - 0.5);

  for (const d of deltas) {
    const cand = correctVal + d;
    if (!isFloat && cand < 0 && correctVal >= 0) continue;
    opts.add(format(cand));
    if (opts.size >= count + 1) break;
  }

  while (opts.size < count + 1) {
    const cand = correctVal + opts.size * step;
    opts.add(format(cand));
  }

  const optList = Array.from(opts).sort(() => Math.random() - 0.5);
  return {
    options: optList,
    correctIndex: optList.indexOf(correctStr),
  };
}

// ==============================================================================
// 1. PROCEDURAL MATH (Toan hoc ngau nhien)
// ==============================================================================

class ProceduralMath {
  static grade1_5() {
    const mode = ['arithmetic', 'find_x', 'speed', 'area', 'two_numbers'][Math.floor(Math.random() * 5)];
    if (mode === 'arithmetic') {
      const op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
      let q, ans;
      if (op === '+') {
        const a = Math.floor(Math.random() * 85) + 12;
        const b = Math.floor(Math.random() * 85) + 15;
        ans = a + b;
        q = `Tính nhanh: ${a} + ${b} = ?`;
      } else if (op === '-') {
        const a = Math.floor(Math.random() * 70) + 29;
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
      const { options, correctIndex } = makeDistractors(ans);
      return {
        subject: 'toan', level: 1, category: 'Toán Phản Xạ Nhanh (Cấp 1)',
        question: q, options, correctIndex,
        explanation: `Kết quả chính xác: ${ans}.`,
        points: 10, timeLimit: 12,
      };
    } else if (mode === 'find_x') {
      const pattern = ['x+a=b', 'x-a=b', 'a*x=b', 'x:a=b'][Math.floor(Math.random() * 4)];
      let q, x;
      if (pattern === 'x+a=b') {
        x = Math.floor(Math.random() * 50) + 6;
        const a = Math.floor(Math.random() * 40) + 8;
        const b = x + a;
        q = `Tìm x, biết: x + ${a} = ${b}`;
      } else if (pattern === 'x-a=b') {
        x = Math.floor(Math.random() * 60) + 25;
        const a = Math.floor(Math.random() * (x - 10)) + 8;
        const b = x - a;
        q = `Tìm x, biết: x - ${a} = ${b}`;
      } else if (pattern === 'a*x=b') {
        x = Math.floor(Math.random() * 8) + 2;
        const a = Math.floor(Math.random() * 8) + 2;
        const b = x * a;
        q = `Tìm x, biết: ${a} x x = ${b}`;
      } else {
        const a = Math.floor(Math.random() * 7) + 2;
        x = (Math.floor(Math.random() * 8) + 3) * a;
        const b = x / a;
        q = `Tìm x, biết: x : ${a} = ${b}`;
      }
      const { options, correctIndex } = makeDistractors(x);
      return {
        subject: 'toan', level: 1, category: 'Toán Tìm X (Cấp 1)',
        question: q, options, correctIndex,
        explanation: `Chuyển vế giải ra x = ${x}.`,
        points: 12, timeLimit: 15,
      };
    } else if (mode === 'speed') {
      const vehicle = ['ô tô', 'xe máy', 'tàu hỏa', 'xe đạp'][Math.floor(Math.random() * 4)];
      const v = [15, 30, 40, 50, 60, 80][Math.floor(Math.random() * 6)];
      const t = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const s = v * t;
      const q = `Một ${vehicle} đi với vận tốc ${v} km/h trong thời gian ${t} giờ. Quãng đường đi được là:`;
      const opts = Array.from(new Set([`${s} km`, `${s + v} km`, `${s - v > 0 ? s - v : s + 25} km`, `${s + 10} km`]));
      while (opts.length < 4) opts.push(`${s + opts.length * 15} km`);
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 1, category: 'Toán Chuyển Động (Cấp 1)',
        question: q, options: opts, correctIndex: opts.indexOf(`${s} km`),
        explanation: `Quãng đường = Vận tốc x Thời gian = ${v} x ${t} = ${s} km.`,
        points: 15, timeLimit: 15,
      };
    } else if (mode === 'area') {
      const shape = ['rectangle', 'triangle', 'square'][Math.floor(Math.random() * 3)];
      let q, s;
      if (shape === 'rectangle') {
        const w = Math.floor(Math.random() * 8) + 4;
        const h = w + Math.floor(Math.random() * 8) + 2;
        s = w * h;
        q = `Một hình chữ nhật có chiều rộng ${w} cm, chiều dài ${h} cm. Diện tích của hình chữ nhật là:`;
      } else if (shape === 'square') {
        const a = Math.floor(Math.random() * 11) + 4;
        s = a * a;
        q = `Một hình vuông có cạnh dài ${a} cm. Diện tích của hình vuông là:`;
      } else {
        const b = (Math.floor(Math.random() * 6) + 3) * 2;
        const h = Math.floor(Math.random() * 8) + 4;
        s = (b * h) / 2;
        q = `Một hình tam giác có độ dài đáy ${b} cm, chiều cao ${h} cm. Diện tích tam giác là:`;
      }
      const opts = Array.from(new Set([`${s} cm²`, `${s + 4} cm²`, `${s - 4 > 0 ? s - 4 : s + 10} cm²`, `${s + 12} cm²`]));
      while (opts.length < 4) opts.push(`${s + opts.length * 6} cm²`);
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 1, category: 'Toán Hình Học (Cấp 1)',
        question: q, options: opts, correctIndex: opts.indexOf(`${s} cm²`),
        explanation: `Diện tích hình tương ứng tính được S = ${s} cm².`,
        points: 15, timeLimit: 15,
      };
    } else {
      const n1 = Math.floor(Math.random() * 45) + 15;
      const n2 = Math.floor(Math.random() * (n1 - 5)) + 5;
      const S = n1 + n2;
      const D = n1 - n2;
      const askLarger = Math.random() < 0.5;
      const ans = askLarger ? n1 : n2;
      const targetTxt = askLarger ? 'Số lớn' : 'Số bé';
      const q = `Tổng của hai số là ${S} và hiệu của chúng là ${D}. ${targetTxt} là:`;
      const { options, correctIndex } = makeDistractors(ans);
      return {
        subject: 'toan', level: 1, category: 'Toán Tổng - Hiệu (Cấp 1)',
        question: q, options, correctIndex,
        explanation: `Số lớn = (Tổng + Hiệu) : 2 = (${S} + ${D}) : 2 = ${n1}. Số bé = ${n2}.`,
        points: 15, timeLimit: 15,
      };
    }
  }

  static grade6_9() {
    const mode = ['linear', 'quadratic', 'pythagoras', 'powers', 'fraction'][Math.floor(Math.random() * 5)];
    if (mode === 'linear') {
      const x = Math.floor(Math.random() * 20) - 8;
      const a = Math.floor(Math.random() * 4) + 3;
      const c = Math.floor(Math.random() * (a - 1)) + 1;
      const b = Math.floor(Math.random() * 30) - 15;
      const d = (a - c) * x + b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const dStr = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
      const cTerm = c > 1 ? `${c}x ` : 'x ';
      const q = `Giải phương trình: ${a}x ${bStr} = ${cTerm}${dStr}. Giá trị của x là:`;
      const { options, correctIndex } = makeDistractors(x);
      return {
        subject: 'toan', level: 2, category: 'Phương Trình Bậc Nhất (Cấp 2)',
        question: q, options, correctIndex,
        explanation: `Chuyển vế giải ra x = ${x}.`,
        points: 20, timeLimit: 25,
      };
    } else if (mode === 'quadratic') {
      const x1 = Math.floor(Math.random() * 5) + 1;
      const x2 = x1 + Math.floor(Math.random() * 4) + 1;
      const S = x1 + x2;
      const P = x1 * x2;
      const askMax = Math.random() < 0.5;
      const ans = askMax ? x2 : x1;
      const tgt = askMax ? 'Nghiệm lớn nhất' : 'Nghiệm nhỏ nhất';
      const q = `${tgt} của phương trình: x² - ${S}x + ${P} = 0 là:`;
      const { options, correctIndex } = makeDistractors(ans);
      return {
        subject: 'toan', level: 2, category: 'Phương Trình Bậc Hai (Cấp 2)',
        question: q, options, correctIndex,
        explanation: `Phương trình có hai nghiệm x₁ = ${x1}, x₂ = ${x2}. ${tgt} là ${ans}.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'pythagoras') {
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
      const k = [1, 2, 3][Math.floor(Math.random() * 3)];
      const base = triples[Math.floor(Math.random() * triples.length)];
      const [a, b, c] = [base[0] * k, base[1] * k, base[2] * k];
      const askHypo = Math.random() < 0.5;
      const q = askHypo
        ? `Cho tam giác vuông có hai cạnh góc vuông là ${a} cm và ${b} cm. Cạnh huyền là:`
        : `Cho tam giác vuông có cạnh huyền là ${c} cm và một cạnh góc vuông là ${a} cm. Cạnh góc vuông còn lại là:`;
      const ans = askHypo ? c : b;
      const opts = Array.from(new Set([`${ans} cm`, `${ans + 2} cm`, `${ans - 2 > 0 ? ans - 2 : ans + 4} cm`, `${ans + 5} cm`]));
      while (opts.length < 4) opts.push(`${ans + opts.length * 3} cm`);
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 2, category: 'Định Lý Pythagoras (Cấp 2)',
        question: q, options: opts, correctIndex: opts.indexOf(`${ans} cm`),
        explanation: `Theo Pythagoras: ${a}² + ${b}² = ${c}² => cạnh cần tìm là ${ans} cm.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'powers') {
      const base = [2, 3, 5, 7][Math.floor(Math.random() * 4)];
      const m = Math.floor(Math.random() * 4) + 2;
      const n = Math.floor(Math.random() * 3) + 2;
      const res = m + n;
      const q = `Rút gọn tích hai lũy thừa: ${base}^${m} x ${base}^${n} = ?`;
      const correct = `${base}^${res}`;
      const opts = [correct, `${base}^${m * n}`, `${base * 2}^${res}`, `${base}^${res - 1}`].sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 2, category: 'Lũy Thừa (Cấp 2)',
        question: q, options: opts, correctIndex: opts.indexOf(correct),
        explanation: `Quy tắc nhân lũy thừa cùng cơ số: aᵐ x aⁿ = aᵐ⁺ⁿ => ${base}^${res}.`,
        points: 20, timeLimit: 20,
      };
    } else {
      const d = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
      const n1 = Math.floor(Math.random() * (d - 1)) + 1;
      const n2 = Math.floor(Math.random() * (d - 1)) + 1;
      const tot = n1 + n2;
      const g = gcd(tot, d);
      const sn = tot / g;
      const sd = d / g;
      const correct = sd !== 1 ? `${sn}/${sd}` : String(sn);
      const q = `Tính và rút gọn phân số tối giản: ${n1}/${d} + ${n2}/${d} = ?`;
      const opts = Array.from(new Set([correct, `${tot}/${d * 2}`, `${n1 * n2}/${d}`, `${tot + 1}/${d}`]));
      while (opts.length < 4) opts.push(`${sn + opts.length}/${sd}`);
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 2, category: 'Phân Số (Cấp 2)',
        question: q, options: opts, correctIndex: opts.indexOf(correct),
        explanation: `Cộng cùng mẫu: (${n1} + ${n2})/${d} = ${tot}/${d} = ${correct}.`,
        points: 20, timeLimit: 20,
      };
    }
  }

  static grade10_12() {
    const mode = ['derivative', 'integral', 'log', 'trig', 'probability', 'complex'][Math.floor(Math.random() * 6)];
    if (mode === 'derivative') {
      const n = Math.floor(Math.random() * 4) + 3;
      const a = Math.floor(Math.random() * 4) + 2;
      const coeff = a * n;
      const p = n - 1;
      const pStr = p > 1 ? `x^${p}` : 'x';
      const q = `Tính đạo hàm của hàm số y = ${a}x^${n}. Ta có y' bằng:`;
      const correct = `${coeff}${pStr}`;
      const opts = [correct, `${a}x^${p}`, `${coeff}x^${n}`, `${a + n}${pStr}`].sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 3, category: 'Đạo Hàm (Cấp 3)',
        question: q, options: opts, correctIndex: opts.indexOf(correct),
        explanation: `Công thức đạo hàm: (xⁿ)' = n*xⁿ⁻¹ => (${a}x^${n})' = ${coeff}${pStr}.`,
        points: 40, timeLimit: 35,
      };
    } else if (mode === 'integral') {
      const a = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
      const b = Math.floor(Math.random() * 4) + 1;
      const ans = (a * b * b) / 2;
      const q = `Tính tích phân I = ∫ (từ 0 đến ${b}) của ${a}x dx:`;
      const { options, correctIndex } = makeDistractors(ans);
      return {
        subject: 'toan', level: 3, category: 'Tích Phân (Cấp 3)',
        question: q, options, correctIndex,
        explanation: `Nguyên hàm là ${a / 2}x². Thay cận: ${a / 2} x ${b}² = ${ans}.`,
        points: 40, timeLimit: 35,
      };
    } else if (mode === 'log') {
      const base = [2, 3, 5][Math.floor(Math.random() * 3)];
      const k = Math.floor(Math.random() * 4) + 2;
      const val = Math.pow(base, k);
      const q = `Giá trị của log_${base}(${val}) bằng bao nhiêu?`;
      const { options, correctIndex } = makeDistractors(k);
      return {
        subject: 'toan', level: 3, category: 'Logarit (Cấp 3)',
        question: q, options, correctIndex,
        explanation: `Do ${base}^${k} = ${val} nên log_${base}(${val}) = ${k}.`,
        points: 40, timeLimit: 30,
      };
    } else if (mode === 'trig') {
      const angles = [
        ['30°', '1/2', '√3/2'],
        ['45°', '√2/2', '√2/2'],
        ['60°', '√3/2', '1/2'],
        ['90°', '1', '0'],
      ];
      const item = angles[Math.floor(Math.random() * angles.length)];
      const askSin = Math.random() < 0.5;
      const fn = askSin ? 'sin' : 'cos';
      const correct = askSin ? item[1] : item[2];
      const q = `Giá trị lượng giác của ${fn}(${item[0]}) bằng:`;
      const pool = ['0', '1/2', '√2/2', '√3/2', '1'].filter((x) => x !== correct);
      const opts = [correct, ...pool.slice(0, 3)].sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 3, category: 'Lượng Giác (Cấp 3)',
        question: q, options: opts, correctIndex: opts.indexOf(correct),
        explanation: `Theo bảng giá trị lượng giác góc đặc biệt: ${fn}(${item[0]}) = ${correct}.`,
        points: 40, timeLimit: 30,
      };
    } else if (mode === 'probability') {
      const r = Math.floor(Math.random() * 5) + 3;
      const b = Math.floor(Math.random() * 5) + 3;
      const tot = r + b;
      const g = gcd(r, tot);
      const correct = `${r / g}/${tot / g}`;
      const q = `Một hộp chứa ${r} bi đỏ và ${b} bi xanh. Lấy ngẫu nhiên 1 viên bi. Xác suất lấy được bi đỏ là:`;
      const opts = Array.from(new Set([correct, `${b}/${tot}`, `1/${tot}`, `${r}/${tot * 2}`]));
      while (opts.length < 4) opts.push(`${r + opts.length}/${tot}`);
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'toan', level: 3, category: 'Xác Suất Thống Kê (Cấp 3)',
        question: q, options: opts, correctIndex: opts.indexOf(correct),
        explanation: `Xác suất = ${r}/${tot} = ${correct}.`,
        points: 40, timeLimit: 30,
      };
    } else {
      const pairs = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
      const [a, b, mod] = pairs[Math.floor(Math.random() * pairs.length)];
      const sign = Math.random() < 0.5 ? '+' : '-';
      const q = `Cho số phức z = ${a} ${sign} ${b}i. Mô-đun |z| của số phức bằng:`;
      const { options, correctIndex } = makeDistractors(mod);
      return {
        subject: 'toan', level: 3, category: 'Số Phức (Cấp 3)',
        question: q, options, correctIndex,
        explanation: `|z| = √(${a}² + ${b}²) = ${mod}.`,
        points: 40, timeLimit: 30,
      };
    }
  }
}

// ==============================================================================
// 2. PROCEDURAL SCIENCE (Khoa hoc tu nhien ngau nhien)
// ==============================================================================

const PLANETS = [
  { name: 'Sao Thủy', pos: 1, feat: 'hành tinh gần Mặt Trời nhất' },
  { name: 'Sao Kim', pos: 2, feat: 'hành tinh sáng nhất và nóng nhất' },
  { name: 'Trái Đất', pos: 3, feat: 'hành tinh duy nhất có sự sống và nước lỏng' },
  { name: 'Sao Hỏa', pos: 4, feat: 'hành tinh đỏ với bề mặt giàu oxit sắt' },
  { name: 'Sao Mộc', pos: 5, feat: 'hành tinh lớn nhất trong Hệ Mặt Trời' },
  { name: 'Sao Thổ', pos: 6, feat: 'hành tinh có vành đai ngoạn mục nhất' },
  { name: 'Sao Thiên Vương', pos: 7, feat: 'hành tinh băng khổng lồ quay nghiêng' },
  { name: 'Sao Hải Vương', pos: 8, feat: 'hành tinh xa Mặt Trời nhất trong 8 hành tinh' },
];

const ELEMENTS = [
  { name: 'Hiđrô', sym: 'H', z: 1 },
  { name: 'Heli', sym: 'He', z: 2 },
  { name: 'Cacbon', sym: 'C', z: 6 },
  { name: 'Nitơ', sym: 'N', z: 7 },
  { name: 'Oxi', sym: 'O', z: 8 },
  { name: 'Natri', sym: 'Na', z: 11 },
  { name: 'Magie', sym: 'Mg', z: 12 },
  { name: 'Nhôm', sym: 'Al', z: 13 },
  { name: 'Clo', sym: 'Cl', z: 17 },
  { name: 'Sắt', sym: 'Fe', z: 26 },
  { name: 'Đồng', sym: 'Cu', z: 29 },
];

const COMPOUNDS = [
  { name: 'Nước (H₂O)', m: 18 },
  { name: 'Khí Cacbonic (CO₂)', m: 44 },
  { name: 'Khí Metan (CH₄)', m: 16 },
  { name: 'Muối ăn (NaCl)', m: 58.5 },
  { name: 'Khí Oxi (O₂)', m: 32 },
  { name: 'Khí Hiđrô (H₂)', m: 2 },
];

class ProceduralScience {
  static grade1_5() {
    const mode = ['planet', 'matter_state', 'body_organ', 'facts'][Math.floor(Math.random() * 4)];
    if (mode === 'planet') {
      const p = PLANETS[Math.floor(Math.random() * PLANETS.length)];
      const askPos = Math.random() < 0.5;
      if (askPos) {
        const q = `Trong Hệ Mặt Trời, ${p.name} là hành tinh thứ mấy tính từ Mặt Trời ra?`;
        const ans = `Thứ ${p.pos}`;
        const opts = Array.from(new Set([`Thứ ${p.pos}`, `Thứ ${p.pos + 1}`, `Thứ ${Math.max(1, p.pos - 1)}`, `Thứ ${p.pos + 2}`]));
        while (opts.length < 4) opts.push(`Thứ ${opts.length + 1}`);
        opts.sort(() => Math.random() - 0.5);
        return {
          subject: 'khoahoc', level: 1, category: 'Hệ Mặt Trời (Cấp 1)',
          question: q, options: opts, correctIndex: opts.indexOf(ans),
          explanation: `${p.name} nằm ở vị trí thứ ${p.pos} và là ${p.feat}.`,
          points: 15, timeLimit: 15,
        };
      } else {
        const q = `Hành tinh nào trong Hệ Mặt Trời được mệnh danh là "${p.feat}"?`;
        const ans = p.name;
        const pool = PLANETS.filter((x) => x.name !== ans).map((x) => x.name);
        const opts = [ans, ...pool.slice(0, 3)].sort(() => Math.random() - 0.5);
        return {
          subject: 'khoahoc', level: 1, category: 'Vũ Trụ & Trái Đất (Cấp 1)',
          question: q, options: opts, correctIndex: opts.indexOf(ans),
          explanation: `${p.name} chính là ${p.feat}.`,
          points: 15, timeLimit: 15,
        };
      }
    } else if (mode === 'matter_state') {
      const trans = [
        ['nước lỏng chuyển thành nước đá', 'Đông đặc'],
        ['nước đá chuyển thành nước lỏng', 'Nóng chảy'],
        ['nước lỏng chuyển thành hơi nước', 'Bay hơi'],
        ['hơi nước chuyển thành giọt nước lỏng', 'Ngưng tụ'],
      ][Math.floor(Math.random() * 4)];
      const q = `Hiện tượng ${trans[0]} được gọi là gì?`;
      const opts = ['Đông đặc', 'Nóng chảy', 'Bay hơi', 'Ngưng tụ'].sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 1, category: 'Vật Chất (Cấp 1)',
        question: q, options: opts, correctIndex: opts.indexOf(trans[1]),
        explanation: `${trans[1]} là hiện tượng ${trans[0]}.`,
        points: 15, timeLimit: 15,
      };
    } else if (mode === 'body_organ') {
      const organs = [
        ['Trái tim', 'co bóp liên tục để đẩy máu đi khắp cơ thể'],
        ['Hai lá phổi', 'thực hiện trao đổi khí Oxi và Cacbonic'],
        ['Dạ dày', 'co bóp và tiết dịch vị để tiêu hóa thức ăn'],
        ['Đôi mắt', 'giúp nhìn thấy hình ảnh và màu sắc'],
        ['Đôi tai', 'giúp nghe và cảm nhận âm thanh'],
      ];
      const item = organs[Math.floor(Math.random() * organs.length)];
      const q = `Cơ quan nào trong cơ thể người có nhiệm vụ ${item[1]}?`;
      const pool = organs.filter((x) => x[0] !== item[0]).map((x) => x[0]);
      const opts = [item[0], ...pool.slice(0, 3)].sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 1, category: 'Cơ Thể Người (Cấp 1)',
        question: q, options: opts, correctIndex: opts.indexOf(item[0]),
        explanation: `${item[0]} có chức năng ${item[1]}.`,
        points: 15, timeLimit: 15,
      };
    } else {
      const facts = [
        ['Cá voi', 'Đẻ con và nuôi con bằng sữa mẹ (thú biển)', 'Cá chép', 'Cá sấu', 'Chim cánh cụt'],
        ['Lá cây', 'Bộ phận chủ yếu thực hiện quang hợp', 'Rễ cây', 'Thân cây', 'Vỏ cây'],
        ['Khí Nitơ', 'Khí chiếm thể tích lớn nhất trong không khí (~78%)', 'Khí Oxi', 'Khí CO₂', 'Khí Hiđrô'],
        ['100°C', 'Nhiệt độ sôi của nước tinh khiết ở áp suất chuẩn', '0°C', '50°C', '80°C'],
      ][Math.floor(Math.random() * 4)];
      const q = `Đặc điểm: "${facts[1]}" tương ứng với:`;
      const opts = [facts[0], facts[2], facts[3], facts[4]].sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 1, category: 'Khám Phá KHTN (Cấp 1)',
        question: q, options: opts, correctIndex: opts.indexOf(facts[0]),
        explanation: `${facts[0]} chính là: ${facts[1]}.`,
        points: 15, timeLimit: 15,
      };
    }
  }

  static grade6_9() {
    const mode = ['ohm', 'mol', 'pressure', 'speed_phys', 'dna', 'elem_z'][Math.floor(Math.random() * 6)];
    if (mode === 'ohm') {
      const r = [5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)];
      const i = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
      const u = i * r;
      const ask = ['I', 'U', 'R'][Math.floor(Math.random() * 3)];
      let q, ans, unit;
      if (ask === 'I') {
        q = `[Vật lí Lớp 9] Đặt U = ${u} V vào hai đầu điện trở R = ${r} Ω. Cường độ dòng điện I qua điện trở là:`;
        ans = i; unit = 'A';
      } else if (ask === 'U') {
        q = `[Vật lí Lớp 9] Dòng điện I = ${i} A chạy qua điện trở R = ${r} Ω. Hiệu điện thế U hai đầu dây là:`;
        ans = u; unit = 'V';
      } else {
        q = `[Vật lí Lớp 9] Đặt U = ${u} V vào hai đầu dây thấy dòng điện I = ${i} A. Điện trở R của dây là:`;
        ans = r; unit = 'Ω';
      }
      const { options, correctIndex } = makeDistractors(ans);
      return {
        subject: 'khoahoc', level: 2, category: 'Vật Lí Lớp 9 (Định Luật Ôm)',
        question: q, options: options.map((o) => `${o} ${unit}`), correctIndex,
        explanation: `Theo định luật Ôm: I = U / R => kết quả: ${ans} ${unit}.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'mol') {
      const comp = COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
      const n = [1, 2, 3, 0.5][Math.floor(Math.random() * 4)];
      const m = n * comp.m;
      const isFloat = n === 0.5 || comp.m === 58.5;
      const q = `[Hóa học Lớp 8] Khối lượng của ${n} mol ${comp.name} là bao nhiêu gam?`;
      const { options, correctIndex } = makeDistractors(m, 3, 1, isFloat);
      return {
        subject: 'khoahoc', level: 2, category: 'Hóa Học Lớp 8 (Mol & Khối Lượng)',
        question: q, options: options.map((o) => `${o} g`), correctIndex,
        explanation: `Khối lượng m = n x M = ${n} x ${comp.m} = ${m} g.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'pressure') {
      const s = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
      const f = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
      const p = f / s;
      const q = `[Vật lí Lớp 8] Áp lực F = ${f} N ép vuông góc lên diện tích S = ${s} m². Áp suất p là:`;
      const { options, correctIndex } = makeDistractors(p, 3, 50);
      return {
        subject: 'khoahoc', level: 2, category: 'Vật Lí Lớp 8 (Áp Suất)',
        question: q, options: options.map((o) => `${o} Pa`), correctIndex,
        explanation: `Áp suất p = F / S = ${f} / ${s} = ${p} Pa.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'speed_phys') {
      const t = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const v = [12, 15, 18, 20, 36][Math.floor(Math.random() * 5)];
      const s = v * t;
      const q = `[Vật lí Lớp 7] Đi quãng đường ${s} km trong thời gian ${t} h. Tốc độ chuyển động là:`;
      const { options, correctIndex } = makeDistractors(v);
      return {
        subject: 'khoahoc', level: 2, category: 'Vật Lí Lớp 7 (Tốc Độ)',
        question: q, options: options.map((o) => `${o} km/h`), correctIndex,
        explanation: `Tốc độ v = s / t = ${s} / ${t} = ${v} km/h.`,
        points: 25, timeLimit: 25,
      };
    } else if (mode === 'dna') {
      const c = [100, 120, 150, 200][Math.floor(Math.random() * 4)];
      const n = c * 20;
      const l = (n / 2) * 3.4;
      const q = `[Sinh học Lớp 9] Một ADN có N = ${n} nuclêôtit. Chiều dài L của gen bằng:`;
      const { options, correctIndex } = makeDistractors(l, 3, 170);
      return {
        subject: 'khoahoc', level: 2, category: 'Sinh Học Lớp 9 (ADN)',
        question: q, options: options.map((o) => `${o} Å`), correctIndex,
        explanation: `Chiều dài L = (N / 2) x 3.4 = ${l} Å.`,
        points: 25, timeLimit: 25,
      };
    } else {
      const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
      const q = `[KHTN Lớp 7] Số hiệu nguyên tử (số proton Z) của nguyên tố ${el.name} (${el.sym}) là:`;
      const { options, correctIndex } = makeDistractors(el.z);
      return {
        subject: 'khoahoc', level: 2, category: 'KHTN Lớp 7 (Nguyên Tử)',
        question: q, options, correctIndex,
        explanation: `Nguyên tố ${el.name} (${el.sym}) có số hiệu nguyên tử Z = ${el.z}.`,
        points: 25, timeLimit: 25,
      };
    }
  }

  static grade10_12() {
    const mode = ['oscillation', 'hardy_weinberg', 'organic', 'genetics'][Math.floor(Math.random() * 4)];
    if (mode === 'oscillation') {
      const a = [2, 4, 5, 8, 10][Math.floor(Math.random() * 5)];
      const w = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
      const vmax = a * w;
      const q = `[Vật lí THPT] Phương trình dao động điều hòa x = ${a} cos(${w}t) (cm). Vận tốc cực đại v_max là:`;
      const { options, correctIndex } = makeDistractors(vmax, 3, 10);
      return {
        subject: 'khoahoc', level: 3, category: 'Vật Lí THPT (Dao Động)',
        question: q, options: options.map((o) => `${o} cm/s`), correctIndex,
        explanation: `Vận tốc cực đại v_max = ω x A = ${w} x ${a} = ${vmax} cm/s.`,
        points: 40, timeLimit: 35,
      };
    } else if (mode === 'hardy_weinberg') {
      const p = [0.6, 0.7, 0.8, 0.4][Math.floor(Math.random() * 4)];
      const qVal = Math.round((1 - p) * 10) / 10;
      const target = ['AA', 'Aa', 'aa'][Math.floor(Math.random() * 3)];
      const ans = target === 'AA' ? Math.round(p * p * 100) / 100 : (target === 'aa' ? Math.round(qVal * qVal * 100) / 100 : Math.round(2 * p * qVal * 100) / 100);
      const tgtTxt = target === 'AA' ? 'đồng hợp trội (AA)' : (target === 'aa' ? 'đồng hợp lặn (aa)' : 'dị hợp (Aa)');
      const q = `[Sinh học THPT] Quần thể cân bằng có tần số alen A = ${p} và a = ${qVal}. Tỉ lệ kiểu gen ${tgtTxt} là:`;
      const ansStr = String(ans);
      const opts = Array.from(new Set([ansStr, String(Math.round((ans + 0.12) * 100) / 100), String(Math.round(Math.abs(ans - 0.16) * 100) / 100), String(Math.round((1 - ans) * 100) / 100)]));
      while (opts.length < 4) opts.push(String(Math.round((ans + opts.length * 0.08) * 100) / 100));
      opts.sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 3, category: 'Sinh Học THPT (Di Truyền Quần Thể)',
        question: q, options: opts, correctIndex: opts.indexOf(ansStr),
        explanation: `Theo Hardy-Weinberg: Tỉ lệ ${target} = ${ans}.`,
        points: 40, timeLimit: 35,
      };
    } else if (mode === 'organic') {
      const facts = [
        ['[Hóa học THPT] Thủy phân este CH₃COOC₂H₅ trong NaOH thu được muối nào?', 'CH₃COONa (Natri axetat)', ['C₂H₅COONa', 'HCOONa', 'CH₃COOH']],
        ['[Hóa học THPT] Kim loại nào dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại?', 'Bạc (Ag)', ['Đồng (Cu)', 'Vàng (Au)', 'Nhôm (Al)']],
        ['[Hóa học THPT] Nhận biết dung dịch chứa tinh bột bằng thuốc thử nào?', 'Dung dịch Iot (I₂)', ['Dung dịch AgNO₃/NH₃', 'Cu(OH)₂', 'Nước Brom']],
      ][Math.floor(Math.random() * 3)];
      const opts = [facts[1], ...facts[2]].sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 3, category: 'Hóa Học THPT (Hóa Học)',
        question: facts[0], options: opts, correctIndex: opts.indexOf(facts[1]),
        explanation: `Kiến thức hóa học THPT: ${facts[1]}.`,
        points: 40, timeLimit: 35,
      };
    } else {
      const facts = [
        ['[Sinh học THPT] Mã mở đầu dịch mã và mã hóa Methionine là:', "5' AUG 3'", ["5' UAA 3'", "5' UAG 3'", "5' UGA 3'"]],
        ['[Sinh học THPT] Quá trình nhân đôi ADN diễn ra theo nguyên tắc nào?', 'Bổ sung và bán bảo tồn', ['Bổ sung và bảo tồn', 'Chỉ bổ sung', 'Gián đoạn']],
        ['[Vật lí THPT] Thuyết lượng tử ánh sáng khẳng định mỗi photon mang năng lượng:', 'ε = hf = hc / λ', ['ε = h / f', 'ε = h λ', 'ε = mc']],
      ][Math.floor(Math.random() * 3)];
      const opts = [facts[1], ...facts[2]].sort(() => Math.random() - 0.5);
      return {
        subject: 'khoahoc', level: 3, category: 'Sinh - Lí THPT (Cấp 3)',
        question: facts[0], options: opts, correctIndex: opts.indexOf(facts[1]),
        explanation: `Kiến thức THPT: ${facts[1]}.`,
        points: 40, timeLimit: 35,
      };
    }
  }
}

// ==============================================================================
// 3. PUBLIC DISPATCHER
// ==============================================================================

export function getQuizQuestion({ subject = 'toan', level = 1 } = {}) {
  const sub = String(subject).toLowerCase();
  const lvl = Number(level) || 1;

  if (sub === 'khoahoc' || sub === 'khtn' || sub === 'science') {
    if (lvl === 1) return ProceduralScience.grade1_5();
    if (lvl === 2) return ProceduralScience.grade6_9();
    return ProceduralScience.grade10_12();
  } else {
    if (lvl === 1) return ProceduralMath.grade1_5();
    if (lvl === 2) return ProceduralMath.grade6_9();
    return ProceduralMath.grade10_12();
  }
}

