# 동동이가 응원합니다

<img src="public/qr.png" alt="QR 코드" width="160" />

휴대폰 카메라로 QR 코드를 찍으면 바로 접속할 수 있어요.

## 프로젝트 소개
응원 메시지 벽은 팀이 직접 만든 세 가지(mini-react, mini-DBMS, mini-Redis)를 조합해서 구현했어요.

- 화면: mini-react + TypeScript
- 영구 저장: mini-DBMS (Python)
- 실시간 화면: mini-Redis (Python)

| 기능 | mini-DBMS | mini-Redis |
|---|---|---|
| 메시지 보내기 | 기록 저장, id 발급 | 30분짜리 메시지와 좋아요 키 생성 |
| 벽 화면 (3초 폴링) | 안 씀 | 살아 있는 메시지와 좋아요 읽기 |
| 좋아요 | 누를 때마다 기록 | 카운터 +1 |
| 내 메시지 화면 | 내 메시지 조회(보조 인덱스), 좋아요 수 | 아직 살아 있는지, 남은 시간 |

## 메시지 전송 흐름도
<img width="720" alt="image" src="https://github.com/user-attachments/assets/1387c19f-6b50-4485-82a5-c1b23762cab2" />

## DBMS의 장점
<img width="720" alt="image" src="https://github.com/user-attachments/assets/df57421c-23d4-40af-ad63-210ee3cbfff7" />


## Redis의 장점
<img width="720" alt="image" src="https://github.com/user-attachments/assets/b84fb736-fc3b-4ad6-9e0e-b78094b68ddf" />


## 보조 인덱스
<img width="720" alt="image" src="https://github.com/user-attachments/assets/6b427c8f-eb44-4f68-8708-84ae7d3d572d" />
