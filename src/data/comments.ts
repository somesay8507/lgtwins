import type { Comment } from "@/lib/types";

// DUMMY: 모든 댓글은 가상이며 실제와 무관합니다.
export const DUMMY_COMMENTS: Comment[] = [
  // notice-1
  {
    id: "comment-1",
    postId: "notice-1",
    author: "팬A",
    content: "좋은 정보 감사합니다. 항상 건전한 응원 문화를 위해 노력하겠습니다.",
    date: "2026-09-02",
    likes: 12,
  },
  {
    id: "comment-2",
    postId: "notice-1",
    author: "팬B",
    content: "운영진분들 고생 많습니다. 이 규칙들이 우리 커뮤니티를 더 좋게 만들어줘요.",
    date: "2026-09-03",
    likes: 8,
  },

  // notice-2
  {
    id: "comment-3",
    postId: "notice-2",
    author: "팬C",
    content: "9월 홈경기 응원이 기대돼요! 꼭 참석해야겠다.",
    date: "2026-09-04",
    likes: 15,
  },
  {
    id: "comment-4",
    postId: "notice-2",
    author: "팬D",
    content: "팬 포토존은 정말 좋은 아이디어네요. 추억 만들기 좋을 것 같아요.",
    date: "2026-09-05",
    likes: 9,
  },

  // notice-3
  {
    id: "comment-5",
    postId: "notice-3",
    author: "팬E",
    content: "사이트 정기 점검 안내 감사합니다. 일정 확인했어요.",
    date: "2026-09-06",
    likes: 3,
  },

  // notice-4
  {
    id: "comment-6",
    postId: "notice-4",
    author: "미술팬1",
    content: "오! 팬 창작물 게시판이 생겼군요. 그림 올려야겠다!",
    date: "2026-09-09",
    likes: 21,
  },
  {
    id: "comment-7",
    postId: "notice-4",
    author: "글팬1",
    content: "저도 글을 올려봐야겠어요. 창작물 공유할 수 있는 공간이 생겨서 정말 좋습니다.",
    date: "2026-09-10",
    likes: 18,
  },
  {
    id: "comment-8",
    postId: "notice-4",
    author: "팬F",
    content: "저작권 문제 조심하고 열심히 올려주세요 모두!",
    date: "2026-09-11",
    likes: 12,
  },

  // notice-5
  {
    id: "comment-9",
    postId: "notice-5",
    author: "팬G",
    content: "투표 결과가 정말 좋네요. 선정된 응원가 너무 기대돼요!",
    date: "2026-09-12",
    likes: 14,
  },

  // free-1
  {
    id: "comment-10",
    postId: "free-1",
    author: "팬H",
    content: "정말 소름 끼쳤던 경기였어요. 그 순간이 잊혀지지 않을 것 같습니다.",
    date: "2026-09-03",
    likes: 28,
  },
  {
    id: "comment-11",
    postId: "free-1",
    author: "팬I",
    content: "9회말 역전승은 야구의 매력이 뭔지 보여주는 경기였어요!",
    date: "2026-09-04",
    likes: 22,
  },
  {
    id: "comment-12",
    postId: "free-1",
    author: "팬J",
    content: "그 안타 하나로 경기가 바뀌다니... 야구는 정말 손에 땀을 흘리게 하네요.",
    date: "2026-09-05",
    likes: 19,
  },

  // free-2
  {
    id: "comment-13",
    postId: "free-2",
    author: "팬K",
    content: "직관 첫 가시는 분들 꼭 응원 도구 챙기세요. 분위기가 정말 달라져요!",
    date: "2026-09-05",
    likes: 11,
  },
  {
    id: "comment-14",
    postId: "free-2",
    author: "팬L",
    content: "휴대용 보조배터리는 필수 중의 필수! 경기 중 휴대폰이 죽으면 안 돼요.",
    date: "2026-09-06",
    likes: 8,
  },

  // free-3
  {
    id: "comment-15",
    postId: "free-3",
    author: "팬M",
    content: "선발 로테이션 참 어려운 부분이네요. 운영진도 고민이 많을 것 같습니다.",
    date: "2026-09-07",
    likes: 6,
  },
  {
    id: "comment-16",
    postId: "free-3",
    author: "팬N",
    content: "선수 B는 진짜 1선발감이 맞는데, 컨디션 관리가 중요할 것 같아요.",
    date: "2026-09-08",
    likes: 9,
  },

  // free-5
  {
    id: "comment-17",
    postId: "free-5",
    author: "팬O",
    content: "팬 미팅 후기 감사합니다! 분위기가 정말 따뜻했나봐요.",
    date: "2026-09-11",
    likes: 16,
  },
  {
    id: "comment-18",
    postId: "free-5",
    author: "팬P",
    content: "선수 A의 성실한 태도 진짜 최고예요. 팬 분들을 소중히 대해주는 게 느껴집니다.",
    date: "2026-09-12",
    likes: 24,
  },
  {
    id: "comment-19",
    postId: "free-5",
    author: "팬Q",
    content: "다음 팬 미팅도 참석하고 싶어요! 이런 시간들이 팬으로서 최고의 추억이 됩니다.",
    date: "2026-09-13",
    likes: 19,
  },

  // free-7
  {
    id: "comment-20",
    postId: "free-7",
    author: "팬R",
    content: "치킨과 떡볶이 조합은 야구장의 정석이죠! 저도 매번 이 조합입니다.",
    date: "2026-09-17",
    likes: 13,
  },
  {
    id: "comment-21",
    postId: "free-7",
    author: "팬S",
    content: "아이스크림은 진짜 필수! 늦은 이닝에 시원함은 정말 최고입니다.",
    date: "2026-09-18",
    likes: 11,
  },

  // free-10
  {
    id: "comment-22",
    postId: "free-10",
    author: "팬T",
    content: "포스트시즌 티켓 팁 정말 유용해요. 미리 로그인은 꼭 해야겠네요!",
    date: "2026-09-29",
    likes: 17,
  },
  {
    id: "comment-23",
    postId: "free-10",
    author: "팬U",
    content: "올해는 꼭 포스트시즌을 직관하고 싶어요. 팁 감사합니다!",
    date: "2026-09-30",
    likes: 12,
  },

  // fanart-1
  {
    id: "comment-24",
    postId: "fanart-1",
    author: "미술팬3",
    content: "수채화 정말 아름다워요! 노을의 색감이 살아있는 느낌입니다.",
    date: "2026-09-03",
    likes: 31,
  },
  {
    id: "comment-25",
    postId: "fanart-1",
    author: "팬V",
    content: "이 그림 정말 좋아요. 잠실 야구장의 감성을 완벽하게 담아냈습니다.",
    date: "2026-09-04",
    likes: 28,
  },
  {
    id: "comment-26",
    postId: "fanart-1",
    author: "팬W",
    content: "응원 깃발이 어우러지는 모습이 너무 멋있어요!",
    date: "2026-09-05",
    likes: 25,
  },

  // fanart-2
  {
    id: "comment-27",
    postId: "fanart-2",
    author: "글팬5",
    content: "9회말의 떨림을 정말 잘 표현하셨어요. 읽으면서 경기장의 분위기가 느껴졌습니다.",
    date: "2026-09-06",
    likes: 18,
  },
  {
    id: "comment-28",
    postId: "fanart-2",
    author: "팬X",
    content: "이 시, 정말 좋습니다. 야구를 사랑하는 마음이 묻어나와요.",
    date: "2026-09-07",
    likes: 15,
  },

  // fanart-3
  {
    id: "comment-29",
    postId: "fanart-3",
    author: "글팬6",
    content: "아버지와 함께한 추억 정말 소중하네요. 저도 비슷한 경험이 있어서 더 와닿습니다.",
    date: "2026-09-08",
    likes: 26,
  },
  {
    id: "comment-30",
    postId: "fanart-3",
    author: "팬Y",
    content: "야구가 가족의 언어라니... 정말 좋은 표현입니다. 우리도 그런 추억을 만들어야겠어요.",
    date: "2026-09-09",
    likes: 31,
  },
  {
    id: "comment-31",
    postId: "fanart-3",
    author: "팬Z",
    content: "이런 이야기 정말 좋아요. 감정이 그대로 전달됩니다.",
    date: "2026-09-10",
    likes: 22,
  },

  // fanart-4
  {
    id: "comment-32",
    postId: "fanart-4",
    author: "팬AA",
    content: "응원단장 팬1의 이야기 정말 기대돼요! 매주 연재되나요?",
    date: "2026-09-11",
    likes: 19,
  },
  {
    id: "comment-33",
    postId: "fanart-4",
    author: "팬AB",
    content: "첫 직관에서 목이 쉰다는 게 정말 그 느낌을 잘 표현했어요. 저도 공감됩니다!",
    date: "2026-09-12",
    likes: 17,
  },

  // fanart-5
  {
    id: "comment-34",
    postId: "fanart-5",
    author: "음악팬2",
    content: "응원가를 피아노곡으로 편곡하다니 정말 창의적이에요!",
    date: "2026-09-14",
    likes: 14,
  },
  {
    id: "comment-35",
    postId: "fanart-5",
    author: "팬AC",
    content: "조용한 밤에 듣기 정말 좋을 것 같습니다. 감성이 살아있네요.",
    date: "2026-09-15",
    likes: 12,
  },

  // fanart-6
  {
    id: "comment-36",
    postId: "fanart-6",
    author: "사진팬2",
    content: "야구장 불빛 사진 정말 멋져요! 조명의 감성을 완벽하게 담아냈습니다.",
    date: "2026-09-17",
    likes: 27,
  },
  {
    id: "comment-37",
    postId: "fanart-6",
    author: "팬AD",
    content: "이 사진 배경화면으로 써도 좋을 것 같아요. 정말 예뻐요.",
    date: "2026-09-18",
    likes: 24,
  },

  // fanart-7
  {
    id: "comment-38",
    postId: "fanart-7",
    author: "미술팬4",
    content: "응원 포스터 정말 귀여워요! 색감도 밝고 긍정적이네요.",
    date: "2026-09-20",
    likes: 29,
  },
  {
    id: "comment-39",
    postId: "fanart-7",
    author: "팬AE",
    content: "배경화면으로 쓰고 싶어요. 정말 예쁜 일러스트입니다!",
    date: "2026-09-21",
    likes: 26,
  },
];
