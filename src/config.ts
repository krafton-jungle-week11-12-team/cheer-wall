// hash 라우트: 벽(실시간 메시지) 화면, 내가 쓴 전체 메시지 화면
export const WALL_ROUTE = '#wall';
export const MESSAGES_ROUTE = '#messages';

// Redis에 저장한 메시지·좋아요 카운터의 만료 시간(초)
export const TTL_SECONDS = '1800';

// Redis 키 접두사
export const MSG_KEY_PREFIX = 'msg:';
export const LIKES_KEY_PREFIX = 'likes:';
