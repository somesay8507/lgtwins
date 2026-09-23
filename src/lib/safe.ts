/** 섹션 하나의 데이터 실패가 페이지 전체를 깨지 않도록 격리한다. */
export async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("[safe] data load failed:", error);
    return null;
  }
}
