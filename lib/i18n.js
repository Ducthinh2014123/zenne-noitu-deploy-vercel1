import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES } from './languages';

// Ngon ngu giao dien (UI) cua trang web - KHONG lien quan toi ngon ngu tu dien
// (Wikipedia) dung de kiem tra tu trong game. Ho tro toan bo 300+ ma trong
// lib/languages.js, nhung chi 14 ngon ngu duoi day co ban dich day du; cac
// ngon ngu khac se tu dong fallback ve tieng Anh roi tieng Viet.

export const FULLY_TRANSLATED = ['vi','en','ja','ko','zh','fr','de','es','pt','ru','th','id','ar','tr'];

const dictVi = {
  brand: 'Nối Từ Bot',
  nav_home: 'Trang Chủ',
  nav_leaderboard: 'BXH',
  nav_wordbank: 'Kho Từ',
  nav_rejected: 'Bị Từ Chối',
  nav_servers: 'Servers',
  nav_milestones: 'Cột Mốc',
  nav_play: 'Chơi Online',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  account: 'Tài khoản',
  admin: 'Admin',
  language: 'Ngôn ngữ',
  players_label: 'Người chơi',
  online: 'Online',
  offline: 'Offline',
  copy_link: 'Copy link mời',
  copied: 'Đã copy!',
  current_word_label: 'Từ hiện tại',
  start_with_label: 'Bắt đầu bằng',
  waiting_title: 'Chờ bắt đầu...',
  waiting_host: 'Đợi host bắt đầu...',
  start_game_button: 'Bắt đầu game!',
  play_again: 'Chơi lại',
  hint_button: 'Gợi ý',
  hint_title: 'Kiểm tra âm tiết này còn nối tiếp được không',
  not_your_turn: 'Chưa đến lượt bạn',
  checking_word: 'Đang kiểm tra từ...',
  need_login_title: 'Cần đăng nhập để vào phòng',
  need_login_desc: 'Đăng nhập để điểm của bạn được ghi vào bảng xếp hạng chung.',
  login_button: 'Đăng nhập',
  enter_room_button: 'Vào phòng!',
  winner_suffix: 'chiến thắng!',
  ended_title: 'Kết thúc!',
  log_empty: 'Nhật ký game hiện ở đây...',
  language_switcher_title: 'Chọn ngôn ngữ giao diện',
  language_search_placeholder: 'Tìm ngôn ngữ (vd: en, Tiếng Việt, Japanese...)',
};

const dictEn = {
  brand: 'Noi Tu Bot',
  nav_home: 'Home',
  nav_leaderboard: 'Leaderboard',
  nav_wordbank: 'Word Bank',
  nav_rejected: 'Rejected',
  nav_servers: 'Servers',
  nav_milestones: 'Milestones',
  nav_play: 'Play Online',
  login: 'Log in',
  logout: 'Log out',
  account: 'Account',
  admin: 'Admin',
  language: 'Language',
  players_label: 'Players',
  online: 'Online',
  offline: 'Offline',
  copy_link: 'Copy invite link',
  copied: 'Copied!',
  current_word_label: 'Current word',
  start_with_label: 'Start with',
  waiting_title: 'Waiting to start...',
  waiting_host: 'Waiting for the host to start...',
  start_game_button: 'Start game!',
  play_again: 'Play again',
  hint_button: 'Hint',
  hint_title: 'Check whether this syllable can still be chained',
  not_your_turn: "It's not your turn",
  checking_word: 'Checking word...',
  need_login_title: 'You need to log in to join the room',
  need_login_desc: 'Log in so your score counts toward the shared leaderboard.',
  login_button: 'Log in',
  enter_room_button: 'Enter room!',
  winner_suffix: 'wins!',
  ended_title: 'Game over!',
  log_empty: 'The game log will appear here...',
  language_switcher_title: 'Choose interface language',
  language_search_placeholder: 'Search language (e.g. vi, English, 日本語...)',
};

const dictJa = {
  brand: 'ノイトゥ・ボット', nav_home: 'ホーム', nav_leaderboard: 'ランキング', nav_wordbank: '単語集',
  nav_rejected: '拒否された単語', nav_servers: 'サーバー', nav_milestones: 'マイルストーン', nav_play: 'オンラインで遊ぶ',
  login: 'ログイン', logout: 'ログアウト', account: 'アカウント', admin: '管理者', language: '言語',
  players_label: 'プレイヤー', online: 'オンライン', offline: 'オフライン', copy_link: '招待リンクをコピー', copied: 'コピーしました!',
  current_word_label: '現在の単語', start_with_label: 'この文字で始める', waiting_title: '開始を待っています...',
  waiting_host: 'ホストが開始するのを待っています...', start_game_button: 'ゲーム開始!', play_again: 'もう一度プレイ',
  hint_button: 'ヒント', hint_title: 'この音節がまだ続けられるか確認する', not_your_turn: 'あなたの番ではありません',
  checking_word: '単語を確認中...', need_login_title: '参加するにはログインが必要です',
  need_login_desc: 'ログインするとスコアが共通ランキングに反映されます。', login_button: 'ログイン', enter_room_button: '入室!',
  winner_suffix: 'の勝利!', ended_title: 'ゲーム終了!', log_empty: 'ここにゲームログが表示されます...',
  language_switcher_title: '表示言語を選択', language_search_placeholder: '言語を検索 (例: vi, English, 日本語...)',
};

const dictKo = {
  brand: '노이뜨 봇', nav_home: '홈', nav_leaderboard: '순위표', nav_wordbank: '단어장', nav_rejected: '거부된 단어',
  nav_servers: '서버', nav_milestones: '마일스톤', nav_play: '온라인 플레이', login: '로그인', logout: '로그아웃',
  account: '계정', admin: '관리자', language: '언어', players_label: '플레이어', online: '온라인', offline: '오프라인',
  copy_link: '초대 링크 복사', copied: '복사됨!', current_word_label: '현재 단어', start_with_label: '이 글자로 시작',
  waiting_title: '시작 대기 중...', waiting_host: '호스트가 시작하기를 기다리는 중...', start_game_button: '게임 시작!',
  play_again: '다시 하기', hint_button: '힌트', hint_title: '이 음절이 계속 이어질 수 있는지 확인',
  not_your_turn: '당신의 차례가 아닙니다', checking_word: '단어 확인 중...', need_login_title: '방에 참여하려면 로그인하세요',
  need_login_desc: '로그인하면 점수가 공용 순위표에 반영됩니다.', login_button: '로그인', enter_room_button: '입장!',
  winner_suffix: '승리!', ended_title: '게임 종료!', log_empty: '게임 로그가 여기에 표시됩니다...',
  language_switcher_title: '표시 언어 선택', language_search_placeholder: '언어 검색 (예: vi, English, 한국어...)',
};

const dictZh = {
  brand: '接词机器人', nav_home: '首页', nav_leaderboard: '排行榜', nav_wordbank: '词库', nav_rejected: '被拒绝的词',
  nav_servers: '服务器', nav_milestones: '里程碑', nav_play: '在线游玩', login: '登录', logout: '登出',
  account: '账户', admin: '管理员', language: '语言', players_label: '玩家', online: '在线', offline: '离线',
  copy_link: '复制邀请链接', copied: '已复制!', current_word_label: '当前词语', start_with_label: '以此字开头',
  waiting_title: '等待开始...', waiting_host: '等待房主开始...', start_game_button: '开始游戏!',
  play_again: '再玩一次', hint_button: '提示', hint_title: '检查这个音节是否还能接下去',
  not_your_turn: '还没轮到你', checking_word: '正在检查词语...', need_login_title: '需要登录才能加入房间',
  need_login_desc: '登录后你的分数才会计入共同排行榜。', login_button: '登录', enter_room_button: '进入房间!',
  winner_suffix: '获胜!', ended_title: '游戏结束!', log_empty: '游戏日志会显示在这里...',
  language_switcher_title: '选择界面语言', language_search_placeholder: '搜索语言 (例如 vi, English, 中文...)',
};

const dictFr = {
  brand: 'Noi Tu Bot', nav_home: 'Accueil', nav_leaderboard: 'Classement', nav_wordbank: 'Banque de mots',
  nav_rejected: 'Rejetés', nav_servers: 'Serveurs', nav_milestones: 'Jalons', nav_play: 'Jouer en ligne',
  login: 'Connexion', logout: 'Déconnexion', account: 'Compte', admin: 'Admin', language: 'Langue',
  players_label: 'Joueurs', online: 'En ligne', offline: 'Hors ligne', copy_link: "Copier le lien d'invitation",
  copied: 'Copié !', current_word_label: 'Mot actuel', start_with_label: 'Commencer par',
  waiting_title: 'En attente du début...', waiting_host: "En attente que l'hôte démarre...",
  start_game_button: 'Démarrer la partie !', play_again: 'Rejouer', hint_button: 'Indice',
  hint_title: 'Vérifier si cette syllabe peut encore être enchaînée', not_your_turn: "Ce n'est pas votre tour",
  checking_word: 'Vérification du mot...', need_login_title: 'Connexion requise pour rejoindre la salle',
  need_login_desc: 'Connectez-vous pour que votre score compte dans le classement commun.',
  login_button: 'Connexion', enter_room_button: 'Entrer !', winner_suffix: 'gagne !', ended_title: 'Partie terminée !',
  log_empty: "Le journal de la partie s'affichera ici...", language_switcher_title: "Choisir la langue de l'interface",
  language_search_placeholder: 'Rechercher une langue (ex: vi, English, français...)',
};

const dictDe = {
  brand: 'Noi Tu Bot', nav_home: 'Start', nav_leaderboard: 'Bestenliste', nav_wordbank: 'Wortbank',
  nav_rejected: 'Abgelehnt', nav_servers: 'Server', nav_milestones: 'Meilensteine', nav_play: 'Online spielen',
  login: 'Anmelden', logout: 'Abmelden', account: 'Konto', admin: 'Admin', language: 'Sprache',
  players_label: 'Spieler', online: 'Online', offline: 'Offline', copy_link: 'Einladungslink kopieren',
  copied: 'Kopiert!', current_word_label: 'Aktuelles Wort', start_with_label: 'Beginnt mit',
  waiting_title: 'Warten auf Start...', waiting_host: 'Warten, bis der Host startet...',
  start_game_button: 'Spiel starten!', play_again: 'Erneut spielen', hint_button: 'Tipp',
  hint_title: 'Prüfen, ob diese Silbe noch fortgesetzt werden kann', not_your_turn: 'Du bist nicht am Zug',
  checking_word: 'Wort wird geprüft...', need_login_title: 'Anmeldung erforderlich, um dem Raum beizutreten',
  need_login_desc: 'Melde dich an, damit dein Punktestand in die gemeinsame Bestenliste einfließt.',
  login_button: 'Anmelden', enter_room_button: 'Betreten!', winner_suffix: 'gewinnt!', ended_title: 'Spiel beendet!',
  log_empty: 'Das Spielprotokoll erscheint hier...', language_switcher_title: 'Oberflächensprache wählen',
  language_search_placeholder: 'Sprache suchen (z. B. vi, English, Deutsch...)',
};

const dictEs = {
  brand: 'Noi Tu Bot', nav_home: 'Inicio', nav_leaderboard: 'Clasificación', nav_wordbank: 'Banco de palabras',
  nav_rejected: 'Rechazadas', nav_servers: 'Servidores', nav_milestones: 'Hitos', nav_play: 'Jugar en línea',
  login: 'Iniciar sesión', logout: 'Cerrar sesión', account: 'Cuenta', admin: 'Admin', language: 'Idioma',
  players_label: 'Jugadores', online: 'En línea', offline: 'Desconectado', copy_link: 'Copiar enlace de invitación',
  copied: '¡Copiado!', current_word_label: 'Palabra actual', start_with_label: 'Empezar con',
  waiting_title: 'Esperando para empezar...', waiting_host: 'Esperando que el anfitrión empiece...',
  start_game_button: '¡Empezar partida!', play_again: 'Jugar otra vez', hint_button: 'Pista',
  hint_title: 'Comprobar si esta sílaba todavía puede continuarse', not_your_turn: 'No es tu turno',
  checking_word: 'Comprobando palabra...', need_login_title: 'Necesitas iniciar sesión para entrar a la sala',
  need_login_desc: 'Inicia sesión para que tu puntaje cuente en la clasificación compartida.',
  login_button: 'Iniciar sesión', enter_room_button: '¡Entrar!', winner_suffix: '¡gana!', ended_title: '¡Partida terminada!',
  log_empty: 'El registro de la partida aparecerá aquí...', language_switcher_title: 'Elegir idioma de la interfaz',
  language_search_placeholder: 'Buscar idioma (ej: vi, English, español...)',
};

const dictPt = {
  brand: 'Noi Tu Bot', nav_home: 'Início', nav_leaderboard: 'Classificação', nav_wordbank: 'Banco de palavras',
  nav_rejected: 'Rejeitadas', nav_servers: 'Servidores', nav_milestones: 'Marcos', nav_play: 'Jogar online',
  login: 'Entrar', logout: 'Sair', account: 'Conta', admin: 'Admin', language: 'Idioma',
  players_label: 'Jogadores', online: 'Online', offline: 'Offline', copy_link: 'Copiar link de convite',
  copied: 'Copiado!', current_word_label: 'Palavra atual', start_with_label: 'Começar com',
  waiting_title: 'Aguardando início...', waiting_host: 'Aguardando o anfitrião iniciar...',
  start_game_button: 'Iniciar jogo!', play_again: 'Jogar novamente', hint_button: 'Dica',
  hint_title: 'Verificar se esta sílaba ainda pode ser encadeada', not_your_turn: 'Não é a sua vez',
  checking_word: 'Verificando palavra...', need_login_title: 'É necessário entrar para acessar a sala',
  need_login_desc: 'Entre para que sua pontuação conte no ranking compartilhado.',
  login_button: 'Entrar', enter_room_button: 'Entrar na sala!', winner_suffix: 'venceu!', ended_title: 'Fim de jogo!',
  log_empty: 'O registro do jogo aparecerá aqui...', language_switcher_title: 'Escolher idioma da interface',
  language_search_placeholder: 'Buscar idioma (ex: vi, English, português...)',
};

const dictRu = {
  brand: 'Noi Tu Bot', nav_home: 'Главная', nav_leaderboard: 'Рейтинг', nav_wordbank: 'Банк слов',
  nav_rejected: 'Отклонённые', nav_servers: 'Серверы', nav_milestones: 'Этапы', nav_play: 'Играть онлайн',
  login: 'Войти', logout: 'Выйти', account: 'Аккаунт', admin: 'Админ', language: 'Язык',
  players_label: 'Игроки', online: 'Онлайн', offline: 'Не в сети', copy_link: 'Копировать ссылку-приглашение',
  copied: 'Скопировано!', current_word_label: 'Текущее слово', start_with_label: 'Начинается на',
  waiting_title: 'Ожидание начала...', waiting_host: 'Ожидание, когда хост начнёт...',
  start_game_button: 'Начать игру!', play_again: 'Играть снова', hint_button: 'Подсказка',
  hint_title: 'Проверить, можно ли продолжить этот слог', not_your_turn: 'Сейчас не ваш ход',
  checking_word: 'Проверка слова...', need_login_title: 'Чтобы войти в комнату, нужно войти в аккаунт',
  need_login_desc: 'Войдите, чтобы ваш счёт учитывался в общем рейтинге.',
  login_button: 'Войти', enter_room_button: 'Войти в комнату!', winner_suffix: 'победил(а)!', ended_title: 'Игра окончена!',
  log_empty: 'Здесь появится журнал игры...', language_switcher_title: 'Выбрать язык интерфейса',
  language_search_placeholder: 'Поиск языка (напр. vi, English, русский...)',
};

const dictTh = {
  brand: 'บอทต่อคำ', nav_home: 'หน้าแรก', nav_leaderboard: 'ตารางคะแนน', nav_wordbank: 'คลังคำ',
  nav_rejected: 'คำที่ถูกปฏิเสธ', nav_servers: 'เซิร์ฟเวอร์', nav_milestones: 'เป้าหมาย', nav_play: 'เล่นออนไลน์',
  login: 'เข้าสู่ระบบ', logout: 'ออกจากระบบ', account: 'บัญชี', admin: 'ผู้ดูแล', language: 'ภาษา',
  players_label: 'ผู้เล่น', online: 'ออนไลน์', offline: 'ออฟไลน์', copy_link: 'คัดลอกลิงก์เชิญ',
  copied: 'คัดลอกแล้ว!', current_word_label: 'คำปัจจุบัน', start_with_label: 'เริ่มด้วย',
  waiting_title: 'กำลังรอเริ่มเกม...', waiting_host: 'กำลังรอให้เจ้าของห้องเริ่มเกม...',
  start_game_button: 'เริ่มเกม!', play_again: 'เล่นอีกครั้ง', hint_button: 'คำแนะนำ',
  hint_title: 'ตรวจสอบว่าพยางค์นี้ยังต่อได้หรือไม่', not_your_turn: 'ยังไม่ถึงตาคุณ',
  checking_word: 'กำลังตรวจสอบคำ...', need_login_title: 'ต้องเข้าสู่ระบบก่อนเข้าห้อง',
  need_login_desc: 'เข้าสู่ระบบเพื่อให้คะแนนของคุณถูกบันทึกในตารางคะแนนรวม',
  login_button: 'เข้าสู่ระบบ', enter_room_button: 'เข้าห้อง!', winner_suffix: 'ชนะ!', ended_title: 'เกมจบแล้ว!',
  log_empty: 'บันทึกเกมจะแสดงที่นี่...', language_switcher_title: 'เลือกภาษาของอินเทอร์เฟซ',
  language_search_placeholder: 'ค้นหาภาษา (เช่น vi, English, ไทย...)',
};

const dictId = {
  brand: 'Noi Tu Bot', nav_home: 'Beranda', nav_leaderboard: 'Papan Peringkat', nav_wordbank: 'Bank Kata',
  nav_rejected: 'Ditolak', nav_servers: 'Server', nav_milestones: 'Tonggak', nav_play: 'Main Online',
  login: 'Masuk', logout: 'Keluar', account: 'Akun', admin: 'Admin', language: 'Bahasa',
  players_label: 'Pemain', online: 'Online', offline: 'Offline', copy_link: 'Salin tautan undangan',
  copied: 'Disalin!', current_word_label: 'Kata saat ini', start_with_label: 'Mulai dengan',
  waiting_title: 'Menunggu dimulai...', waiting_host: 'Menunggu host memulai...',
  start_game_button: 'Mulai permainan!', play_again: 'Main lagi', hint_button: 'Petunjuk',
  hint_title: 'Periksa apakah suku kata ini masih bisa disambung', not_your_turn: 'Belum giliranmu',
  checking_word: 'Memeriksa kata...', need_login_title: 'Perlu masuk untuk bergabung ke ruangan',
  need_login_desc: 'Masuk agar skormu tercatat di papan peringkat bersama.',
  login_button: 'Masuk', enter_room_button: 'Masuk ruangan!', winner_suffix: 'menang!', ended_title: 'Permainan selesai!',
  log_empty: 'Log permainan akan tampil di sini...', language_switcher_title: 'Pilih bahasa antarmuka',
  language_search_placeholder: 'Cari bahasa (mis. vi, English, Indonesia...)',
};

const dictAr = {
  brand: 'بوت نوي تو', nav_home: 'الرئيسية', nav_leaderboard: 'لوحة المتصدرين', nav_wordbank: 'بنك الكلمات',
  nav_rejected: 'المرفوضة', nav_servers: 'الخوادم', nav_milestones: 'الإنجازات', nav_play: 'اللعب عبر الإنترنت',
  login: 'تسجيل الدخول', logout: 'تسجيل الخروج', account: 'الحساب', admin: 'المسؤول', language: 'اللغة',
  players_label: 'اللاعبون', online: 'متصل', offline: 'غير متصل', copy_link: 'نسخ رابط الدعوة',
  copied: 'تم النسخ!', current_word_label: 'الكلمة الحالية', start_with_label: 'تبدأ بـ',
  waiting_title: 'في انتظار البدء...', waiting_host: 'في انتظار أن يبدأ المضيف...',
  start_game_button: 'ابدأ اللعبة!', play_again: 'اللعب مرة أخرى', hint_button: 'تلميح',
  hint_title: 'تحقق مما إذا كان يمكن مواصلة هذه المقطع', not_your_turn: 'ليس دورك الآن',
  checking_word: 'جارٍ التحقق من الكلمة...', need_login_title: 'يجب تسجيل الدخول للانضمام إلى الغرفة',
  need_login_desc: 'سجّل الدخول لتُحسب نقاطك في لوحة المتصدرين المشتركة.',
  login_button: 'تسجيل الدخول', enter_room_button: 'دخول الغرفة!', winner_suffix: 'فاز!', ended_title: 'انتهت اللعبة!',
  log_empty: 'سيظهر سجل اللعبة هنا...', language_switcher_title: 'اختر لغة الواجهة',
  language_search_placeholder: 'ابحث عن لغة (مثل vi, English, العربية...)',
};

const dictTr = {
  brand: 'Noi Tu Bot', nav_home: 'Ana Sayfa', nav_leaderboard: 'Lider Tablosu', nav_wordbank: 'Kelime Bankası',
  nav_rejected: 'Reddedilenler', nav_servers: 'Sunucular', nav_milestones: 'Kilometre Taşları', nav_play: 'Çevrimiçi Oyna',
  login: 'Giriş yap', logout: 'Çıkış yap', account: 'Hesap', admin: 'Yönetici', language: 'Dil',
  players_label: 'Oyuncular', online: 'Çevrimiçi', offline: 'Çevrimdışı', copy_link: 'Davet bağlantısını kopyala',
  copied: 'Kopyalandı!', current_word_label: 'Geçerli kelime', start_with_label: 'Şununla başla',
  waiting_title: 'Başlaması bekleniyor...', waiting_host: "Ev sahibinin başlatması bekleniyor...",
  start_game_button: 'Oyunu başlat!', play_again: 'Tekrar oyna', hint_button: 'İpucu',
  hint_title: 'Bu hecenin devam edip edemeyeceğini kontrol et', not_your_turn: 'Sıra sende değil',
  checking_word: 'Kelime kontrol ediliyor...', need_login_title: 'Odaya katılmak için giriş yapmalısınız',
  need_login_desc: 'Puanının ortak lider tablosuna sayılması için giriş yap.',
  login_button: 'Giriş yap', enter_room_button: 'Odaya gir!', winner_suffix: 'kazandı!', ended_title: 'Oyun bitti!',
  log_empty: 'Oyun kaydı burada görünecek...', language_switcher_title: 'Arayüz dilini seç',
  language_search_placeholder: 'Dil ara (örn. vi, English, Türkçe...)',
};

export const TRANSLATIONS = {
  vi: dictVi, en: dictEn, ja: dictJa, ko: dictKo, zh: dictZh, fr: dictFr, de: dictDe,
  es: dictEs, pt: dictPt, ru: dictRu, th: dictTh, id: dictId, ar: dictAr, tr: dictTr,
};

const STORAGE_KEY = 'noitu_ui_lang';

function baseCode(code) {
  return (code || '').split('-')[0].toLowerCase();
}

export function resolveDict(lang) {
  const lc = (lang || 'vi').toLowerCase();
  return TRANSLATIONS[lc] || TRANSLATIONS[baseCode(lc)] || TRANSLATIONS.en || TRANSLATIONS.vi;
}

const LANGUAGE_BY_CODE = LANGUAGES.reduce((acc, l) => { acc[l.code.toLowerCase()] = l; return acc; }, {});

export function isKnownLang(code) {
  if (!code) return false;
  const lc = code.toLowerCase();
  return Boolean(LANGUAGE_BY_CODE[lc] || LANGUAGE_BY_CODE[baseCode(lc)]);
}

export function langDisplayName(code) {
  const lc = (code || '').toLowerCase();
  const row = LANGUAGE_BY_CODE[lc] || LANGUAGE_BY_CODE[baseCode(lc)];
  return row ? `${row.name_native} (${row.name_en})` : code;
}

export function searchLanguages(query, limit = 30) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return LANGUAGES.slice(0, limit);
  const out = [];
  for (const l of LANGUAGES) {
    if (
      l.code.toLowerCase().includes(q) ||
      l.name_en.toLowerCase().includes(q) ||
      l.name_native.toLowerCase().includes(q)
    ) {
      out.push(l);
      if (out.length >= limit) break;
    }
  }
  return out;
}

const I18nContext = createContext({
  lang: 'vi',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('vi');

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (saved) setLangState(saved);
      else if (typeof navigator !== 'undefined' && navigator.language) {
        const nav = baseCode(navigator.language);
        if (TRANSLATIONS[nav]) setLangState(nav);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const setLang = (code) => {
    const lc = (code || 'vi').toLowerCase();
    setLangState(lc);
    try { window.localStorage.setItem(STORAGE_KEY, lc); } catch (e) { /* ignore */ }
  };

  const t = useMemo(() => {
    const dict = resolveDict(lang);
    return (key, vars) => {
      let str = dict[key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.vi[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll('{' + k + '}', String(v));
        }
      }
      return str;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
