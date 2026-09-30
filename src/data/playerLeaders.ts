import type { LeaderCategory } from "@/lib/types";

// DUMMY: 이름·수치 모두 가상이다. 실제 선수와 무관하다.
export const DUMMY_LEADERS: LeaderCategory[] = [
  {
    title: "타율",
    leaders: [
      { name: "선수 A", value: "0.331" },
      { name: "선수 B", value: "0.324" },
      { name: "선수 C", value: "0.317" },
      { name: "선수 D", value: "0.309" },
      { name: "선수 E", value: "0.302" },
    ],
  },
  {
    title: "홈런",
    leaders: [
      { name: "선수 F", value: "31" },
      { name: "선수 G", value: "27" },
      { name: "선수 H", value: "24" },
      { name: "선수 I", value: "22" },
      { name: "선수 J", value: "19" },
    ],
  },
  {
    title: "타점",
    leaders: [
      { name: "선수 K", value: "104" },
      { name: "선수 L", value: "97" },
      { name: "선수 M", value: "91" },
      { name: "선수 N", value: "86" },
      { name: "선수 O", value: "80" },
    ],
  },
  {
    title: "승리",
    leaders: [
      { name: "선수 P", value: "14" },
      { name: "선수 Q", value: "13" },
      { name: "선수 R", value: "12" },
      { name: "선수 S", value: "11" },
      { name: "선수 T", value: "10" },
    ],
  },
  {
    title: "세이브",
    leaders: [
      { name: "선수 U", value: "32" },
      { name: "선수 V", value: "28" },
      { name: "선수 W", value: "24" },
      { name: "선수 X", value: "20" },
      { name: "선수 Y", value: "17" },
    ],
  },
];
