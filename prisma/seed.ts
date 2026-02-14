import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // ─── Modules ───────────────────────────────────────────
  const httpModule = await prisma.module.upsert({
    where: { slug: "http-journey" },
    update: {},
    create: {
      slug: "http-journey",
      title: "HTTP 요청 한 번에 서버에서 일어나는 일",
      subtitle: "DNS → TCP → TLS → LB → App → DB → Response",
      outcomes: [
        "왜 502/타임아웃이 나는지 설명할 수 있음",
        "재시도 폭풍이 왜 장애를 키우는지 이해",
        "로그에서 병목 지점을 찾는 기본 감각",
      ],
      difficulty: "초급~중급",
      time: "30분",
      tag: "Network",
      color: "hsl(197, 71%, 53%)",
      vizConfig: {
        type: "http-journey",
        steps: [
          "dns-resolve",
          "tcp-connect",
          "tls-handshake",
          "load-balancer",
          "app-server",
          "database",
          "response",
        ],
      },
    },
  })

  const concurrencyModule = await prisma.module.upsert({
    where: { slug: "concurrency" },
    update: {},
    create: {
      slug: "concurrency",
      title: "이벤트루프 vs 스레드: 왜 멈추고, 왜 꼬이나",
      subtitle: "큐, 락, 경합, 데드락을 눈으로 보기",
      outcomes: [
        "경합/락이 성능을 망치는 구조를 설명",
        "데드락 조건을 사례로 말할 수 있음",
        "비동기 모델의 장단점을 구분",
      ],
      difficulty: "중급",
      time: "30분",
      tag: "OS/Concurrency",
      color: "hsl(47, 96%, 53%)",
      vizConfig: {
        type: "concurrency",
        modes: ["event-loop", "thread-pool", "deadlock"],
      },
    },
  })

  const gitModule = await prisma.module.upsert({
    where: { slug: "git-pr" },
    update: {},
    create: {
      slug: "git-pr",
      title: "git이 갑자기 어려워지는 이유: 3영역과 PR",
      subtitle: "working tree / index / commit + rebase/merge",
      outcomes: [
        "add/commit이 뭔지 그림으로 설명",
        "rebase vs merge 차이를 상황별로 선택",
        "충돌 해결 흐름을 멘탈모델로 이해",
      ],
      difficulty: "초급",
      time: "30분",
      tag: "DevTools",
      color: "hsl(142, 71%, 45%)",
      vizConfig: {
        type: "git-areas",
        areas: ["working-tree", "index", "local-repo", "remote"],
      },
    },
  })

  // ─── Quiz Questions ────────────────────────────────────

  // HTTP module questions
  await prisma.quizQuestion.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: httpModule.id,
        type: "multiple-choice",
        question:
          "HTTP 요청이 서버에 도달하기 전, DNS 리졸버가 가장 먼저 확인하는 것은?",
        options: JSON.stringify([
          "서버의 SSL 인증서",
          "로컬 DNS 캐시",
          "로드밸런서 상태",
          "TCP 연결 가능 여부",
        ]),
        correctAnswer: "1",
        explanation:
          "DNS 리졸버는 네트워크 요청을 보내기 전에 먼저 로컬 캐시를 확인합니다. 캐시에 해당 도메인의 IP가 있으면 네트워크 왕복 없이 바로 응답할 수 있어 지연 시간이 크게 줄어듭니다.",
        stepJump: 0,
      },
      {
        moduleId: httpModule.id,
        type: "multiple-choice",
        question: "502 Bad Gateway 에러의 가장 흔한 원인은?",
        options: JSON.stringify([
          "클라이언트 네트워크 끊김",
          "DNS 조회 실패",
          "업스트림 서버가 응답하지 않음",
          "SSL 인증서 만료",
        ]),
        correctAnswer: "2",
        explanation:
          "502는 게이트웨이/프록시가 업스트림 서버로부터 유효한 응답을 받지 못했을 때 발생합니다. 앱 서버 다운, 커넥션 풀 고갈, 타임아웃 등이 원인입니다.",
        stepJump: 4,
      },
      {
        moduleId: httpModule.id,
        type: "true-false",
        question:
          "재시도 폭풍(retry storm)은 장애 서버에 더 많은 부하를 가해 장애를 악화시킨다.",
        options: JSON.stringify(["참", "거짓"]),
        correctAnswer: "0",
        explanation:
          "재시도가 동시에 발생하면 이미 과부하 상태인 서버에 추가 요청이 쏟아져 회복을 방해합니다. 지수 백오프와 jitter가 이를 완화합니다.",
        stepJump: 6,
      },
    ],
  })

  // Concurrency module questions
  await prisma.quizQuestion.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: concurrencyModule.id,
        type: "multiple-choice",
        question: "데드락이 발생하기 위한 4가지 조건에 포함되지 않는 것은?",
        options: JSON.stringify([
          "상호 배제 (Mutual Exclusion)",
          "점유 대기 (Hold and Wait)",
          "선점 (Preemption)",
          "순환 대기 (Circular Wait)",
        ]),
        correctAnswer: "2",
        explanation:
          "데드락 4조건은 상호배제, 점유대기, 비선점(No Preemption), 순환대기입니다. '선점'은 데드락 조건이 아니라 오히려 데드락을 방지하는 방법입니다.",
        stepJump: 2,
      },
      {
        moduleId: concurrencyModule.id,
        type: "multiple-choice",
        question:
          "Node.js에서 setTimeout(fn, 0)이 즉시 실행되지 않는 이유는?",
        options: JSON.stringify([
          "최소 지연 시간이 1ms이기 때문",
          "콜백이 태스크 큐에 들어가고 콜 스택이 비어야 실행되기 때문",
          "setTimeout은 항상 비동기 I/O를 기다리기 때문",
          "Node.js가 타이머를 배치 처리하기 때문",
        ]),
        correctAnswer: "1",
        explanation:
          "setTimeout(fn, 0)은 콜백을 매크로태스크 큐에 넣습니다. 이벤트 루프는 현재 콜 스택의 모든 동기 코드와 마이크로태스크를 먼저 처리한 후에야 매크로태스크 큐를 확인합니다.",
        stepJump: 0,
      },
      {
        moduleId: concurrencyModule.id,
        type: "true-false",
        question:
          "이벤트 루프 모델은 CPU 집약적 작업에서 멀티스레드보다 항상 효율적이다.",
        options: JSON.stringify(["참", "거짓"]),
        correctAnswer: "1",
        explanation:
          "이벤트 루프는 I/O 바운드 작업에 효율적이지만, CPU 집약적 작업에서는 싱글 스레드가 블로킹되어 성능이 저하됩니다. Worker threads나 멀티프로세스가 더 적합합니다.",
        stepJump: 1,
      },
    ],
  })

  // Git module questions
  await prisma.quizQuestion.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: gitModule.id,
        type: "multiple-choice",
        question: "git add 명령어는 파일을 어디로 이동시키나요?",
        options: JSON.stringify([
          "Working Tree → Remote",
          "Working Tree → Index (Staging Area)",
          "Index → Local Repository",
          "Local Repository → Remote",
        ]),
        correctAnswer: "1",
        explanation:
          "git add는 Working Tree의 변경사항을 Index(Staging Area)로 복사합니다. 이 중간 단계 덕분에 커밋할 변경사항을 세밀하게 선택할 수 있습니다.",
        stepJump: 0,
      },
      {
        moduleId: gitModule.id,
        type: "multiple-choice",
        question: "rebase와 merge의 가장 큰 차이점은?",
        options: JSON.stringify([
          "rebase는 충돌이 발생하지 않는다",
          "merge는 새 커밋을 만들고, rebase는 커밋 히스토리를 재작성한다",
          "rebase는 원격에서만 사용할 수 있다",
          "merge는 브랜치를 삭제한다",
        ]),
        correctAnswer: "1",
        explanation:
          "merge는 두 브랜치의 히스토리를 보존하면서 머지 커밋을 만듭니다. rebase는 커밋을 다른 베이스 위로 재배치하여 선형 히스토리를 만듭니다.",
        stepJump: 2,
      },
      {
        moduleId: gitModule.id,
        type: "true-false",
        question:
          "git commit은 Working Tree의 모든 변경사항을 자동으로 포함한다.",
        options: JSON.stringify(["참", "거짓"]),
        correctAnswer: "1",
        explanation:
          "git commit은 Index(Staging Area)에 있는 변경사항만 포함합니다. Working Tree의 변경사항을 포함하려면 먼저 git add로 스테이징해야 합니다.",
        stepJump: 1,
      },
    ],
  })

  // ─── Diagnostic Questions ──────────────────────────────

  await prisma.diagnosticQuestion.createMany({
    skipDuplicates: true,
    data: [
      // ── Networking (5 questions) ──
      {
        category: "networking",
        difficulty: "easy",
        question: "HTTP 상태 코드 200은 무엇을 의미하나요?",
        options: JSON.stringify(["요청 리다이렉트", "성공적인 요청", "서버 오류", "인증 필요"]),
        correctAnswer: "1",
        explanation: "HTTP 200은 요청이 성공적으로 처리되었음을 나타내는 상태 코드입니다.",
        relatedModuleId: httpModule.id,
      },
      {
        category: "networking",
        difficulty: "easy",
        question: "DNS의 주요 역할은 무엇인가요?",
        options: JSON.stringify(["데이터 암호화", "도메인 이름을 IP 주소로 변환", "파일 전송", "패킷 라우팅"]),
        correctAnswer: "1",
        explanation: "DNS(Domain Name System)는 사람이 읽을 수 있는 도메인 이름(예: google.com)을 컴퓨터가 이해할 수 있는 IP 주소로 변환합니다.",
        relatedModuleId: httpModule.id,
      },
      {
        category: "networking",
        difficulty: "medium",
        question: "TCP 3-way handshake의 올바른 순서는?",
        options: JSON.stringify(["SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "SYN-ACK → SYN → ACK"]),
        correctAnswer: "1",
        explanation: "TCP 연결 수립은 클라이언트가 SYN을 보내고, 서버가 SYN-ACK으로 응답하고, 클라이언트가 ACK을 보내는 3단계로 이루어집니다.",
        relatedModuleId: httpModule.id,
      },
      {
        category: "networking",
        difficulty: "medium",
        question: "HTTPS에서 TLS 핸드셰이크가 수행하는 주요 작업이 아닌 것은?",
        options: JSON.stringify(["서버 인증서 검증", "암호화 키 교환", "DNS 캐시 업데이트", "암호화 알고리즘 협상"]),
        correctAnswer: "2",
        explanation: "TLS 핸드셰이크는 인증서 검증, 키 교환, 알고리즘 협상을 수행합니다. DNS 캐시 업데이트는 TLS와 무관한 별도 프로세스입니다.",
        relatedModuleId: httpModule.id,
      },
      {
        category: "networking",
        difficulty: "hard",
        question: "로드밸런서의 'Least Connections' 알고리즘은 어떤 기준으로 요청을 분배하나요?",
        options: JSON.stringify(["응답 시간이 가장 빠른 서버", "현재 연결 수가 가장 적은 서버", "라운드 로빈 순서", "CPU 사용률이 가장 낮은 서버"]),
        correctAnswer: "1",
        explanation: "Least Connections 알고리즘은 현재 활성 연결 수가 가장 적은 서버에 새 요청을 보내, 부하를 균등하게 분산합니다.",
        relatedModuleId: httpModule.id,
      },
      // ── Concurrency (5 questions) ──
      {
        category: "concurrency",
        difficulty: "easy",
        question: "프로세스와 스레드의 가장 큰 차이점은?",
        options: JSON.stringify(["스레드가 더 느리다", "프로세스는 메모리를 공유하지 않고, 스레드는 같은 프로세스 내 메모리를 공유한다", "프로세스는 OS에서만 실행된다", "스레드는 단일 코어에서만 실행된다"]),
        correctAnswer: "1",
        explanation: "프로세스는 독립적인 메모리 공간을 가지지만, 같은 프로세스 내의 스레드들은 힙 메모리를 공유합니다. 이것이 스레드 간 통신이 빠르지만 동기화 문제가 생기는 이유입니다.",
        relatedModuleId: concurrencyModule.id,
      },
      {
        category: "concurrency",
        difficulty: "easy",
        question: "Race condition이란 무엇인가요?",
        options: JSON.stringify(["프로세스가 경주하듯 빠르게 실행되는 것", "두 이상의 스레드가 공유 데이터에 동시에 접근하여 결과가 실행 순서에 따라 달라지는 상황", "스레드 풀이 꽉 찬 상태", "CPU 코어 간 성능 경쟁"]),
        correctAnswer: "1",
        explanation: "Race condition은 여러 스레드가 공유 자원에 동시에 접근할 때, 실행 타이밍에 따라 결과가 달라지는 버그입니다. 뮤텍스나 세마포어로 방지합니다.",
        relatedModuleId: concurrencyModule.id,
      },
      {
        category: "concurrency",
        difficulty: "medium",
        question: "뮤텍스(Mutex)와 세마포어(Semaphore)의 차이는?",
        options: JSON.stringify(["뮤텍스는 하나의 스레드만 접근 허용, 세마포어는 N개까지 허용", "둘은 완전히 같은 개념이다", "세마포어가 더 느리다", "뮤텍스는 읽기 전용이다"]),
        correctAnswer: "0",
        explanation: "뮤텍스는 binary lock으로 한 번에 하나의 스레드만 임계 구역에 접근할 수 있습니다. 세마포어는 카운터 기반으로 최대 N개의 스레드가 동시에 접근할 수 있습니다.",
        relatedModuleId: concurrencyModule.id,
      },
      {
        category: "concurrency",
        difficulty: "medium",
        question: "JavaScript의 이벤트 루프에서 마이크로태스크와 매크로태스크의 실행 순서는?",
        options: JSON.stringify(["매크로태스크 먼저", "마이크로태스크 먼저", "동시에 실행", "랜덤 순서"]),
        correctAnswer: "1",
        explanation: "이벤트 루프는 각 매크로태스크 실행 후, 다음 매크로태스크로 넘어가기 전에 마이크로태스크 큐를 모두 비웁니다. Promise.then은 마이크로태스크, setTimeout은 매크로태스크입니다.",
        relatedModuleId: concurrencyModule.id,
      },
      {
        category: "concurrency",
        difficulty: "hard",
        question: "데드락 방지를 위한 '자원 순서 규약(Resource Ordering)'의 원리는?",
        options: JSON.stringify(["모든 자원에 우선순위를 부여하고, 항상 낮은 번호부터 획득하도록 강제", "자원을 사용한 후 즉시 해제", "타임아웃을 설정하여 대기 제한", "모든 자원을 한 번에 획득"]),
        correctAnswer: "0",
        explanation: "자원에 전역적 순서를 부여하고 모든 스레드가 같은 순서로 자원을 획득하면, 순환 대기(circular wait) 조건이 성립하지 않아 데드락을 구조적으로 방지할 수 있습니다.",
        relatedModuleId: concurrencyModule.id,
      },
      // ── Version Control (5 questions) ──
      {
        category: "version-control",
        difficulty: "easy",
        question: "git status 명령어는 무엇을 보여주나요?",
        options: JSON.stringify(["커밋 히스토리", "작업 디렉토리와 스테이징 영역의 상태", "원격 저장소 목록", "브랜치 간 차이"]),
        correctAnswer: "1",
        explanation: "git status는 현재 브랜치, 스테이징된 변경사항, 스테이징되지 않은 변경사항, 추적되지 않는 파일 등 작업 상태를 보여줍니다.",
        relatedModuleId: gitModule.id,
      },
      {
        category: "version-control",
        difficulty: "easy",
        question: "git clone과 git fork의 차이점은?",
        options: JSON.stringify(["clone은 로컬 복사, fork는 원격 저장소의 독립적 복사본 생성", "둘은 같은 명령어다", "fork는 브랜치를 만든다", "clone은 특정 파일만 복사한다"]),
        correctAnswer: "0",
        explanation: "git clone은 원격 저장소를 로컬에 복사합니다. Fork(GitHub 기능)는 다른 사람의 저장소를 자신의 계정에 독립적인 복사본으로 만들어, 자유롭게 수정 후 PR을 보낼 수 있게 합니다.",
        relatedModuleId: gitModule.id,
      },
      {
        category: "version-control",
        difficulty: "medium",
        question: "git stash의 용도는?",
        options: JSON.stringify(["커밋을 삭제하는 것", "현재 변경사항을 임시 저장하고 워킹 디렉토리를 깨끗하게 만드는 것", "원격에 푸시하는 것", "브랜치를 병합하는 것"]),
        correctAnswer: "1",
        explanation: "git stash는 아직 커밋하지 않은 변경사항을 스택에 임시 저장합니다. 급히 다른 브랜치로 전환해야 할 때 유용하며, git stash pop으로 복원할 수 있습니다.",
        relatedModuleId: gitModule.id,
      },
      {
        category: "version-control",
        difficulty: "medium",
        question: "git rebase와 git merge의 히스토리 차이는?",
        options: JSON.stringify(["rebase는 선형 히스토리, merge는 병합 커밋을 생성", "둘 다 같은 히스토리를 만든다", "merge만 충돌이 발생한다", "rebase는 커밋을 삭제한다"]),
        correctAnswer: "0",
        explanation: "merge는 두 브랜치의 히스토리를 보존하며 병합 커밋을 만듭니다. rebase는 커밋을 다른 베이스 위로 재배치하여 깔끔한 선형 히스토리를 만듭니다.",
        relatedModuleId: gitModule.id,
      },
      {
        category: "version-control",
        difficulty: "hard",
        question: "git cherry-pick의 적절한 사용 사례는?",
        options: JSON.stringify(["전체 브랜치를 병합할 때", "특정 커밋 하나만 다른 브랜치에 적용할 때", "충돌을 해결할 때", "원격 저장소를 동기화할 때"]),
        correctAnswer: "1",
        explanation: "cherry-pick은 특정 커밋을 선택적으로 현재 브랜치에 적용합니다. 핫픽스를 여러 브랜치에 적용하거나, 특정 기능 커밋만 가져올 때 유용합니다.",
        relatedModuleId: gitModule.id,
      },
      // ── OS Basics (5 questions) ──
      {
        category: "os-basics",
        difficulty: "easy",
        question: "운영체제의 커널(Kernel)의 주요 역할은?",
        options: JSON.stringify(["웹 브라우저 실행", "하드웨어와 소프트웨어 사이의 중재자 역할", "파일 압축", "네트워크 프로토콜 설계"]),
        correctAnswer: "1",
        explanation: "커널은 OS의 핵심으로, CPU·메모리·I/O 장치 등 하드웨어 자원을 관리하고 프로세스에 안전하게 접근을 제공합니다.",
      },
      {
        category: "os-basics",
        difficulty: "easy",
        question: "가상 메모리(Virtual Memory)의 주요 이점은?",
        options: JSON.stringify(["CPU 속도 향상", "물리 메모리보다 큰 주소 공간을 프로세스에 제공", "디스크 용량 증가", "네트워크 대역폭 확대"]),
        correctAnswer: "1",
        explanation: "가상 메모리는 디스크를 메모리의 확장으로 사용하여, 물리 RAM보다 큰 메모리 공간을 각 프로세스에 제공하고 메모리 보호도 가능하게 합니다.",
      },
      {
        category: "os-basics",
        difficulty: "medium",
        question: "컨텍스트 스위칭(Context Switching)이 비용이 큰 이유는?",
        options: JSON.stringify(["새 프로세스를 생성하기 때문", "CPU 레지스터, 프로그램 카운터 등의 상태를 저장/복원해야 하기 때문", "디스크 I/O가 필요하기 때문", "네트워크 연결을 재설정하기 때문"]),
        correctAnswer: "1",
        explanation: "컨텍스트 스위칭 시 현재 프로세스의 레지스터, PC, 스택 포인터 등을 저장하고 새 프로세스의 상태를 복원해야 합니다. 캐시 미스도 증가하여 추가 오버헤드가 발생합니다.",
      },
      {
        category: "os-basics",
        difficulty: "medium",
        question: "페이지 폴트(Page Fault)란?",
        options: JSON.stringify(["메모리 누수가 발생한 상태", "프로세스가 접근하려는 페이지가 물리 메모리에 없어 디스크에서 로드해야 하는 상황", "CPU 캐시가 꽉 찬 상태", "잘못된 메모리 주소에 접근한 상태"]),
        correctAnswer: "1",
        explanation: "페이지 폴트는 가상 메모리 시스템에서 요청된 페이지가 RAM에 없을 때 발생합니다. OS가 디스크에서 해당 페이지를 읽어와 물리 메모리에 로드하므로 상대적으로 느립니다.",
      },
      {
        category: "os-basics",
        difficulty: "hard",
        question: "스케줄링 알고리즘 중 Starvation(기아 현상)이 발생할 수 있는 것은?",
        options: JSON.stringify(["Round Robin", "Shortest Job First (SJF)", "First Come First Served (FCFS)", "Multilevel Feedback Queue"]),
        correctAnswer: "1",
        explanation: "SJF에서는 짧은 작업이 계속 들어오면 긴 작업이 영원히 실행되지 못하는 기아 현상이 발생할 수 있습니다. Aging 기법으로 이를 완화할 수 있습니다.",
      },
      // ── Data Structures (5 questions) ──
      {
        category: "data-structures",
        difficulty: "easy",
        question: "배열(Array)과 연결 리스트(Linked List)에서 인덱스로 요소에 접근하는 시간 복잡도는?",
        options: JSON.stringify(["배열 O(1), 연결 리스트 O(1)", "배열 O(n), 연결 리스트 O(1)", "배열 O(1), 연결 리스트 O(n)", "배열 O(n), 연결 리스트 O(n)"]),
        correctAnswer: "2",
        explanation: "배열은 연속 메모리에 저장되어 인덱스로 O(1) 접근이 가능합니다. 연결 리스트는 포인터를 따라가야 하므로 O(n)이 필요합니다.",
      },
      {
        category: "data-structures",
        difficulty: "easy",
        question: "스택(Stack)의 데이터 접근 방식은?",
        options: JSON.stringify(["FIFO (First In, First Out)", "LIFO (Last In, First Out)", "랜덤 접근", "우선순위 기반"]),
        correctAnswer: "1",
        explanation: "스택은 LIFO 구조로, 마지막에 넣은 데이터가 가장 먼저 나옵니다. 함수 호출 스택, Undo 기능 등에 사용됩니다.",
      },
      {
        category: "data-structures",
        difficulty: "medium",
        question: "해시 테이블에서 충돌(Collision) 해결 방법이 아닌 것은?",
        options: JSON.stringify(["체이닝(Chaining)", "오픈 어드레싱(Open Addressing)", "이진 탐색(Binary Search)", "더블 해싱(Double Hashing)"]),
        correctAnswer: "2",
        explanation: "해시 충돌 해결에는 체이닝(연결 리스트), 오픈 어드레싱(선형/이차 탐사), 더블 해싱 등이 사용됩니다. 이진 탐색은 정렬된 배열에서의 검색 알고리즘으로 해시 충돌과 무관합니다.",
      },
      {
        category: "data-structures",
        difficulty: "medium",
        question: "이진 탐색 트리(BST)에서 검색의 평균 시간 복잡도는?",
        options: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n log n)"]),
        correctAnswer: "1",
        explanation: "균형 잡힌 BST에서 검색은 매 단계에서 절반의 노드를 제거하므로 O(log n)입니다. 하지만 편향된 트리에서는 최악 O(n)이 될 수 있어 AVL, Red-Black 트리 등이 필요합니다.",
      },
      {
        category: "data-structures",
        difficulty: "hard",
        question: "그래프에서 BFS와 DFS의 공간 복잡도 차이는?",
        options: JSON.stringify(["BFS O(V), DFS O(V) - 동일", "BFS가 일반적으로 더 많은 메모리를 사용 (큐에 같은 레벨의 모든 노드 저장)", "DFS가 항상 더 많은 메모리를 사용", "둘 다 O(1)"]),
        correctAnswer: "1",
        explanation: "BFS는 큐에 현재 레벨의 모든 인접 노드를 저장하므로 너비가 넓은 그래프에서 메모리를 많이 사용합니다. DFS는 스택에 현재 경로의 노드만 저장하므로 일반적으로 메모리 효율적입니다.",
      },
    ],
  })

  // ─── Apply Tasks ───────────────────────────────────────

  await prisma.applyTask.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: httpModule.id,
        prompt:
          "아래 서버 로그를 보고, 502 에러의 가장 가능성 높은 원인을 선택하세요.\n\n[2025-01-15 14:32:01] INFO  Request received: GET /api/users\n[2025-01-15 14:32:01] INFO  DNS resolved: 10.0.3.42 (2ms)\n[2025-01-15 14:32:01] INFO  TCP connected (15ms)\n[2025-01-15 14:32:02] INFO  TLS handshake complete (45ms)\n[2025-01-15 14:32:02] INFO  LB forwarded to app-server-03\n[2025-01-15 14:32:02] WARN  app-server-03: connection pool exhausted\n[2025-01-15 14:32:32] ERROR upstream timeout (30000ms)\n[2025-01-15 14:32:32] ERROR 502 Bad Gateway returned to client",
        solution: "앱 서버 커넥션 풀 고갈",
        hints: [
          "WARN 로그를 주목하세요",
          "connection pool exhausted는 어떤 의미일까요?",
          "타임아웃(30초)이 발생한 이유를 생각해보세요",
        ],
      },
      {
        moduleId: concurrencyModule.id,
        prompt:
          "다음 코드에서 데드락이 발생할 수 있는 이유를 설명하고, 해결 방법을 제시하세요.\n\n// Thread A\nlock(resource1);\nlock(resource2);\n// work\nunlock(resource2);\nunlock(resource1);\n\n// Thread B\nlock(resource2);\nlock(resource1);\n// work\nunlock(resource1);\nunlock(resource2);",
        solution:
          "두 스레드가 서로 다른 순서로 리소스를 잠그므로 순환 대기가 발생합니다. 해결: 모든 스레드가 같은 순서로 리소스를 잠그도록 합니다 (resource1 → resource2).",
        hints: [
          "Thread A와 B가 리소스를 잠그는 순서를 비교하세요",
          "데드락 4조건 중 '순환 대기'를 생각하세요",
          "리소스 획득 순서를 통일하면 어떻게 될까요?",
        ],
      },
      {
        moduleId: gitModule.id,
        prompt:
          "다음 상황에서 rebase와 merge 중 어떤 것을 선택해야 할까요? 이유를 설명하세요.\n\n상황: feature 브랜치에서 작업 중인데, main 브랜치에 다른 팀원의 커밋이 추가되었습니다. feature 브랜치를 최신 main과 동기화하고 싶습니다. 아직 feature 브랜치를 원격에 push하지 않았습니다.",
        solution:
          "rebase를 선택합니다. 아직 push하지 않은 로컬 브랜치이므로 히스토리 재작성이 안전하며, 선형 히스토리를 유지할 수 있습니다.",
        hints: [
          "push 여부가 왜 중요할까요?",
          "이미 공유된 커밋을 rebase하면 어떤 문제가 생길까요?",
          "선형 히스토리의 장점을 생각해보세요",
        ],
      },
    ],
  })

  console.log("Seed completed successfully!")
  console.log(
    `  Modules: ${httpModule.slug}, ${concurrencyModule.slug}, ${gitModule.slug}`
  )
  console.log("  Diagnostic questions: 25 (5 per category)")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
