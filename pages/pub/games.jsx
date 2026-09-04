import Link from 'next/link';
import PubLayout from '../../components/PubLayout';
import { IconHash, IconSnake, IconGrid3x3, IconBomb, IconArrowRight, IconTrophy } from '../../components/icons';

const GAMES = [
  { href: '/pub/2048',        Icon: IconHash,     title: '2048',        desc: 'Don cac o so giong nhau de dat toi 2048. Diem cang cao cang tot.', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/40' },
  { href: '/pub/snake',       Icon: IconSnake,     title: 'Snake',       desc: 'Dieu khien ran an moi, tranh dam vao tuong va chinh minh.', color: 'text-green-400 bg-green-900/20 border-green-700/40' },
  { href: '/pub/tictactoe',   Icon: IconGrid3x3,  title: 'Tic Tac Toe', desc: 'Doi dau voi may (AI), thang cang nhieu van lien tiep cang cao diem.', color: 'text-indigo-400 bg-indigo-900/20 border-indigo-700/40' },
  { href: '/pub/minesweeper', Icon: IconBomb,      title: 'Minesweeper', desc: 'Do min: mo o trong, gan co bao min, cang nhanh cang duoc nhieu diem.', color: 'text-red-400 bg-red-900/20 border-red-700/40' },
];

export default function GamesHub() {
  return (
    <PubLayout title="Tro Choi">
      <p className="text-gray-500 text-sm mb-6">
        Choi mini-game ngay tren trinh duyet. Dang nhap de diem cua ban duoc ghi vao bang xep hang rieng cua tung game.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {GAMES.map(g => (
          <Link key={g.href} href={g.href}
            className="group flex items-start gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-600/60 transition-colors">
            <span className={`flex items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${g.color}`}>
              <g.Icon className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">{g.title}</h3>
                <IconArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/pub/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          <IconTrophy className="w-4 h-4" /> Xem bang xep hang cac tro choi
        </Link>
      </div>
    </PubLayout>
  );
}
