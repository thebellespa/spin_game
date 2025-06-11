// SVG 요소와 버튼, 결과 영역을 선택합니다.
const svg = document.getElementById('rouletteSVG');
const spinButton = document.getElementById('spinButton');
const result = document.getElementById('result');

// 룰렛에 들어갈 항목 배열입니다.
const items = [
    '더벨코즈롤온',
    '10% 할인',
    '발관리 10분',
    '수분마스크',
    '브레인테라피10분',
    '꽝, 한번더!'
];

// SVG의 중심 좌표와 반지름을 정의합니다.
const cx = 150; // 중심 x좌표
const cy = 150; // 중심 y좌표
const r = 140;  // 원판 반지름

// 각 섹터의 색상 배열입니다.
const colors = ['#bdbdbd', '#ffe0b2', '#bca37f', '#ffb6b9', '#b5ead7', '#b0d0ff'];

// 룰렛이 회전 중인지 여부를 저장합니다.
let isSpinning = false;
// 현재 회전 각도를 저장합니다.
let currentRotate = 0;

// SVG로 방사형 섹터와 텍스트를 그리는 함수입니다.
function drawRoulette() {
    // SVG 내부를 비웁니다.
    svg.innerHTML = '';
    // 섹터 개수
    const n = items.length;
    // 각 섹터의 각도(라디안)
    const angle = 2 * Math.PI / n;

    // 각 섹터를 순회하며 그립니다.
    for (let i = 0; i < n; i++) {
        // 시작 각도와 끝 각도를 계산합니다.
        const startAngle = i * angle - Math.PI / 2; // 12시 방향부터 시작
        const endAngle = startAngle + angle;

        // 섹터의 시작점과 끝점 좌표를 계산합니다.
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        // 큰 원호인지(180도 초과) 여부
        const largeArcFlag = angle > Math.PI ? 1 : 0;

        // SVG path 데이터(섹터)를 만듭니다.
        const d = [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${r} ${r} 0 0 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        // path 요소를 생성하여 색상을 지정합니다.
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', colors[i % colors.length]);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2');
        svg.appendChild(path);

        // 텍스트를 섹터의 중앙에 배치합니다.
        // 각 섹터의 중앙 각도
        const textAngle = startAngle + angle / 2;
        // 텍스트 위치(중앙에서 80% 지점)
        const tx = cx + (r * 0.65) * Math.cos(textAngle);
        const ty = cy + (r * 0.65) * Math.sin(textAngle);

        // 텍스트 요소 생성
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('fill', '#333');
        text.setAttribute('font-size', '18');
        text.setAttribute('font-family', 'NexonGothic, sans-serif');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        // 텍스트를 섹터 각도에 맞게 회전
        text.setAttribute('transform', `rotate(${(textAngle * 180 / Math.PI)}, ${tx}, ${ty})`);
        text.textContent = items[i];
        svg.appendChild(text);
    }

    // 가운데 원(디자인용)
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', cx);
    centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', 40);
    centerCircle.setAttribute('fill', '#fff');
    centerCircle.setAttribute('stroke', '#eee');
    centerCircle.setAttribute('stroke-width', '2');
    svg.appendChild(centerCircle);
}

// 폭죽 효과 함수
function showConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // 여러 방향에서 폭죽 발사
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// 랜덤 각도 생성 함수
function getRandomDegree() {
    // 섹터 개수
    const n = items.length;
    // 각 섹터의 중앙 각도(0~360)
    const baseAngle = 360 / n;
    // 랜덤 섹터 선택
    const randomSection = Math.floor(Math.random() * n);
    // 섹터 중앙에 멈추도록 각도 계산
    const stopAngle = 360 - (randomSection * baseAngle + baseAngle / 2);
    // 여러 바퀴(5바퀴) + 멈출 각도
    return 360 * 5 + stopAngle;
}

// 룰렛 회전 함수
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;
    result.textContent = '';

    // 랜덤 각도 생성
    const degree = getRandomDegree();
    // SVG 전체를 회전시키기 위해 transform 적용
    svg.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    svg.style.transform = `rotate(${degree + currentRotate}deg)`;

    // 3초 후 결과 표시
    setTimeout(() => {
        // 회전이 끝난 후의 각도 계산
        currentRotate = (degree + currentRotate) % 360;
        // 섹터 인덱스 계산(0이 12시 방향)
        const n = items.length;
        const baseAngle = 360 / n;
        // 0~360에서 12시 방향이 0도이므로, (360 - currentRotate) 기준
        let selected = Math.floor(((currentRotate + baseAngle / 2) % 360) / baseAngle);
        selected = (n - selected) % n;
        const selectedItem = items[selected];
        // 결과 표시
        result.textContent = `축하합니다! ${selectedItem}에 당첨되셨습니다!`;
        // 폭죽 효과
        showConfetti();
        // 상태 초기화
        isSpinning = false;
        spinButton.disabled = false;
    }, 3000);
}

// SVG 룰렛을 처음 그립니다.
drawRoulette();
// 시작 버튼에 이벤트 리스너를 추가합니다.
spinButton.addEventListener('click', spinWheel); 