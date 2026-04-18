import { calculateRisk } from './risk-engine/index.js';

// Mock process.env
process.env.RISK_ALPHA = 0.4;
process.env.RISK_BETA = 0.4;
process.env.RISK_GAMMA = 0.2;

const testCases = [
    { s: 0.5, e: 0.5, sen: 0.5, expected: 0.5 },
    { s: 5, e: -0.8, sen: 0.5, expected: 0.5 }, // Test clamping: s->1, e->0, sen->0.5 => 0.4*1 + 0.4*0 + 0.2*0.5 = 0.5
    { s: 1, e: 1, sen: 1, expected: 1 },
    { s: 0, e: 0, sen: 0, expected: 0 },
    { s: NaN, e: 0.5, sen: 0.5, expected: 0.3 } // Test NaN: s->0, e->0.5, sen->0.5 => 0.4*0 + 0.4*0.5 + 0.2*0.5 = 0.3
];

console.log("Testing Risk Engine...");
testCases.forEach((tc, i) => {
    const result = calculateRisk(tc.s, tc.e, tc.sen);
    console.log(`Test Case ${i + 1}: Input(${tc.s}, ${tc.e}, ${tc.sen}) => Score: ${result.score}, Classification: ${result.classification}`);
    if (Math.abs(result.score - tc.expected) < 0.0001) {
        console.log("PASSED");
    } else {
        console.log(`FAILED: Expected ${tc.expected}, got ${result.score}`);
    }
});
