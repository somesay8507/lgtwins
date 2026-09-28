import type { CheerStaffMember, PlayerCheerSong, TeamCheerSong } from "@/lib/types";

// 2026-09-28 기준 lgtwins.com/fan/songs, lgtwins.com/fan/cheers 원본 HTML을
// 직접 파싱해 확보. 가사 저작권 문제로 곡 제목만 담는다(가사 전문·멜로디 없음).
export const TEAM_CHEER_SONGS: TeamCheerSong[] = [
  { title: "2020 일어나라 LG" },
  { title: "강해져라" },
  { title: "깃발응원가" },
  { title: "라인업 송 - 유모레스크" },
  { title: "무적 LG 끝까지 트윈스" },
  { title: "무적의 LG" },
  { title: "사랑하는 LG" },
  { title: "사랑한다 LG" },
  { title: "승리를 위하여" },
  { title: "승리의 포효" },
  { title: "엘팬의 북소리" },
  { title: "GO TWINS" },
  { title: "LG의 승리 위해" },
];

export const PLAYER_CHEER_SONGS: PlayerCheerSong[] = [
  { player: "구본혁", title: "구본혁 응원가" },
  { player: "김주성", title: "김주성 응원가" },
  { player: "문성주", title: "문성주 응원가" },
  { player: "문정빈", title: "문정빈 응원가" },
  { player: "박동원", title: "박동원 응원가" },
  { player: "박해민", title: "박해민 응원가 1" },
  { player: "박해민", title: "박해민 응원가 2" },
  { player: "송찬의", title: "송찬의 응원가" },
  { player: "신민재", title: "신민재 응원가" },
  // "오스틴 딘"은 응원가 페이지의 표기. 선수단 로스터(src/data/players.ts)에는 "오스틴"으로만
  // 등록돼 있어 이름이 다르다 — 나중에 선수 상세 페이지와 연결할 일이 생기면 유의할 것.
  { player: "오스틴 딘", title: "오스틴 딘 응원가 1" },
  { player: "오스틴 딘", title: "오스틴 딘 응원가 2" },
  { player: "이영빈", title: "이영빈 응원가" },
  { player: "이재원", title: "이재원 응원가" },
  { player: "이주헌", title: "이주헌 응원가" },
  { player: "천성호", title: "천성호 응원가" },
  { player: "최원영", title: "최원영 응원가" },
  { player: "홍창기", title: "홍창기 응원가" },
];

export const CHEER_STAFF: CheerStaffMember[] = [
  { name: "이윤승", role: "응원단장" },
  { name: "김태리", role: "부응원단장" },
  { name: "최서용", role: "부응원단장" },
  { name: "황건하", role: "장내아나운서" },
  { name: "차영현", role: "치어리더" },
  { name: "진수화", role: "치어리더" },
  { name: "박예은", role: "치어리더" },
  { name: "신서윤", role: "치어리더" },
  { name: "임혜진", role: "치어리더" },
  { name: "우혜준", role: "치어리더" },
  { name: "고예지", role: "치어리더" },
  { name: "김태희", role: "치어리더" },
  { name: "서여진", role: "치어리더" },
  { name: "장로나", role: "치어리더" },
  { name: "양효주", role: "치어리더" },
  { name: "이서우", role: "치어리더" },
];
