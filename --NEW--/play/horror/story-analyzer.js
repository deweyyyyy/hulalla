/**
 * Horror Story Path Analyzer
 * วิเคราะห์เส้นทางและจุดจบทั้งหมดของเกม Horror Story
 * 
 * Usage: node story-analyzer.js
 */

const fs = require('fs');

// อ่านไฟล์ script33.js
const scriptContent = fs.readFileSync('script33.js', 'utf8');

// ========== IMPROVED EXTRACT DATA ==========

// หา scene ทั้งหมดและข้อมูลของแต่ละ scene
function extractAllSceneData() {
    const scenes = {};
    
    // ดึง scene names ทั้งหมด - หาจาก pattern ชื่อ scene
    const scenePattern = /^\s{8,16}([a-z_][a-z_0-9]*):\s*\{/gmi;
    const sceneMatches = [...scriptContent.matchAll(scenePattern)];
    const sceneNames = sceneMatches.map(m => m[1]);
    
    // กรอง duplicates
    const uniqueSceneNames = [...new Set(sceneNames)];
    
    uniqueSceneNames.forEach(name => {
        // หาว่า scene นี้มี choices หรือ ending โดยดูจาก block
        const sceneStartPattern = new RegExp(`\\b${name}:\\s*\\{`, 'g');
        const matches = [...scriptContent.matchAll(sceneStartPattern)];
        
        if (matches.length > 0) {
            const startIndex = matches[0].index;
            // หา block ที่สมบูรณ์ (นับ { และ })
            let depth = 0;
            let endIndex = startIndex;
            let foundStart = false;
            
            for (let i = startIndex; i < scriptContent.length && i < startIndex + 3000; i++) {
                if (scriptContent[i] === '{') {
                    depth++;
                    foundStart = true;
                } else if (scriptContent[i] === '}') {
                    depth--;
                    if (foundStart && depth === 0) {
                        endIndex = i + 1;
                        break;
                    }
                }
            }
            
            const block = scriptContent.substring(startIndex, endIndex);
            
            // หา choices
            const choicesMatch = block.match(/choices:\s*\[([\s\S]*?)\]/);
            const choices = choicesMatch ? 
                [...choicesMatch[1].matchAll(/next:\s*["'](\w+)["']/g)].map(m => m[1]) : 
                [];
            
            // หา ending
            const hasEnding = block.includes('ending:') && 
                              (block.includes('type:') || block.includes('title:'));
            
            let endingData = null;
            if (hasEnding) {
                const typeMatch = block.match(/type:\s*["'](\w+)["']/);
                const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
                const braveryMatch = block.match(/bravery:\s*["']([^"']+)["']/);
                
                if (typeMatch || titleMatch) {
                    endingData = {
                        type: typeMatch ? typeMatch[1] : 'unknown',
                        title: titleMatch ? titleMatch[1] : 'Unknown Ending',
                        bravery: braveryMatch ? braveryMatch[1] : 'N/A'
                    };
                }
            }
            
            scenes[name] = {
                choices: choices,
                hasEnding: hasEnding,
                ending: endingData
            };
        }
    });
    
    return scenes;
}

// ========== ANALYSIS FUNCTIONS ==========

// หา scene ที่เข้าถึงได้จาก start
function findReachableScenes(startScene, scenes) {
    const reachable = new Set();
    const queue = [startScene];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (reachable.has(current)) continue;
        reachable.add(current);
        
        const scene = scenes[current];
        if (scene && scene.choices) {
            scene.choices.forEach(next => {
                if (!reachable.has(next)) {
                    queue.push(next);
                }
            });
        }
    }
    
    return reachable;
}

// ========== MAIN ANALYSIS ==========

console.log('🎃 Horror Story Path Analyzer v2');
console.log('='.repeat(60));
console.log('');

const scenes = extractAllSceneData();
const sceneNames = Object.keys(scenes);

console.log('📊 สรุปข้อมูลเบื้องต้น');
console.log('-'.repeat(40));
console.log(`• Scene ทั้งหมด: ${sceneNames.length} scenes`);

// หา scene ที่ถูกอ้างอิง
const allNextScenes = new Set();
sceneNames.forEach(name => {
    const scene = scenes[name];
    if (scene.choices) {
        scene.choices.forEach(next => allNextScenes.add(next));
    }
});
console.log(`• Scene ที่ถูกอ้างอิง: ${allNextScenes.size} scenes`);

// หา missing scenes
const missingScenes = [...allNextScenes].filter(s => !scenes[s]);
console.log('');
console.log('❌ Scene ที่หายไป (ถูกอ้างอิงแต่ไม่มี):');
if (missingScenes.length === 0) {
    console.log('   ✅ ไม่มี scene ที่หายไป!');
} else {
    missingScenes.forEach(s => console.log(`   - ${s}`));
}

// หา orphan scenes
const orphanScenes = sceneNames.filter(s => !allNextScenes.has(s) && s !== 'start');
console.log('');
console.log('🔗 Scene ที่ไม่มีใครอ้างถึง (orphans):');
if (orphanScenes.length === 0) {
    console.log('   ✅ ไม่มี orphan scene!');
} else {
    orphanScenes.forEach(s => console.log(`   - ${s}`));
}

// หา reachable scenes
const reachable = findReachableScenes('start', scenes);
console.log('');
console.log(`🚀 Scene ที่เข้าถึงได้จาก start: ${reachable.size} scenes`);
const unreachable = sceneNames.filter(s => !reachable.has(s));
console.log(`⚠️  Scene ที่เข้าถึงไม่ได้: ${unreachable.length} scenes`);
if (unreachable.length > 0) {
    unreachable.slice(0, 15).forEach(s => console.log(`   - ${s}`));
    if (unreachable.length > 15) {
        console.log(`   ... และอีก ${unreachable.length - 15} scenes`);
    }
}

// แสดง endings ทั้งหมด
console.log('');
console.log('🏁 รายการ Ending ทั้งหมด');
console.log('-'.repeat(40));

const endings = [];
sceneNames.forEach(name => {
    if (scenes[name].hasEnding && scenes[name].ending) {
        endings.push({ sceneId: name, ...scenes[name].ending });
    }
});

const goodEndings = endings.filter(e => e.type === 'good');
const badEndings = endings.filter(e => e.type === 'bad');
const neutralEndings = endings.filter(e => e.type === 'neutral');

console.log(`\n🟢 Good Endings (${goodEndings.length}):`);
goodEndings.forEach((e, i) => {
    console.log(`   ${i+1}. ${e.title} (${e.bravery}) - scene: ${e.sceneId}`);
});

console.log(`\n🔴 Bad Endings (${badEndings.length}):`);
badEndings.forEach((e, i) => {
    console.log(`   ${i+1}. ${e.title} (${e.bravery}) - scene: ${e.sceneId}`);
});

console.log(`\n🟡 Neutral Endings (${neutralEndings.length}):`);
neutralEndings.forEach((e, i) => {
    console.log(`   ${i+1}. ${e.title} (${e.bravery}) - scene: ${e.sceneId}`);
});

// หา scenes ที่เป็น ending (ไม่มี choices และไม่มี ending object)
const deadEndScenes = sceneNames.filter(name => {
    const scene = scenes[name];
    return (!scene.choices || scene.choices.length === 0) && !scene.hasEnding;
});

console.log(`\n⚠️  Dead-End Scenes (ไม่มี choices และไม่มี ending): ${deadEndScenes.length}`);
if (deadEndScenes.length > 0) {
    deadEndScenes.forEach(s => console.log(`   - ${s}`));
}

console.log('');
console.log('='.repeat(60));
console.log(`📈 สรุป:`);
console.log(`   • Total Endings: ${endings.length}`);
console.log(`   • Good: ${goodEndings.length} | Bad: ${badEndings.length} | Neutral: ${neutralEndings.length}`);
console.log(`   • Missing Scenes: ${missingScenes.length}`);
console.log(`   • Dead-End Issues: ${deadEndScenes.length}`);
console.log('');

if (missingScenes.length === 0 && deadEndScenes.length === 0) {
    console.log('✅ เกมมีโครงสร้างสมบูรณ์! พร้อมเล่นได้');
} else {
    console.log('⚠️  มีปัญหาที่ต้องแก้ไข');
}
console.log('');

// สร้าง JSON summary
const summary = {
    totalScenes: sceneNames.length,
    reachableScenes: reachable.size,
    totalEndings: endings.length,
    goodEndings: goodEndings.length,
    badEndings: badEndings.length,
    neutralEndings: neutralEndings.length,
    missingScenes: missingScenes,
    orphanScenes: orphanScenes,
    unreachableScenes: unreachable,
    deadEndScenes: deadEndScenes,
    endingsList: endings
};

fs.writeFileSync('story-analysis.json', JSON.stringify(summary, null, 2));
console.log('📄 บันทึกผลการวิเคราะห์ไว้ที่ story-analysis.json');
