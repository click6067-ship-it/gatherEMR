// 26 Korean medical specialties (+ 9 internal-medicine subspecialties).
// Source of truth for the specialty dropdown AND the per-specialty summary lens.
// Derived from docs/research/specialty-needs/*.md (5-cluster parallel research).
// EVERY specialty works (no EM hardcoding). Universal spine lives in schema.ts;
// each template injects the specialty lens.

export type GroupId = 'internal' | 'surgical' | 'diagnostic' | 'emergency' | 'social';

export const GROUPS: { id: GroupId; label: string; color: string; soft: string }[] = [
  { id: 'internal', label: '내과·진료계열', color: '#2563eb', soft: '#eff4ff' },
  { id: 'surgical', label: '외과·수술계열', color: '#dc2626', soft: '#fef2f2' },
  { id: 'diagnostic', label: '진단·지원계열', color: '#7c3aed', soft: '#f5f3ff' },
  { id: 'emergency', label: '응급의학계열', color: '#059669', soft: '#ecfdf5' },
  { id: 'social', label: '사회의학계열', color: '#0d9488', soft: '#f0fdfa' },
];

/** A summary template = the lens for one specialty or subspecialty. */
export type Template = {
  id: string;
  name: string;
  lens: string[]; // 차트에서 먼저 보는 것 (우선순위 순)
  blocks: string[]; // 분과별 요약 블록 제목 (순서)
  cannotMiss: string[]; // 놓치면 안 될 것
  chips: string[]; // 포커스 칩 (탭, 요약 방향)
};

export type Specialty = Template & {
  group: GroupId;
  subspecialties?: Template[];
};

export const SPECIALTIES: Specialty[] = [
  // ── 내과·진료계열 ──────────────────────────────────────────
  {
    id: 'internal-medicine',
    name: '내과',
    group: 'internal',
    lens: ['활력징후 추이·야간 이벤트(sign-out)', '새 critical/pending 검사값', 'I/O·체중 추이', '활성 문제목록(중증도순)', '최근 투약 변경(항응고제·인슐린·스테로이드)', 'code status/goals of care'],
    blocks: ['문제목록(중증도순)', '지난 24시간 인터벌 변화', '활력징후·I/O 추이', '주요 검사·영상 추이', '미결 검사/컨설트 회신', 'Disposition & code status'],
    cannotMiss: ['code status 미기재', 'critical/pending lab 누락', '신기능 기반 용량조절 누락', '컨설트 권고 미이행'],
    chips: ['오늘 변경사항만', '문제목록 우선순위', '투약 변경 확인', '다음 액션 아이템'],
    subspecialties: [
      { id: 'gi', name: '소화기내과', lens: ['간합성능(INR·알부민)·MELD/Child-Pugh 추이', '최근 내시경 소견(정맥류·궤양·용종)', 'Hb 추이·수혈력(출혈)', '복수/뇌증', '항응고·항혈소판제', '복부영상(종괴·담도·췌장)'], blocks: ['진단명(간질환 원인/IBD 아형)', '최근 내시경·영상', 'MELD/Child-Pugh 추이', '출혈 이력·Hb 추이', '간경변 합병증(복수/뇌증)', '예정 procedure'], cannotMiss: ['활동성 GI출혈', '정맥류 출혈 이력', '간성뇌증 악화', '중증 급성췌장염'], chips: ['간기능 추이만', '최근 내시경 소견', '출혈 위험 평가', '복수·뇌증 체크'] },
      { id: 'cardio', name: '순환기내과', lens: ['EF/echo 추이', 'troponin·BNP 추이', 'EKG 리듬/허혈 변화', '항혈전제·위험점수(CHA2DS2-VASc·HAS-BLED)', '관상동맥/판막/디바이스 병력', '심부전 stage/NYHA'], blocks: ['심장진단명·EF(HFrEF/HFpEF)', 'troponin·BNP 추이', 'EKG/리듬 이상', '관상동맥·구조적 심질환(PCI/CABG/판막)', '항혈전제·위험점수', '디바이스(pacemaker/ICD)', '최근 decompensation'], cannotMiss: ['ACS 시사 소견', '새 부정맥', '항응고제 중단/미투약', 'decompensation 조기징후', '디바이스 이상'], chips: ['EF·BNP 추이', '항혈전제 현황', '최근 decompensation', '디바이스 상태'] },
      { id: 'pulmo', name: '호흡기내과', lens: ['산소요구량 추이(재택산소)', 'PFT(FEV1/FVC/DLCO) 추이', '흉부CT 변화', '흡연력(pack-years)', '최근 악화/입원 빈도', '감염/배양·결핵(도말·배양·약제감수성)'], blocks: ['진단·중증도(COPD/천식/ILD/폐암·결핵)', 'PFT 추이', '영상 추이(결절·섬유화·폐렴)', '산소요구량/재택산소', '악화 빈도', '투약(흡입기·스테로이드·항결핵제 경과)'], cannotMiss: ['급성 저산소증', '새 폐결절/종괴', '스테로이드 장기 부작용', '반복 급성악화', '폐색전 위험', '결핵 약제내성(MDR)·항결핵제 간독성·복약 불순응'], chips: ['산소요구량 추이', 'PFT 변화', '영상 신규소견', '악화 이력', '결핵 치료 경과'] },
      { id: 'endo', name: '내분비대사내과', lens: ['HbA1c·혈당 로그 추이', '갑상선기능(TSH/FT4) 추이', '인슐린/경구약 변경', '스테로이드 사용력(부신저하)', '급성 대사이상 이력(DKA/HHS·thyroid storm)'], blocks: ['당뇨 진단·합병증(신증/망막증/신경병증)', 'HbA1c·혈당 추이', '약물 변경 이력', '갑상선기능 추이', '부신/뇌하수체 축', '최근 급성대사 이벤트'], cannotMiss: ['adrenal crisis', 'thyroid storm', 'DKA/HHS 재발', '스테로이드 급성 중단 부신부전', '반복 저혈당'], chips: ['혈당·HbA1c 추이', '갑상선기능 추이', '약물 변경 이력', '급성대사 이벤트'] },
      { id: 'nephro', name: '신장내과', lens: ['Cr/GFR 추이(baseline 대비)', '전해질(특히 K+)', 'AKI vs CKD 감별(baseline Cr)', '투석 여부/access', '단백뇨·혈뇨', '신독성 약물/조영제 노출'], blocks: ['신기능 진단(AKI/CKD stage)·원인', 'Cr/GFR 추이(baseline 대비)', '전해질 추이(K·HCO3)', '투석 방식·access·스케줄', '단백뇨/혈뇨/영상', '신독성·용량조절 약물', '혈압·체액상태'], cannotMiss: ['응급 고칼륨혈증', '급성투석 필요(요독증·폐부종·산증)', 'AKI를 CKD baseline으로 오인', '조영제/신독성약물 노출 미확인'], chips: ['Cr·GFR 추이', '전해질(K+) 체크', '투석 상태', '신독성 약물 확인'] },
      { id: 'hemonc', name: '혈액종양내과', lens: ['병기·조직형', '항암 레지멘·사이클·최근 영상 반응평가', 'CBC 추이(ANC·Hb·혈소판)', 'ECOG', '항암 독성 이력', '수혈력/성장인자'], blocks: ['진단·병기·조직형', '치료이력(레지멘·사이클·최근 투여일)', '최근 영상 반응평가', 'CBC 추이·ANC/혈소판 nadir', 'ECOG 변화', '부작용/독성(등급)'], cannotMiss: ['발열성 호중구감소증(ANC<1000+발열)', '종양응급(척수압박·SVC·종양용해)', '병기 진행/재발', '중증 항암독성'], chips: ['치료이력·사이클', 'CBC·ANC 추이', '영상 반응평가', '독성·부작용 확인'] },
      { id: 'infection', name: '감염내과', lens: ['배양·감수성(혈액/소변/객담)', '현재/과거 항생제 이력·반응', '면역저하(이식·항암·스테로이드·HIV)', '감염원/source control', '염증수치(CRP/procalcitonin) 추이', '여행력/내성균 이력'], blocks: ['감염진단/의심 병원체', '배양·감수성 추이', '항생제 이력(투여일·변경사유·반응)', '면역상태', '염증수치 추이', 'Source control 상태', 'de-escalation/치료기간'], cannotMiss: ['패혈성 쇼크', '미해결 감염원', '내성균(MRSA/VRE/CRE) 이력 누락', '면역저하자 비전형 감염', 'pending 배양 누락'], chips: ['배양·감수성 결과', '항생제 이력', '면역저하 상태', 'Source control 확인'] },
      { id: 'allergy', name: '알레르기내과', lens: ['약물/음식 알레르기 이력(반응유형·중증도)', '원인물질 검사(피부단자/특이 IgE)', '과거 중증반응·입원 이력', '면역요법 이력·반응', '동반 알레르기질환(천식·아토피·비염) 조절'], blocks: ['진단·원인물질', '반응 이력(증상·중증도·타이밍)', '검사결과(피부시험/IgE) 추이', '중증반응 병력·에피펜 처방', '면역요법 진행', '응급대응계획(action plan)'], cannotMiss: ['중증 전신반응 병력 누락', '교차반응 약물/음식 미확인', '에피펜 처방·교육 여부', '베타차단제 복용 중 면역요법 위험'], chips: ['원인물질·반응이력', '중증반응 병력', '면역요법 진행상황', '응급대응계획'] },
      { id: 'rheuma', name: '류마티스내과', lens: ['자가항체(RF·anti-CCP·ANA·anti-dsDNA)', '관절진찰(TJC/SJC)·질병활성도(DAS28)', '염증수치(ESR/CRP) 추이', '면역억제제/생물학적제제 이력·반응', 'Flare vs 감염 감별', '장기침범(폐/신장/심장)'], blocks: ['진단·아형', '자가항체 프로파일', '질병활성도 추이(DAS28)', '염증수치 추이', '치료이력(DMARD/생물학적·반응)', '장기침범 평가'], cannotMiss: ['Flare와 감염 감별 실패', '생물학적제제 전 잠복결핵/B형간염 스크리닝 누락', '장기침범(ILD·루푸스신염) 진행', '스테로이드 급감 flare'], chips: ['질병활성도 추이', '자가항체·염증수치', 'Flare vs 감염', '장기침범 체크'] },
    ],
  },
  {
    id: 'neurology', name: '신경과', group: 'internal',
    lens: ['Consult 사유(국소 신경학적 증상)', '발병 양상·timeline(급성/아급성/만성)', '국소화 신경학적 검사 소견', '신경영상(MRI/CT)·이전 대비 변화', 'EEG 이력(발작/의식)', '신경계 약물 용량·변경'],
    blocks: ['증상 timeline·진행 양상', '국소화 신경학적 검사(최신+추이)', '신경영상 요약(이전 대비 변화)', 'EEG/전기생리검사', '신경계 약물·변경 이력', '기능적 영향(ADL·낙상)'],
    cannotMiss: ['급성 국소 신경결손(stroke window)', '의식 저하/급속 악화', '발작 빈도·지속 변화(status epilepticus)', '약물 독성 수치'],
    chips: ['발작 이력만', '영상 소견 추이', '약물 변경 타임라인', '신경학적 검사 추이'],
  },
  {
    id: 'psychiatry', name: '정신건강의학과', group: 'internal',
    // 리서치 근거: med2-내과계기타.md. 요약은 "차트에 기록된 것"의 인용·정리로 한정(생성·조언 아님 —
    // buildSystemPrompt 규칙 4: 청크에 없는 사실 금지). 위험도 이력은 정신과 차트리뷰의 실측 최우선 항목.
    lens: ['차트에 기록된 자·타해 위험 이력(과거 시도·시점·수단·의도 — 정신과 차트리뷰 최우선)', '최신 정신상태검사(MSE) 소견', '진단명 변화 이력', '향정신성 약물 이력(반응·부작용·순응도)', '정신과 입원/응급실 이력', '물질사용력·사회적 지지체계'],
    blocks: ['위험도 요약(차트 기록상 자·타해 위험 이력·safety plan)', '최신 MSE(외모·기분·정동·사고·인지·판단력)', '진단 이력·변화', '약물치료 타임라인(효과·부작용·순응도)', '입원/위기 이력', '정신사회력·최근 스트레스 요인'],
    cannotMiss: ['차트에 기록된 활성 자·타해 위험', '정신병적 증상 급성 악화', '약물 관련 응급(리튬 독성·세로토닌 증후군)', '금단 증상 위험'],
    chips: ['위험도 이력 요약', '약물 타임라인', '입원 이력', 'MSE 변화 추이'],
  },
  {
    id: 'pediatrics', name: '소아청소년과', group: 'internal',
    lens: ['성장곡선(백분위) 추이', '예방접종 이력·누락', '출생력/주산기력(재태주수·출생체중·NICU)', '발달 이정표·red flag', '최근 급성질환/입원', '알레르기·약물'],
    blocks: ['성장 추이(백분위 변화)', '예방접종 상태(완료/누락)', '출생력/주산기력', '발달력·red flag', '최근 방문·급성질환', '가족력(유전질환)·보호자 우려'],
    cannotMiss: ['성장 정체/체중감소', '발달지연 red flag(18개월 무발화·걷지 못함)', '예방접종 누락', '학대/방임 의심'],
    chips: ['성장·발달 추이', '예방접종 상태', '급성질환 이력', '보호자 우려사항'],
  },
  {
    id: 'dermatology', name: '피부과', group: 'internal',
    lens: ['주호소 병변 위치·기간·변화(evolving)', '이전 생검/병리', '피부암 개인력·가족력', '면역억제 상태', '국소·전신 치료 이력·반응', '자외선 노출력/직업력'],
    blocks: ['병변 기술(위치·기간·변화 타임라인)', '이전 생검/병리 이력', '피부암 위험인자', '치료 이력·반응(국소·전신)', '관련 전신질환/면역상태', '약물 알레르기/중증 피부반응 이력'],
    cannotMiss: ['ABCDE 부합 병변', '급속 변화 병변', '면역저하자 감염성/악성 병변', 'SJS/TEN 등 중증 약물반응 과거력'],
    chips: ['병변 변화 타임라인', '생검·병리 이력', '치료 반응 이력', '피부암 위험인자 요약'],
  },
  {
    id: 'family-medicine', name: '가정의학과', group: 'internal',
    lens: ['문제 목록(만성질환) 개요', '전체 복용약물(중복·상호작용)', '예방접종/건강검진·누락(USPSTF)', '만성질환 지표 추이(혈압·HbA1c·지질)', '최근 타과 진료/응급실/입원'],
    blocks: ['문제 목록(활성/비활성)', '약물 전체 목록(용량·변경·처방자)', '예방접종/스크리닝 상태(gap)', '만성질환 지표 추이', '최근 타과 진료', '사회력·가족력'],
    cannotMiss: ['약물 중복처방/상호작용', '스크리닝 누락(대장내시경·유방촬영·자궁경부암)', '만성질환 조절 실패 추세', '미공유된 최근 응급실/입원'],
    chips: ['약물 전체 정리', '검진 누락 확인', '만성질환 추이', '최근 타과 방문 요약'],
  },
  {
    id: 'rehab', name: '재활의학과', group: 'internal',
    lens: ['기능평가 점수(FIM) 추이', '원인 진단(뇌졸중·척수손상·골절)·발병일', '치료팀별(PT/OT/ST) 진행·목표', '동반 합병증(욕창·연하곤란·배뇨배변·통증)', '보조기/보행보조·낙상위험'],
    blocks: ['원인 진단·발병 경과', '기능평가 점수 추이(FIM/ADL)', '치료팀별(PT/OT/ST) 진행상황', '합병증 관리(욕창·연하·배뇨배변)', '보조기구/이동수단', '퇴원계획/사회복귀 목표'],
    cannotMiss: ['연하곤란 흡인 위험', '욕창 진행 단계', '낙상 위험도 상승', '기능점수 정체/퇴행'],
    chips: ['기능평가 추이', '치료팀 진행상황', '합병증 현황', '퇴원계획 요약'],
  },

  // ── 외과·수술계열 ──────────────────────────────────────────
  {
    id: 'general-surgery', name: '외과', group: 'surgical',
    lens: ['수술 적응증·급성 여부(응급/택기)', '영상(CT/US, 천공·농양·폐색)', '패혈증 지표(WBC·CRP·젖산)', '항응고/항혈소판제', '동반질환·위험도(ASA)', '과거 복부수술력(유착)'],
    blocks: ['수술 적응증/주소증', '영상소견', '검사수치(WBC/CRP/LFT/전해질)', '항응고·항혈소판제', '동반질환·ASA/위험도', '과거 수술력·유착 위험'],
    cannotMiss: ['복막염/천공', '패혈증·패혈성 쇼크', '항응고 리버설 필요', '약물 알레르기'],
    chips: ['패혈증 위험', '출혈 위험', '마취 위험도(ASA)', '재수술/유착 가능성'],
  },
  {
    id: 'orthopedics', name: '정형외과', group: 'surgical',
    lens: ['손상기전/골절양상(영상)', '신경혈관 상태(원위부 맥박·감각·운동)', '개방성/오염도', '항응고제·VTE 위험', '골질/골다공증·당뇨', '이전 수술력·삽입물'],
    blocks: ['손상기전/골절양상', '신경혈관 상태', '개방성/오염도', '항응고제 현황·VTE-출혈 균형', '골질/동반질환', '과거 수술력·삽입물'],
    cannotMiss: ['구획증후군 징후', '개방성 골절', '신경혈관 손상', 'VTE예방-출혈 딜레마'],
    chips: ['신경혈관 손상 위험', 'VTE-출혈 균형', '감염 위험(개방성)', '기능 예후'],
  },
  {
    id: 'neurosurgery', name: '신경외과', group: 'surgical',
    lens: ['신경학적 검사·의식(GCS) 추이', '영상(병변·정중선 이동/척추 level)', '항응고/항혈소판제(리버설)', '두개내압 상승 징후', '척추 red flag(마미증후군)', '이전 수술력'],
    blocks: ['신경학적 검사/GCS', '영상(병변·정중선이동/척추 level)', '항응고·항혈소판제', '두개내압/herniation 징후', '척추 red flag(안장마취·방광기능)', '과거 수술력'],
    cannotMiss: ['herniation 임박', '항응고 리버설 없이 개두술 위험', '마미증후군 red flag', 'GCS 급강하'],
    chips: ['herniation/ICP 위험', '항응고 리버설 필요성', '마미증후군 응급도', '신경학적 기준선 변화'],
  },
  {
    id: 'thoracic-surgery', name: '흉부외과', group: 'surgical',
    lens: ['적응증에 따라 심장기능(EF/판막) 또는 폐기능(FEV1/DLCO)', '관상동맥/스텐트·DAPT 현황', '영상(흉부CT·echo·관상동맥조영)', '예측 잔여 폐기능·폐고혈압', '항응고제', '흡연력·동반질환'],
    blocks: ['수술 적응증', '심장기능(EF/판막)', '폐기능(FEV1/DLCO/예측잔여)', '관상동맥·스텐트·항혈소판제', '항응고제 현황', '동반질환·수술위험도'],
    cannotMiss: ['심장압전/대동맥박리', '저EF·증상성 심부전', '폐절제 전 폐고혈압 미평가', '최근 스텐트 후 DAPT 중단'],
    chips: ['심장 위험도(EF/판막)', '폐기능/절제 가능성', '출혈-혈전 균형(스텐트)', '폐고혈압 위험'],
  },
  {
    id: 'plastic-surgery', name: '성형외과', group: 'surgical',
    lens: ['수술 목적(재건/기능 vs 미용)·결손', '흡연력(pack-year, 피판 괴사)', '이전 방사선/수술력', '피판 공여부·수혜부 혈관상태', '동반질환(당뇨·스테로이드)'],
    blocks: ['수술 목적', '흡연력(pack-year)', '결손 부위/조직 상태', '이전 방사선·수술력', '피판 계획·혈관상태', '동반질환·감염 여부'],
    cannotMiss: ['활동성 흡연(피판 괴사·감염)', '수술부위 방사선 조사력', '조절 안 된 당뇨', '말초혈관질환'],
    chips: ['피판 생존 위험', '흡연/치유지연 위험', '감염 위험', '미용적 기대치'],
  },
  {
    id: 'obgyn', name: '산부인과', group: 'surgical',
    lens: ['산과력(G/P)·임신 가능성(가임기 항상 확인)', '증상·영상(질초음파/CT/MRI)', '종양 의심 시 병기·표지자(CA-125)', '이전 골반수술·제왕절개(유착)', '출혈력·빈혈'],
    blocks: ['산과력·임신여부', '증상/영상', '종양표지자·병기', '이전 골반수술·제왕절개(유착)', '출혈력/빈혈', '동반질환·마취위험'],
    cannotMiss: ['임신 가능성 미확인(가임기 응급수술 전)', '자궁외임신 파열', '난소염전', '전치/유착태반', '악성 의심 놓침'],
    chips: ['임신 가능성/응급도', '악성 의심도', '유착 위험', '출혈 위험'],
  },
  {
    id: 'ophthalmology', name: '안과', group: 'surgical',
    lens: ['수술 안(좌/우)·적응증', '항응고/항혈소판제(INR)', '시력·안압 baseline', '전신질환(당뇨망막병증·고혈압)', '이전 안과수술력'],
    blocks: ['수술 안·적응증', '시력/안압 baseline', '항응고·항혈소판제(INR)', '이전 수술력', '전신질환(당뇨망막병증)', '마취방식 적합성·알레르기'],
    cannotMiss: ['안구파열(외상)', '치료범위 밖 INR(>4)', '조절 안 된 녹내장', '활동성 안내 감염'],
    chips: ['출혈 위험(항응고)', '감염/안내염 위험', '당뇨망막병증 동반', '재수술/합병증 이력'],
  },
  {
    id: 'ent', name: '이비인후과', group: 'surgical',
    lens: ['기도평가(Mallampati·삽관력·수면무호흡)', '영상(CT/내시경, 종괴·기도폐색)', '종양 TNM 병기', '감염/농양 범위(경부 심부감염)', '항응고/항혈소판제'],
    blocks: ['기도평가(Mallampati/삽관력/OSA)', '영상(CT/내시경)', '종양 TNM', '감염/농양 범위', '항응고·항혈소판제', '이전 두경부 수술·방사선'],
    cannotMiss: ['기도폐색 임박', '어려운 기도 예측인자 미확인', '진행성 병기 절제불가 가능성', '심부경부감염 확산'],
    chips: ['기도 확보 난이도', '병기/절제 가능성', '감염 확산 위험', '출혈 위험'],
  },
  {
    id: 'urology', name: '비뇨의학과', group: 'surgical',
    lens: ['수술 적응증(결석/종양/폐색)', '신장기능(Cr/GFR)', '영상(CT, 결석 크기·위치·수신증/종양 병기)', '요배양·감염(요로패혈증)', '항응고/항혈소판제'],
    blocks: ['수술 적응증', '신장기능', '영상(결석/종양)', '요배양·감염', '항응고·항혈소판제', '이전 비뇨기 수술력·배뇨기능'],
    cannotMiss: ['폐색된 요로계 감염(요로패혈증)', '신기능 저하로 약물·조영제 조정', '항응고제 중단 없이 시술 위험'],
    chips: ['요로패혈증 위험', '출혈 위험', '신기능 저하', '폐색/응급도'],
  },

  // ── 진단·지원계열 ──────────────────────────────────────────
  {
    id: 'radiology', name: '영상의학과', group: 'diagnostic',
    lens: ['의뢰 사유/임상질문', '이전 영상 존재·날짜(비교 필수)', '조영제 관련(Cr/eGFR·알레르기·임신)', '종양력·치료단계', '최근 수술/시술(해부 변형)'],
    blocks: ['의뢰 사유/임상질문', '임상 진단(추정)·병력', '이전 영상·마지막 검사(비교점)', '관련 수치(신기능·응고)', '종양력/치료 컨텍스트', '알레르기·금기'],
    cannotMiss: ['조영제 신독성(eGFR 저하)·알레르기 미기재', '가임기 임신 여부 미확인', '이전 대비 커진 병변', 'critical finding 통보 필요'],
    chips: ['이전 영상과 비교', '종양 스테이징 맥락', '조영제 안전성 확인', '응급소견 우선'],
  },
  {
    id: 'radiation-oncology', name: '방사선종양학과', group: 'diagnostic',
    lens: ['병리 진단·조직형·병기(TNM)', '이전 방사선치료(부위·선량·시기)', '수행능력(ECOG/KPS)·동반질환', '최근 항암/수술·시퀀싱', '종양응급(척수압박·SVC)'],
    blocks: ['진단·병기', '병리(조직형·분화도·마커)', '영상(종양범위·전이)', '이전 치료(수술/항암/방사선·선량·부위)', '수행능력·동반질환', '응급증상·치료계획 제약(OAR·재조사)'],
    cannotMiss: ['이전 방사선 부위·누적선량 미확인', '응급증상(척수압박·SVC) 미포착', '항암 병용 스케줄'],
    chips: ['이전 방사선·누적선량', '병기·치료목표(근치/완화)', 'OAR 제약 검토', '응급증상 스크리닝'],
  },
  {
    id: 'pathology', name: '병리과', group: 'diagnostic',
    lens: ['임상 진단/의심·의뢰 사유', '검체 종류·부위·방향(orientation)', '신보조치료(항암/방사선) 여부', '이전 조직검사(연속성)', '관련 영상(병변 크기·위치)'],
    blocks: ['임상정보/의뢰사유', '검체 정보(종류·부위·채취일·방향)', '관련 영상', '이전 병리·치료이력', '신보조치료 여부·시기', '최종진단·절제연·병기 요소'],
    cannotMiss: ['신보조치료 이력 누락(regression grade 오판정)', '검체 방향/marking 누락(절제연 오류)', '이전 조직검사 불일치', '절제연 근접/양성 놓침'],
    chips: ['이전 병리와 비교', '신보조치료 이력', '절제연/병기 요소', '임상-병리 불일치'],
  },
  {
    id: 'lab-medicine', name: '진단검사의학과', group: 'diagnostic',
    lens: ['최근 critical value·통보 여부', '이전 대비 추세(delta)', '투약(항응고제·항생제 등 간섭약물)', '검체 조건(용혈·지질혈증·응고)', '임상 진단(감염·장기기능)'],
    blocks: ['최근 critical/이상치·통보 이력', '추세/delta', '관련 투약력(간섭·TDM 타이밍)', '검체 상태', '임상 맥락', 'TDM 결과·채혈시점 적절성'],
    cannotMiss: ['critical value 미확인/미통보', '수혈·수액으로 인한 값 변화 오인', '약물간섭(비오틴 등)', 'TDM 채혈시점 오류(trough/peak)'],
    chips: ['최근 이상치·추세', '약물 간섭 여부', '감염/패혈증 지표', '신장·간기능 스크리닝'],
  },
  {
    id: 'nuclear-medicine', name: '핵의학과', group: 'diagnostic',
    lens: ['의뢰 사유(병기/재발/치료반응 등 구체 질문)', '종양력·최근 치료(FDG 섭취 왜곡)', '검사 전 준비(혈당·공복·임신)', '이전 핵의학/영상(비교)', '신기능(조영 CT 병용)'],
    blocks: ['의뢰 사유·임상질문', '종양력·병기·치료단계', '최근 치료(섭취 왜곡 요인)', '검사 전 준비상태(혈당·공복·임신)', '이전 영상 비교', '관련 수치(신기능)'],
    cannotMiss: ['가임기 임신 여부 미확인', '혈당조절 불량(FDG 섭취 왜곡)', '최근 항암/방사선 직후 검사', '이전 영상 병변 연속성 누락'],
    chips: ['이전 검사와 비교', '치료 반응 평가', '검사 전 준비상태', '전이 스크리닝'],
  },
  {
    id: 'anesthesiology', name: '마취통증의학과', group: 'diagnostic',
    lens: ['ASA 신체등급·수술 침습도', '기도평가(Mallampati)·difficult airway 이력', '심혈관 위험(RCRI)', '항응고/항혈소판제·중단 타이밍', '과거 마취 합병증(악성고열·PONV·지연각성)'],
    blocks: ['ASA 등급', '기도평가(과거 삽관 난이도)', '심폐기능·심혈관 위험(RCRI)', '투약력(항응고·항혈소판·당뇨약)', '과거 마취력·합병증', '최근 검사(EKG·흉부X선·응고)·NPO·알레르기'],
    cannotMiss: ['항응고/항혈소판제 중단 여부·타이밍 미확인', '과거 difficult airway 누락', '약물 알레르기·악성고열 가족력 누락', '최근 심근경색/뇌졸중 이력'],
    chips: ['기도평가 요약', '항응고제·출혈위험', '심혈관 위험도(RCRI)', '과거 마취 합병증'],
  },

  // ── 응급·사회의학계열 ──────────────────────────────────────
  {
    id: 'emergency', name: '응급의학과', group: 'emergency',
    lens: ['활력징후 추이(도착~현재, sepsis/shock 조기경고)', '주호소 발생 시각(time-critical window)', '중증도(KTAS)·재방문(bounce-back)', '시행 검사·대기 중 결과(판독/컨설트)', '현재 수액·승압제·항생제', '잠정 진단·남은 감별'],
    blocks: ['Illness severity(한 줄)', '주호소 & HPI', '활력징후 추이', '검사결과(이상소견 우선)', 'Action list(대기 검사/판독/컨설트)', 'Situation awareness & contingency', 'Disposition & 인계'],
    cannotMiss: ['Sepsis/쇼크 트리거 놓침', 'time-critical window(stroke tPA·STEMI·sepsis bundle) 경과 미표시', '재방문 환자 직전 진단·처방 누락', '가임기 임신 배제 누락'],
    chips: ['중증도·활력징후 추이', '대기 중인 검사·컨설트', '감별진단·Cannot-miss 체크', '인계용 한 줄(I-PASS)'],
  },
  {
    id: 'preventive-medicine', name: '예방의학과', group: 'social',
    lens: ['건강검진 회차별 추이(혈압·혈당·지질·BMI·흡연/음주)', '가족력·기저 만성질환(심뇌혈관 위험)', '(감염관리) 침습기구 삽입기간·배양·항생제', '(역학조사) 증상 발생시점·여행/접촉력', '권고 스크리닝·예방접종 이행'],
    blocks: ['위험요인 프로파일(대사/심혈관 추이)', '스크리닝·예방접종 이행(다음 예정일)', '가족력·생활습관', '감염 노출·처치 타임라인(device-day)', '증상-노출 타임라인(case definition)', '배양/미생물·항생제 이력'],
    cannotMiss: ['권고 스크리닝 미수검 누락', '기구 관련 감염 surveillance 기준일수 초과', '역학조사 필수항목(증상 발현일·접촉일) 누락'],
    chips: ['위험요인 추이만', '스크리닝·예방접종 이행', '감염 노출·처치 타임라인', '역학조사용 증상-접촉 타임라인'],
  },
  {
    id: 'occupational-medicine', name: '직업환경의학과', group: 'social',
    lens: ['직업력 전체(최장 근무 + 현재 job·구체 업무)', '유해인자별 노출력(수준·기간·형태·보호구)', '증상-노출 시간관계(근무 중/후·휴가 시 호전)', '특수건강진단 추이(유소견·생물학적 모니터링)', '비직업성 기저질환(감별)'],
    blocks: ['노출력(유해인자별 기간·강도·보호구)', '직업력 타임라인(현직+과거)', '특수건강진단 추이', '증상-노출 시간관계(근무일 vs 휴일)', '업무적합성용 기능상태', '판정 이력(작업가능/조건부/작업불가)'],
    cannotMiss: ['노출-질환 잠복기 불일치 미확인', '업무적합성 판정용 최신 직무기술서 누락', '인과성(산재) 판단용 노출 정량 누락'],
    chips: ['노출력·직업력 타임라인', '특수건강진단 추이', '증상-노출 시간관계', '업무적합성·인과성 판정용'],
  },
];

export function findSpecialty(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}

/** Resolve the template to summarize with: a subspecialty if given, else the
 * specialty itself. Returns null for an unknown id. */
export function resolveTemplate(specialtyId: string, subId?: string): Template | null {
  const s = findSpecialty(specialtyId);
  if (!s) return null;
  if (subId && s.subspecialties) {
    const sub = s.subspecialties.find((t) => t.id === subId);
    if (sub) return sub;
  }
  return s;
}
