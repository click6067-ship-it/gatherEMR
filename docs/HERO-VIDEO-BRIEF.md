# 히어로 영상 브리프 — "The Weld Scan" (2026-07-04 확정)

## 컨셉 (락)
레이저가 쌓인 EMR 차트를 **가로줄로 훑고(용접 스캔)**, 지나간 자리가 탁한 종이 차트 → **리퀴드글래스 슬래브 카드**(내부에 핵심 데이터가 발광하며 떠 있음)로 각인된다. 은유 = 판독/각인 (raw → refined). "긴 차트 → 정제된 핵심."

## 결정 로그 (사용자 확정)
- **톤:** 다크 느와르 — **히어로만 다크**, 그 아래 바디는 라이트(현 사이트 그대로). 히어로 하단 다크→페이퍼 그래디언트 디졸브.
- **은유:** C(판독/각인). ❌제외: 유체·탁한 액체·안개·결정화·구슬 응결.
- **변환 결과:** A(글래스 슬래브) — 차트=사각 문서 형태 유지, 재질만 유리로. 우리 사이트 유리 카드와 동일 언어. (B 구슬·C 릴리프 기각.)
- **스캔 불꽃:** 용접 스파크. **블루 계열 / 레드 계열 2버전** 뽑아 비교.
- **비주얼 언어(사용자 선택):** 리퀴드글래스·리퀴드메탈 / 레이저각인·스캔라인·SSS·틴들·네온림 / (플루이드는 배경 대기용만, 전경 유체 변환은 제외) / 매크로·랙포커스·DOF보케·패럴랙스심도.

## 파이프라인 (품질 최우선, 성능/비용 무시)
```
① 스틸: Flux 2 Pro/Max + GPT Image 2 (둘 다 뽑아 비교)
② i2v : Seedance 2.0 (Dreamina 4K) + Veo 3.1 (둘 다 뽑아 더 나은 것 채택)
③ 심리스 루프 (ffmpeg/CapCut)
④ 웹 최적화: webm/mp4, muted autoplay loop playsinline + poster
※ "개별로 뽑아 교체" = 같은 장면을 여러 모델로 통째 생성 → 최종 1개 선택 (부분 편집 아님)
```
- 스틸/영상 생성은 사용자 계정(Dreamina·Flux·GPT)에서 — Claude는 API키 없이 직접 생성 불가. Claude = 프롬프트 완성 + 루프/최적화/삽입 담당.

## 샷 진행 (스크롤 스크럽과 결합 가능)
1. **[0%] 카오스** — 다크 공간에 쌓인 EMR 차트 더미(탁한 종이, 빽빽 텍스트=질감), 약간 부감, 차갑고 어두움.
2. **[스캔] 용접 레이저** — 가로 광선이 위→아래로 훑음. 접촉선에서 용접 스파크(블루/레드) 튐. 카메라가 스캔선 따라 글라이딩(부감→아이레벨).
3. **[지나간 곳] 유리 각인** — 종이 차트 → 리퀴드글래스 슬래브 카드. 내부 핵심 데이터 발광, 굴절/코스틱, 네온 림. 선명·고급.
4. **[루프] 후퇴** — 유리 카드가 뒤로 물러나 핵으로 수렴 → 새 차트 더미 쌓이며 스캔 반복.

## 사이트 연동
- 매크로·랙포커스·DOF·패럴랙스는 **웹사이트 인터랙션**에도 적용(스크롤 패럴랙스 심도).
- 정제된 유리 카드 = 히어로 대시보드(Bio-Age 구도)·바디의 리퀴드글래스와 동일 재질 → 영상→UI 이음새 없음.

---

## 확정 v2 — "The Flip Scan" (한 장의 여정, 2026-07-04)
- **서사:** 좌 종이 EMR 더미 → 한 장이 뜸 → 레이저 가로 스캔 → 스캔된 곳부터 유리알 카드(내부 전자회로 발광)로 변환 → 완전 변환 후 한 바퀴 플립 → 우측에 유리 카드로 적재. **좌(원본)→우(정제) = 파이프라인.**
- **i2v 첫 프레임 = B(스캔 한창):** 반 종이/반 유리 + 플립 시작 순간 (양쪽 상태가 다 보여 변환 안정).
- **변환 결과:** 유리알 카드 안에 전자회로 발광(리퀴드글래스 연결). **색: 블루 아크.**
- **카메라:** 측면 트래킹 + 약한 push-in + rack focus(스캔선만 초점). 오빗/큰 무브 금지(플립과 충돌).
- **방향:** 좌→우 확정.
- **베스트 스틸 참고:** wt-2 (blue arc, 종이→유리 코스틱) 방향.

### 스틸 프롬프트 — Flux 2 (blue)
```
Cinematic 16:9, dark void background. LEFT side: a stack of matte paper medical EMR sheets with dense ILLEGIBLE monospaced data texture (abstract numbers, tick marks, faint ECG waveforms — not readable). One sheet is lifted, mid-air. A razor-thin horizontal welding laser scans across it; everything the beam has already passed has transformed into a sleek liquid-glass card with a glowing blue electronic circuit board suspended inside (refraction, caustics). Electric blue-white arc-welding sparks spray along the laser line. The transformed glass card is beginning to flip-rotate toward the RIGHT, where finished glass cards are stacking. Side-profile tracking view, shallow depth of field, sharp only at the scan line, blue neon rim light, subsurface scattering, volumetric beams, film grain, premium 3D render, Octane quality. No readable text.
```
### 스틸 프롬프트 — GPT Image 2 (blue)
```
Create a dark cinematic 16:9 ultra-realistic 3D render, side view.
Left: a stack of matte paper EMR chart sheets, dense illegible monospaced data texture (NOT readable text). One sheet lifted mid-air.
A thin horizontal welding-laser line scans across it. Where the beam has passed, paper turns into a liquid-glass card with a glowing blue circuit board inside (refraction + caustics). Electric blue-white welding sparks spray at the laser line.
The freshly transformed glass card is starting to flip-rotate toward the right, where finished glass cards stack.
Camera: side-profile tracking, shallow depth of field (sharp at scan line only), blue rim light, subsurface scattering, volumetric light, film grain, high-contrast. Futuristic, premium, AI aesthetic. No readable text.
```
### i2v 프롬프트 — Seedance 2.0 (Dreamina 4K) / Veo 3.1
```
Cinematic loop, dark, blue. Side-tracking shot. A horizontal welding laser sweeps left-to-right across a lifted paper medical chart; as it passes, the paper transforms into a liquid-glass card with a glowing blue circuit board inside (refraction, caustics). Blue-white arc-welding sparks fly along the laser line. Once fully transformed, the glass card does a single smooth flip-rotation and lands on a growing stack of glass cards on the right, while a new paper sheet lifts from the left stack to begin again. Camera slowly tracks sideways with a gentle push-in and rack focus — sharp only at the scan line, soft bokeh elsewhere. Slow, elegant, weightless. Seamless loop. No text, no people. 8 seconds, 4K.
```
