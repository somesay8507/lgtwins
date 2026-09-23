import type { Player } from "@/lib/types";

// 확인 필요: 이름/포지션은 시즌 로스터와 대조해 2단계(선수단 소개)에서 검증한다.
// 등번호와 기록은 검증 전이라 넣지 않는다.
export const STAR_PLAYERS: Player[] = [
  { id: "oh-jihwan", name: "오지환", position: "유격수" },
  { id: "moon-bokyung", name: "문보경", position: "내야수" },
  { id: "park-dongwon", name: "박동원", position: "포수" },
  { id: "im-chanyu", name: "임찬규", position: "투수" },
];
