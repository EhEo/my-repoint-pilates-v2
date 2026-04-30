// Phase 3: Member legacy fields(membershipType / remainingSessions / totalSessions)
// 가 Membership 테이블로 분리되면서 기존 mock 데이터가 무효화됨. 현재 어떤 페이지도
// 이 파일을 import 하지 않음. Phase 6 에서 mock* 일괄 정리 시 함께 제거 예정.

import type { Member } from '../types';

export const MOCK_MEMBERS: Member[] = [];
